// =========================================
// ProofPlate — restaurant-page.js
// =========================================

const CHECKLIST_LABELS = {
  gloves:           { icon: '🧤', label: 'Gloves Worn' },
  hairCap:          { icon: '🪖', label: 'Hair Cap Used' },
  cleanSurface:     { icon: '🧹', label: 'Clean Surface' },
  freshIngredients: { icon: '🥦', label: 'Fresh Ingredients' },
  tempCheck:        { icon: '🌡️', label: 'Temperature Check' }
};

const BREAKDOWN_META = {
  complaints: { icon: '📋', label: 'No Complaints' },
  votes:      { icon: '🗳️', label: 'Community Votes' },
  checklist:  { icon: '✅', label: 'Checklist Score' }
};

// ── State ─────────────────────────────────
let restaurant = null;
let positiveVotes = 0;
let negativeVotes = 0;
let hasVoted = false;

// ── Load from URL ─────────────────────────
function getQueryParam(p) {
  return new URLSearchParams(window.location.search).get(p);
}

function init() {
  const id = getQueryParam('id') || 'r1';
  restaurant = getRestaurantById(id);

  if (!restaurant) {
    document.getElementById('restName').textContent = 'Restaurant not found';
    return;
  }

  positiveVotes = restaurant.positiveVotes;
  negativeVotes = restaurant.negativeVotes;

  renderHero();
  renderScore();
  renderProof();
  renderVotes();
  renderBreakdown();
  renderChecklist();
  renderQuickStats();

  // Set report link with id
  document.getElementById('reportBtn').href = `report.html?id=${restaurant.id}`;
  document.title = `${restaurant.name} — ProofPlate 🍽️`;
}

// ── Hero ──────────────────────────────────
function renderHero() {
  document.getElementById('restName').textContent    = restaurant.name;
  document.getElementById('restCuisine').textContent = restaurant.cuisine;
  document.getElementById('restAddress').textContent = '📍 ' + restaurant.address;
  document.getElementById('breadcrumbName').textContent = restaurant.name;
  document.getElementById('restRating').innerHTML =
    `⭐ <strong>${restaurant.rating}</strong> rating`;

  // Blurred background
  const bg = document.getElementById('heroBg');
  bg.style.backgroundImage = `url('${restaurant.proofImage}')`;
  setTimeout(() => bg.classList.add('loaded'), 100);
}

// ── Score ring ────────────────────────────
function renderScore() {
  const score = restaurant.score;
  const cls   = getScoreClass(score);
  const label = getScoreLabel(score);

  document.getElementById('scoreNum').textContent = score;
  document.getElementById('scoreBadge').textContent = label;
  document.getElementById('scoreBadge').className = `score-status-badge ${cls}`;

  // SVG arc animation
  const arc = document.getElementById('scoreArc');
  arc.className = `score-fill ${cls}`;
  const circumference = 2 * Math.PI * 50; // ~314
  const offset = circumference - (score / 100) * circumference;
  setTimeout(() => { arc.style.strokeDashoffset = offset; }, 200);
}

// ── Proof ─────────────────────────────────
function renderProof() {
  const img = document.getElementById('proofImg');
  img.src = restaurant.proofImage;
  img.alt = `${restaurant.name} kitchen proof`;
  document.getElementById('proofTimestamp').textContent = '📷 Taken ' + restaurant.proofTimestamp;

  const cls = getScoreClass(restaurant.score);
  const live = document.getElementById('proofLiveChip');
  if (restaurant.lastVerified >= 6) {
    live.style.background = 'var(--clr-risk-light)';
    live.style.color      = 'var(--clr-risk-dark)';
    live.style.borderColor = '#fecaca';
    live.innerHTML = '⚠️ Outdated';
  }

  document.getElementById('proofMeta').innerHTML =
    `📅 Verified ${formatVerified(restaurant.lastVerified)} &nbsp;·&nbsp; 📍 ${restaurant.address}`;
}

