/**
 * JanHisab Impact Score™ Engine
 * Published, Auditable, Manipulation-Proof Civic Rating Algorithm
 */

// Wilson Lower Bound interval for confidence adjustment
function calculateWilsonScore(positiveCount, totalCount, confidence = 1.96) {
  if (totalCount === 0) return 50.0;
  const p = positiveCount / totalCount;
  const z = confidence;
  const z2 = z * z;
  const numerator = p + z2 / (2 * totalCount) - z * Math.sqrt((p * (1 - p) + z2 / (4 * totalCount)) / totalCount);
  const denominator = 1 + z2 / totalCount;
  const lowerBound = (numerator / denominator) * 100;
  return Math.max(0, Math.min(100, Math.round(lowerBound * 10) / 10));
}

// Pillar 1: Objective Data Score (45% weight)
function computeObjectiveDataScore(politician) {
  const m = politician.metrics || {};
  const a = politician.assets || {};

  // 1. Attendance (15% weight)
  const attendance = Math.min(100, Math.max(0, m.attendanceRate || 50));
  
  // 2. Questions & Debates (15% weight)
  const questionsScore = Math.min(100, ((m.questionsAsked || 0) / 150) * 50 + ((m.debatesParticipated || 0) / 40) * 50);
  
  // 3. Criminal Record (20% negative penalty weight)
  // 0 cases = 100 pts. 1 pending case drops by 20. Convicted drops by 45.
  const criminalPenalty = (m.criminalCasesPending || 0) * 20 + (m.criminalCasesConvicted || 0) * 45;
  const criminalScore = Math.max(0, 100 - criminalPenalty);

  // 4. Asset Growth vs Market Benchmark (15% weight)
  // Sensex benchmark ~ 74% in 5 years. If growth is massive anomaly (e.g. 500%+), score drops
  let assetScore = 100;
  const growth = a.assetGrowthPct || 50;
  if (growth > 1000) assetScore = 20;
  else if (growth > 500) assetScore = 45;
  else if (growth > 200) assetScore = 70;
  else assetScore = 95;

  // 5. Bills Introduced (10% weight)
  const billsScore = Math.min(100, ((m.billsIntroduced || 0) / 5) * 100);

  // 6. Fund Utilization (15% weight)
  const fundScore = Math.min(100, Math.max(0, m.fundUtilizationPct || 60));

  // 7. RTI Compliance (10% weight)
  const rtiScore = Math.min(100, Math.max(0, m.rtiComplianceRate || 50));

  // Weighted Objective Sum
  const objective = 
    attendance * 0.15 +
    questionsScore * 0.15 +
    criminalScore * 0.20 +
    assetScore * 0.15 +
    billsScore * 0.10 +
    fundScore * 0.15 +
    rtiScore * 0.10;

  return Math.max(0, Math.min(100, Math.round(objective * 10) / 10));
}

// Pillar 2: Verified Local Outcomes (25% weight)
function computeVerifiedOutcomesScore(politician, ratings = []) {
  const verifiedEvidenceCount = politician.metrics?.totalVerifiedEvidenceCount || 0;
  const promisesCompleted = politician.promiseStats?.completed || 0;
  const promisesTotal = politician.promiseStats?.total || 1;
  const promiseDeliveryRatio = (promisesCompleted / Math.max(1, promisesTotal)) * 100;

  // Ground truth score
  const baseGroundScore = 45 + Math.min(40, verifiedEvidenceCount * 5) + (promiseDeliveryRatio * 0.15);
  return Math.max(0, Math.min(100, Math.round(baseGroundScore * 10) / 10));
}

