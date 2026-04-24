// Format Utilities — Display formatting helpers for the UI

/**
 * Format a hygiene score (0–100) with a label and color class
 * @param {number} score - 0 to 100
 * @returns {Object} { label, colorClass, emoji }
 */
function formatScoreDisplay(score) {
  if (score >= 80) {
    return { label: "Excellent", colorClass: "score-excellent", emoji: "🟢" };
  } else if (score >= 60) {
    return { label: "Good", colorClass: "score-good", emoji: "🟡" };
  } else if (score >= 40) {
    return { label: "Average", colorClass: "score-average", emoji: "🟠" };
  } else {
    return { label: "Poor", colorClass: "score-poor", emoji: "🔴" };
  }
}

/**
 * Format a score breakdown for transparent display
 * @param {number} communityRatio - 0 to 1
 * @param {number} recencyScore - 0 to 1
 * @param {number} checklistScore - 0 to 1
 * @returns {Object} breakdown with weighted values
 */
function formatScoreBreakdown(communityRatio, recencyScore, checklistScore) {
  return {
    community: {
      raw: Math.round(communityRatio * 100),
      weight: "60%",
      weighted: Math.round(communityRatio * 60),
    },
    recency: {
      raw: Math.round(recencyScore * 100),
      weight: "25%",
      weighted: Math.round(recencyScore * 25),
    },
    checklist: {
      raw: Math.round(checklistScore * 100),
      weight: "15%",
      weighted: Math.round(checklistScore * 15),
    },
  };
}

/**
 * Format vote counts for display
 * @param {number} clean
 * @param {number} unhygienic
 * @returns {string} e.g. "42 clean · 3 unhygienic"
 */
function formatVoteCounts(clean, unhygienic) {
  return `${clean} clean · ${unhygienic} unhygienic`;
}

/**
 * Truncate a kitchen name for card display
 * @param {string} name
 * @param {number} maxLength
 * @returns {string}
 */
function truncateName(name, maxLength = 25) {
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength - 1) + "…";
}
