// =========================================
// ProofPlate — dashboard-page.js
// =========================================

// ── State ─────────────────────────────────
const KITCHEN_ID = 'r1';
let restaurant   = null;
let uploadCount  = 0;
let checkState   = {};
const TOTAL_CHECKS = 5;

const CHECKLIST_ITEMS = [
  { key: 'gloves',            icon: '🧤', label: 'Gloves Worn' },
  { key: 'hairCap',           icon: '🪖', label: 'Hair Cap / Net' },
  { key: 'cleanSurface',      icon: '🧹', label: 'Clean Work Surface' },
  { key: 'freshIngredients',  icon: '🥦', label: 'Fresh Ingredients Used' },
  { key: 'tempCheck',         icon: '🌡️', label: 'Temperature Checked' },
];

const BREAKDOWN_META = {
  complaints: { icon: '📋', label: 'No Complaints' },
  votes:      { icon: '🗳️', label: 'Community Votes' },
  checklist:  { icon: '✅', label: 'Checklist Score' },
};

// ── Init ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  restaurant = getRestaurantById(KITCHEN_ID);
  if (!restaurant) return;

  renderDashScore();
  renderBreakdown();
  renderChecklist();
  setupUpload();
});

// ── Score ─────────────────────────────────
function renderDashScore() {
  const score = restaurant.score;
  const cls   = getScoreClass(score);
  const label = getScoreLabel(score);

  document.getElementById('dashScoreNum').textContent = score;
  document.getElementById('dashScoreNum').className   = `dash-score-num ${cls}`;
  document.getElementById('dashScoreBadge').textContent = label;
  document.getElementById('dashScoreBadge').className  = `dash-score-badge ${cls}`;
}

// ── Breakdown ─────────────────────────────
function renderBreakdown() {
  const bd = restaurant.scoreBreakdown;
  const wrap = document.getElementById('dashBreakdown');

  wrap.innerHTML = Object.entries(bd).map(([key, val]) => {
    const meta = BREAKDOWN_META[key] || { icon: '📊', label: key };
    const cls  = val >= 80 ? 'safe' : val >= 60 ? 'mod' : 'risk';
    const color = val >= 80 ? 'var(--clr-safe-dark)' : val >= 60 ? 'var(--clr-mod-dark)' : 'var(--clr-risk-dark)';
    return `
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:7px">
          <div style="display:flex;align-items:center;gap:8px;font-size:0.9rem;font-weight:600;color:var(--clr-text)">
            ${meta.icon} ${meta.label}
          </div>
          <div style="font-size:0.88rem;font-weight:700;color:${color}">${val}%</div>
        </div>
        <div class="progress-bar">
          <div class="progress-fill ${cls}" style="width:0%" data-target="${val}"></div>
        </div>
      </div>
    `;
  }).join('');

  setTimeout(() => {
    wrap.querySelectorAll('.progress-fill[data-target]').forEach(el => {
      el.style.width = el.dataset.target + '%';
    });
  }, 300);
}

// ── Checklist ─────────────────────────────
function renderChecklist() {
  // Reset state
  CHECKLIST_ITEMS.forEach(item => { checkState[item.key] = false; });

  const wrap = document.getElementById('dashChecklist');
  wrap.innerHTML = CHECKLIST_ITEMS.map(item => `
    <div
      class="check-item"
      id="check-${item.key}"
      onclick="toggleCheck('${item.key}')"
      tabindex="0"
      role="checkbox"
      aria-checked="false"
      onkeydown="if(event.key==='Enter'||event.key===' ') toggleCheck('${item.key}')"
    >
      <div class="check-box" id="box-${item.key}"></div>
      <span>${item.icon} ${item.label}</span>
    </div>
  `).join('');

  updateCheckProgress();
}

function toggleCheck(key) {
  checkState[key] = !checkState[key];
  const el  = document.getElementById(`check-${key}`);
  const box = document.getElementById(`box-${key}`);

  if (checkState[key]) {
    el.classList.add('checked');
    box.textContent = '✓';
    el.setAttribute('aria-checked', 'true');

    // pop animation
    el.style.transform = 'scale(1.03)';
    setTimeout(() => { el.style.transform = ''; }, 200);
  } else {
    el.classList.remove('checked');
    box.textContent = '';
    el.setAttribute('aria-checked', 'false');
  }

  updateCheckProgress();
}