// Pillar 3: Community Sentiment Score (20% weight) with Anti-Manipulation Armor
function computeCommunitySentimentScore(ratings = [], politician) {
  if (!ratings || ratings.length === 0) {
    return {
      score: 50.0,
      confidence: 1.0,
      dimensions: {
        infrastructure: 50,
        accessibility: 50,
        promiseKeeping: 50,
        transparency: 50,
        legislative: 50,
        social: 50,
        economic: 50,
      },
    };
  }

  let totalWeightedScore = 0;
  let totalEffectiveWeight = 0;
  
  const dimensionSums = {
    infrastructure: 0,
    accessibility: 0,
    promiseKeeping: 0,
    transparency: 0,
    legislative: 0,
    social: 0,
    economic: 0,
  };

  ratings.forEach((r) => {
    if (r.isQuarantined) return; // Skip quarantined brigading votes

    // 1. Quadratic dampening: sqrt(creditsSpent)
    const effectiveVotes = Math.sqrt(Math.max(1, r.creditsSpent || 1));

    // 2. Evidence Tier Multiplier (Tier 1: 3x, Tier 2: 1.5x, Tier 3: 1x)
    let tierMultiplier = 1.0;
    if (r.evidenceTier === 1) tierMultiplier = 3.0;
    else if (r.evidenceTier === 2) tierMultiplier = 1.5;

    // 3. Geographic Relevance Multiplier (3x for constituency locals)
    const geoMultiplier = r.isConstituencyVoter ? 3.0 : 1.0;

    // Composite single rating weight
    const finalWeight = effectiveVotes * tierMultiplier * geoMultiplier * (r.weightApplied || 1.0);

    const rScore = r.overallAverage || 50;
    totalWeightedScore += rScore * finalWeight;
    totalEffectiveWeight += finalWeight;

    // Aggregate dimensions
    if (r.dimensions) {
      Object.keys(dimensionSums).forEach((dim) => {
        dimensionSums[dim] += (r.dimensions[dim] || 50) * finalWeight;
      });
    }
  });

  const rawSentiment = totalEffectiveWeight > 0 ? totalWeightedScore / totalEffectiveWeight : 50;
  
  // Wilson Lower Bound adjustment for sample confidence
  const positiveRatingsCount = ratings.filter((r) => (r.overallAverage || 50) >= 50 && !r.isQuarantined).length;
  const wilsonScore = calculateWilsonScore(positiveRatingsCount, ratings.length);
  
  // Blend raw sentiment with Wilson interval
  const adjustedSentiment = (rawSentiment * 0.7) + (wilsonScore * 0.3);

  // Dimension averages
  const computedDimensions = {};
  Object.keys(dimensionSums).forEach((dim) => {
    computedDimensions[dim] = totalEffectiveWeight > 0 
      ? Math.round((dimensionSums[dim] / totalEffectiveWeight) * 10) / 10 
      : 50;
  });

  return {
    score: Math.max(0, Math.min(100, Math.round(adjustedSentiment * 10) / 10)),
    confidence: 1.0,
    dimensions: computedDimensions,
  };
}

// Pillar 4: Trust Decay Factor (10% weight)
function computeTrustRecencyScore(politician) {
  // Favor activity in the last 6 months
  const now = new Date();
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
  
  let recencyScore = 55;
  if (politician.updatedAt && new Date(politician.updatedAt) > sixMonthsAgo) {
    recencyScore = 75;
  }
  return recencyScore;
}

// Full Impact Score™ Recalculation
function recalculatePoliticianImpactScore(politician, ratings = [], configWeights = null) {
  const w = configWeights || {
    objectiveDataWeight: 0.45,
    verifiedOutcomesWeight: 0.25,
    communitySentimentWeight: 0.20,
    trustRecencyWeight: 0.10,
  };

  const objectiveScore = computeObjectiveDataScore(politician);
  const outcomesScore = computeVerifiedOutcomesScore(politician, ratings);
  const sentimentResult = computeCommunitySentimentScore(ratings, politician);
  const recencyScore = computeTrustRecencyScore(politician);

  const finalImpactScore = 
    (objectiveScore * w.objectiveDataWeight) +
    (outcomesScore * w.verifiedOutcomesWeight) +
    (sentimentResult.score * w.communitySentimentWeight * sentimentResult.confidence) +
    (recencyScore * w.trustRecencyWeight);

  const roundedScore = Math.max(0, Math.min(100, Math.round(finalImpactScore * 10) / 10));

  // Determine Badge Tier & Visuals
  let badgeTier = 'Theek Hai';
  let badgeAltName = 'Suspiciously Silent';

  if (roundedScore >= 90) {
    badgeTier = 'Janta ka Sher';
    badgeAltName = 'The Chaiwala Who Delivered';
  } else if (roundedScore >= 70) {
    badgeTier = 'Kaam Karne Wala';
    badgeAltName = 'Actually Does Stuff';
  } else if (roundedScore >= 50) {
    badgeTier = 'Theek Hai';
    badgeAltName = 'Suspiciously Silent';
  } else if (roundedScore >= 30) {
    badgeTier = 'Sust Neta';
    badgeAltName = 'Missing Action Hero';
  } else if (roundedScore >= 10) {
    badgeTier = 'Jumla Champion';
    badgeAltName = 'Ghotala Specialist';
  } else {
    badgeTier = 'Total Nautanki';
    badgeAltName = 'Janta ka Dushman';
  }

  return {
    impactScore: roundedScore,
    badgeTier,
    badgeAltName,
    scoreBreakdown: {
      objectiveData: objectiveScore,
      verifiedOutcomes: outcomesScore,
      communitySentiment: sentimentResult.score,
      trustRecency: recencyScore,
    },
    dimensions: sentimentResult.dimensions,
  };
}

module.exports = {
  calculateWilsonScore,
  computeObjectiveDataScore,
  computeVerifiedOutcomesScore,
  computeCommunitySentimentScore,
  computeTrustRecencyScore,
  recalculatePoliticianImpactScore,
};
