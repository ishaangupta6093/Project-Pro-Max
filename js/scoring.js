function calculateScore(data) {
  let score = 100;

  score -= (data.complaints || 0) * 10;
  score += (data.positiveVotes || 0) * 2;
  score -= (data.negativeVotes || 0) * 5;

  return Math.max(0, Math.min(100, score));
}

function getScoreLabel(score) {
  if (score >= 85) return "🟢 Safe";
  if (score >= 60) return "🟡 Moderate";
  return "🔴 Risky";
}