// =========================================
// ProofPlate — Mock Data (Firebase-ready)
// =========================================

const RESTAURANTS = [
  {
    id: "r1",
    name: "Biryani Box",
    cuisine: "North Indian · Biryani",
    score: 92,
    complaints: 0,
    positiveVotes: 134,
    negativeVotes: 6,
    lastVerified: 1,           // hours ago
    image: "assets/kitchen_spice.png",
    proofImage: "assets/kitchen_spice.png",
    proofTimestamp: "2 hours ago",
    checklist: {
      gloves: true,
      hairCap: true,
      cleanSurface: true,
      freshIngredients: true,
      tempCheck: true
    },
    scoreBreakdown: {
      complaints: 100,         // 0 complaints → 100%
      votes: 96,               // high positive ratio
      checklist: 100
    },
    address: "Food Court, HSR Layout, Bengaluru",
    rating: 4.7
  },
  {
    id: "r2",
    name: "Cloud Pizza Co.",
    cuisine: "Italian · Pizza · Pasta",
    score: 78,
    complaints: 1,
    positiveVotes: 88,
    negativeVotes: 22,
    lastVerified: 3,
    image: "assets/kitchen_italian.png",
    proofImage: "assets/kitchen_italian.png",
    proofTimestamp: "3 hours ago",
    checklist: {
      gloves: true,
      hairCap: true,
      cleanSurface: false,
      freshIngredients: true,
      tempCheck: true
    },
    scoreBreakdown: {
      complaints: 90,
      votes: 80,
      checklist: 80
    },
    address: "Indiranagar, Bengaluru",
    rating: 4.2
  },
  {
    id: "r3",
    name: "Wrap & Roll Kitchen",
    cuisine: "Continental · Wraps · Salads",
    score: 95,
    complaints: 0,
    positiveVotes: 210,
    negativeVotes: 4,
    lastVerified: 0.5,
    image: "assets/kitchen_clean.png",
    proofImage: "assets/kitchen_clean.png",
    proofTimestamp: "30 minutes ago",
    checklist: {
      gloves: true,
      hairCap: true,
      cleanSurface: true,
      freshIngredients: true,
      tempCheck: true
    },
    scoreBreakdown: {
      complaints: 100,
      votes: 98,
      checklist: 100
    },
    address: "Koramangala, Bengaluru",
    rating: 4.9
  },
  {
    id: "r4",
    name: "Mama's Tiffin House",
    cuisine: "South Indian · Tiffin",
    score: 55,
    complaints: 3,
    positiveVotes: 42,
    negativeVotes: 38,
    lastVerified: 8,
    image: "assets/kitchen_spice.png",
    proofImage: "assets/kitchen_spice.png",
    proofTimestamp: "8 hours ago",
    checklist: {
      gloves: false,
      hairCap: true,
      cleanSurface: false,
      freshIngredients: true,
      tempCheck: false
    },
    scoreBreakdown: {
      complaints: 70,
      votes: 52,
      checklist: 60
    },
    address: "Jayanagar, Bengaluru",
    rating: 3.4
  },
  {
    id: "r5",
    name: "Dragon Bowl",
    cuisine: "Chinese · Thai · Asian",
    score: 38,
    complaints: 5,
    positiveVotes: 19,
    negativeVotes: 61,
    lastVerified: 14,
    image: "assets/kitchen_italian.png",
    proofImage: "assets/kitchen_italian.png",
    proofTimestamp: "14 hours ago",
    checklist: {
      gloves: false,
      hairCap: false,
      cleanSurface: false,
      freshIngredients: false,
      tempCheck: true
    },
    scoreBreakdown: {
      complaints: 50,
      votes: 24,
      checklist: 20
    },
    address: "BTM Layout, Bengaluru",
    rating: 2.8
  },
  {
    id: "r6",
    name: "The Salad Studio",
    cuisine: "Healthy · Salads · Bowls",
    score: 88,
    complaints: 0,
    positiveVotes: 97,
    negativeVotes: 11,
    lastVerified: 2,
    image: "assets/kitchen_clean.png",
    proofImage: "assets/kitchen_clean.png",
    proofTimestamp: "2 hours ago",
    checklist: {
      gloves: true,
      hairCap: true,
      cleanSurface: true,
      freshIngredients: true,
      tempCheck: false
    },
    scoreBreakdown: {
      complaints: 100,
      votes: 90,
      checklist: 80
    },
    address: "Whitefield, Bengaluru",
    rating: 4.5
  }
];

// ── Helpers ──────────────────────────────
function getScoreClass(score) {
  if (score >= 80) return 'safe';
  if (score >= 60) return 'mod';
  return 'risk';
}

function getScoreLabel(score) {
  if (score >= 80) return '🟢 Safe';
  if (score >= 60) return '🟡 Moderate';
  return '🔴 Risky';
}

function getScoreEmoji(score) {
  if (score >= 80) return '🟢';
  if (score >= 60) return '🟡';
  return '🔴';
}

function formatVerified(hours) {
  if (hours < 1) return `${Math.round(hours * 60)} min ago`;
  if (hours === 1) return '1 hr ago';
  return `${hours} hrs ago`;
}

function getRestaurantById(id) {
  return RESTAURANTS.find(r => r.id === id) || null;
}

function showToast(msg, type = '') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = '';
  const icon = document.createElement('span');
  icon.textContent = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
  toast.appendChild(icon);
  toast.appendChild(document.createTextNode(' ' + msg));
  toast.className = 'show ' + type;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.className = ''; }, 3200);
}

// ── Simulator Engine ──────────────────────
// Makes the demo feel "alive" by subtly changing scores/votes
(function startSimulator() {
  setInterval(() => {
    RESTAURANTS.forEach(r => {
      // Randomly tweak votes or scores subtly
      if (Math.random() > 0.8) {
        if (Math.random() > 0.5) r.positiveVotes++;
        else r.negativeVotes++;
        
        // Slightly fluctuate score
        const change = Math.random() > 0.5 ? 1 : -1;
        r.score = Math.max(10, Math.min(100, r.score + change));
      }
    });
    // Trigger UI refresh if we are on the grid page
    if (typeof renderGrid === 'function') renderGrid();
  }, 15000); // Tweak every 15 seconds
})();
