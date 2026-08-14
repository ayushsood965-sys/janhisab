/**
 * JanHisab Divergence Detection Engine (Rotten Tomatoes Dual-Score Weapon)
 * Detects discrepancies between Objective Kaam Score and Janta Voice Sentiment.
 */

function evaluateDivergence(objectiveKaamScore, jantaVoiceSentiment) {
  const diff = jantaVoiceSentiment - objectiveKaamScore;
  const threshold = 30; // 30+ point spread triggers alert

  if (diff > threshold) {
    return {
      hasDivergence: true,
      kaamScore: objectiveKaamScore,
      jantaVoice: jantaVoiceSentiment,
      divergenceType: 'SUSPICIOUS_HIGH_SENTIMENT',
      divergenceReason:
        '⚠️ Sentiment–Performance Mismatch Detected: High public ratings despite low objective work metrics — possible coordinated rating activity under review.',
      badgeStyle: 'crimson_warning',
    };
  } else if (diff < -threshold) {
    return {
      hasDivergence: true,
      kaamScore: objectiveKaamScore,
      jantaVoice: jantaVoiceSentiment,
      divergenceType: 'UNPOPULAR_HIGH_DELIVERY',
      divergenceReason:
        'ℹ️ High Objective Delivery with Critical Public Sentiment: Strong legislative attendance and project completion amidst active public scrutiny.',
      badgeStyle: 'cyan_info',
    };
  }

  return {
    hasDivergence: false,
    kaamScore: objectiveKaamScore,
    jantaVoice: jantaVoiceSentiment,
    divergenceType: 'BALANCED',
    divergenceReason: '✅ Public sentiment closely matches objective governance data.',
    badgeStyle: 'emerald_balanced',
  };
}

module.exports = { evaluateDivergence };