// ── Votes ─────────────────────────────────
function renderVotes() {
  const total = positiveVotes + negativeVotes;
  const pct   = total > 0 ? Math.round((positiveVotes / total) * 100) : 0;

  document.getElementById('cleanNum').textContent  = positiveVotes;
  document.getElementById('unsafeNum').textContent = negativeVotes;
  document.getElementById('cleanCount').textContent  = `${positiveVotes} Clean`;
  document.getElementById('unsafeCount').textContent = `${negativeVotes} Unsafe`;

  document.getElementById('trustPct').textContent = pct + '%';
  setTimeout(() => {
    document.getElementById('trustBarFill').style.width = pct + '%';
  }, 300);
}

function castVote(isClean) {
  if (hasVoted) {
    showToast('You have already voted!', 'warning');
    return;
  }
  hasVoted = true;

  if (isClean) {
    positiveVotes++;
    document.getElementById('voteClean').classList.add('voted');
    showToast('Thanks for voting 👍 Clean!', 'success');
  } else {
    negativeVotes++;
    document.getElementById('voteUnsafe').classList.add('voted');
    showToast('Thanks for your feedback 👎', 'error');
  }

  // Animate
  const btn = isClean
    ? document.getElementById('voteClean')
    : document.getElementById('voteUnsafe');
  btn.style.transform = 'scale(1.15)';
  setTimeout(() => { btn.style.transform = ''; }, 300);

  renderVotes();
}

// ── Breakdown ─────────────────────────────
function renderBreakdown() {
  const bd = restaurant.scoreBreakdown;
  const items = Object.entries(bd).map(([key, val]) => {
    const meta = BREAKDOWN_META[key] || { icon: '📊', label: key };
    const cls = val >= 80 ? 'safe' : val >= 60 ? 'mod' : 'risk';
    const color = val >= 80 ? 'var(--clr-safe-dark)' : val >= 60 ? 'var(--clr-mod-dark)' : 'var(--clr-risk-dark)';
    return `
      <div class="breakdown-item">
        <div class="breakdown-top">
          <div class="breakdown-name">${meta.icon} ${meta.label}</div>
          <div class="breakdown-val" style="color:${color}">${val}%</div>
        </div>
        <div class="progress-bar">
          <div class="progress-fill ${cls}" style="width:0%" data-target="${val}"></div>
        </div>
      </div>
    `;
  }).join('');

  document.getElementById('breakdownList').innerHTML = items;

  // Animate progress bars
  setTimeout(() => {
    document.querySelectorAll('.progress-fill[data-target]').forEach(el => {
      el.style.width = el.dataset.target + '%';
    });
  }, 400);
}

// ── Checklist ─────────────────────────────
function renderChecklist() {
  const cl    = restaurant.checklist;
  const keys  = Object.keys(cl);
  const pass  = keys.filter(k => cl[k]).length;
  const total = keys.length;

  const html = keys.map(key => {
    const meta  = CHECKLIST_LABELS[key] || { icon: '✔️', label: key };
    const ok    = cl[key];
    return `
      <div class="check-item ${ok ? 'checked' : ''}" style="cursor:default">
        <div class="check-box">${ok ? '✓' : '✗'}</div>
        <span>${meta.icon} ${meta.label}</span>
      </div>
    `;
  }).join('');

  document.getElementById('checklistWrap').innerHTML = html;

  const pct = Math.round((pass / total) * 100);
  const cls = pct >= 80 ? 'safe' : pct >= 60 ? 'mod' : 'risk';
  document.getElementById('checklistScore').className = `checklist-score ${cls}`;
  document.getElementById('checklistScore').textContent = `${pass}/${total} checks passed (${pct}%)`;
}

// ── Quick Stats ───────────────────────────
function renderQuickStats() {
  const r = restaurant;
  const items = [
    { label: '📋 Complaints', val: r.complaints, color: r.complaints === 0 ? 'var(--clr-safe-dark)' : 'var(--clr-risk-dark)' },
    { label: '👍 Clean Votes', val: r.positiveVotes },
    { label: '👎 Unsafe Votes', val: r.negativeVotes },
    { label: '⭐ Rating', val: r.rating + ' / 5' },
    { label: '🕐 Last Verified', val: formatVerified(r.lastVerified) },
  ];

  document.getElementById('quickStats').innerHTML = items.map(item => `
    <div class="qs-item">
      <span class="qs-label">${item.label}</span>
      <span class="qs-val" style="${item.color ? `color:${item.color}` : ''}">${item.val}</span>
    </div>
  `).join('');
}

// ── Boot ──────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