function updateCheckProgress() {
  const passed = Object.values(checkState).filter(Boolean).length;
  const pct    = Math.round((passed / TOTAL_CHECKS) * 100);

  document.getElementById('checkProgress').textContent = `${passed}/${TOTAL_CHECKS}`;
  document.getElementById('checkFill').style.width = pct + '%';

  // Update color class of fill
  const fill = document.getElementById('checkFill');
  fill.className = `progress-fill ${pct >= 80 ? 'safe' : pct >= 60 ? 'mod' : 'risk'}`;

  // Enable/disable submit button
  const btn = document.getElementById('submitCheckBtn');
  btn.disabled = passed === 0;
}

function submitChecklist() {
  const passed = Object.values(checkState).filter(Boolean).length;
  if (passed === 0) return;

  const btn = document.getElementById('submitCheckBtn');
  btn.disabled = true;
  btn.textContent = 'Submitting…';

  setTimeout(() => {
    showToast(`✅ Checklist submitted! ${passed}/${TOTAL_CHECKS} checks passed.`, 'success');
    btn.textContent = '✓ Submitted';
    btn.style.background = 'var(--clr-safe-dark)';
  }, 1000);
}

// ── Upload ────────────────────────────────
function setupUpload() {
  const fileInput = document.getElementById('proofFile');
  const area      = document.getElementById('uploadArea');
  const btn       = document.getElementById('uploadBtn');

  // File chosen via browse
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file) handleFileSelected(file);
  });

  // Drag & drop
  area.addEventListener('dragover', e => {
    e.preventDefault();
    area.classList.add('drag-over');
  });
  area.addEventListener('dragleave', () => area.classList.remove('drag-over'));
  area.addEventListener('drop', e => {
    e.preventDefault();
    area.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleFileSelected(file);
  });
}

function handleFileSelected(file) {
  const reader  = new FileReader();
  const preview = document.getElementById('proofPreview');
  const meta    = document.getElementById('uploadMeta');
  const btn     = document.getElementById('uploadBtn');

  reader.onload = e => {
    preview.src = e.target.result;
    preview.style.display = 'block';
    meta.style.display = 'block';
    btn.disabled = false;

    // Collapse upload area
    document.getElementById('uploadArea').style.display = 'none';
  };
  reader.readAsDataURL(file);
}

function uploadProof() {
  const btn     = document.getElementById('uploadBtn');
  const text    = document.getElementById('uploadBtnText');
  const spinner = document.getElementById('uploadSpinner');
  const caption = document.getElementById('captionInput').value.trim() || 'Kitchen proof';

  btn.disabled = true;
  text.textContent = 'Uploading…';
  spinner.style.display = 'inline-block';

  setTimeout(() => {
    // Success
    text.textContent = '📤 Upload Live Proof';
    spinner.style.display = 'none';
    btn.disabled = false;

    uploadCount++;
    document.getElementById('uploadCountChip').textContent = `${uploadCount} upload${uploadCount !== 1 ? 's' : ''} today`;
    document.getElementById('proofCountStat').textContent  = uploadCount;

    // Add to history
    addHistoryItem(caption);

    // Reset upload area
    resetUploadArea();

    showToast('Kitchen proof uploaded successfully! 📸', 'success');
  }, 2000);
}

function addHistoryItem(caption) {
  const list    = document.getElementById('historyList');
  const preview = document.getElementById('proofPreview');

  // Remove empty state if present
  const empty = list.querySelector('.history-empty');
  if (empty) empty.remove();

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const item = document.createElement('div');
  item.className = 'history-item';
  item.innerHTML = `
    <img src="${preview.src}" class="history-thumb" alt="Proof thumbnail" />
    <div class="history-info">
      <div class="history-caption">${escapeHtml(caption)}</div>
      <div class="history-time">Uploaded at ${timeStr}</div>
    </div>
    <div class="history-badge">✓ Uploaded</div>
  `;
  list.prepend(item);
}

function resetUploadArea() {
  const area    = document.getElementById('uploadArea');
  const preview = document.getElementById('proofPreview');
  const meta    = document.getElementById('uploadMeta');
  const caption = document.getElementById('captionInput');
  const fileInput = document.getElementById('proofFile');

  area.style.display    = '';
  preview.style.display = 'none';
  preview.src           = '';
  meta.style.display    = 'none';
  caption.value         = '';
  fileInput.value       = '';
  document.getElementById('uploadBtn').disabled = true;
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
