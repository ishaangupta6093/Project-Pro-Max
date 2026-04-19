// =========================================
// ProofPlate — index.js  (Home page logic)
// =========================================

let currentFilter = 'all';
let currentSort   = 'score-desc';
let searchQuery   = '';

// ── Render card ──────────────────────────
function renderCard(r, delay) {
  const cls   = getScoreClass(r.score);
  const label = getScoreLabel(r.score);
  const verif = formatVerified(r.lastVerified);
  const votePct = r.positiveVotes + r.negativeVotes > 0
    ? Math.round((r.positiveVotes / (r.positiveVotes + r.negativeVotes)) * 100)
    : 0;

  return `
    <article
      class="restaurant-card"
      role="listitem"
      style="animation-delay:${delay}ms"
      onclick="window.location='restaurant.html?id=${r.id}'"
      tabindex="0"
      onkeydown="if(event.key==='Enter') window.location='restaurant.html?id=${r.id}'"
    >
      <div class="card-image-wrap">
        <img src="${r.image}" alt="${r.name} kitchen" loading="lazy" />
        <div class="card-score-pill ${cls}">
          ${getScoreEmoji(r.score)} ${label.replace(/🟢|🟡|🔴/,'').trim()}
        </div>
        <div class="card-score-indicator ${cls}"></div>
      </div>

      <div class="card-body">
        <div class="card-top">
          <div>
            <div class="card-name">${r.name}</div>
            <div class="card-cuisine">${r.cuisine}</div>
          </div>
          <div class="card-score-num ${cls}">${r.score}</div>
        </div>

        <div class="card-meta">
          <div class="card-meta-item">⭐ ${r.rating}</div>
          <div class="card-meta-item">📍 ${r.address.split(',')[0]}</div>
        </div>

        <div class="card-votes">
          <div class="card-vote-item">👍 ${r.positiveVotes}</div>
          <div class="card-vote-item">👎 ${r.negativeVotes}</div>
          <div class="card-vote-item" style="margin-left:auto;font-size:0.75rem;color:var(--clr-muted)">
            ${votePct}% positive
          </div>
        </div>
      </div>

      <div class="card-footer">
        <div class="card-verified">
          <span class="dot ${cls}"></span>
          Verified ${verif}
        </div>
        <button class="btn-view" onclick="event.stopPropagation(); window.location='restaurant.html?id=${r.id}'">
          View Details →
        </button>
      </div>
    </article>
  `;
}

// ── Filter + sort + search ────────────────
function getFilteredSorted() {
  let list = RESTAURANTS.slice();

  // filter by hygiene tier
  if (currentFilter !== 'all') {
    list = list.filter(r => getScoreClass(r.score) === currentFilter);
  }

  // search
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    list = list.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.cuisine.toLowerCase().includes(q) ||
      r.address.toLowerCase().includes(q)
    );
  }

  // sort
  switch (currentSort) {
    case 'score-asc':  list.sort((a,b) => a.score - b.score); break;
    case 'score-desc': list.sort((a,b) => b.score - a.score); break;
    case 'name':       list.sort((a,b) => a.name.localeCompare(b.name)); break;
    case 'recent':     list.sort((a,b) => a.lastVerified - b.lastVerified); break;
  }

  return list;
}

// ── Render grid ───────────────────────────
function renderGrid() {
  const grid  = document.getElementById('restaurantGrid');
  const empty = document.getElementById('emptyState');
  const title = document.getElementById('resultsTitle');
  const list  = getFilteredSorted();

  const labels = { all:'All Kitchens', safe:'Safe Kitchens', mod:'Moderate Kitchens', risk:'Risky Kitchens' };
  title.textContent = labels[currentFilter] || 'All Kitchens';

  if (list.length === 0) {
    grid.innerHTML  = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  grid.innerHTML = list.map((r, i) => renderCard(r, i * 60)).join('');
}

// ── Init ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderGrid();

  // Search
  const input = document.getElementById('searchInput');
  const clear = document.getElementById('searchClear');

  input.addEventListener('input', () => {
    searchQuery = input.value.trim();
    clear.classList.toggle('visible', searchQuery.length > 0);
    renderGrid();
  });

  clear.addEventListener('click', () => {
    input.value = '';
    searchQuery = '';
    clear.classList.remove('visible');
    renderGrid();
    input.focus();
  });

  // Filter tabs
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      currentFilter = tab.dataset.filter;
      renderGrid();
    });
  });

  // Sort
  document.getElementById('sortSelect').addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderGrid();
  });
});
