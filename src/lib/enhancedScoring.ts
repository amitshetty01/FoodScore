import { FoodProduct, NutritionFacts, GuidelineRow } from '@/types';
import { CountryCode, getCountryGuidelines } from './countryRules';

export type QuickVerdict = 'Excellent Choice' | 'Good Choice' | 'Occasional Choice' | 'Limit Consumption' | 'Avoid Frequent Consumption';
export type HealthScore = 'Excellent' | 'Good' | 'Moderate' | 'Poor';
export type DataConfidence = 'High Confidence' | 'Medium Confidence' | 'Low Confidence';

export interface ScoreReason {
  title: string;
  description: string;
  impact: 'positive' | 'negative';
  score: number;
}

export interface EnhancedHealthScore {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'E';
  verdict: QuickVerdict;
  breakdown: {
    nutrition: number;
    ingredients: number;
    processing: number;
    positiveFactors: number;
    countryAlignment: number;
  };
  maxScores: {
    nutrition: number;
    ingredients: number;
    processing: number;
    positiveFactors: number;
    countryAlignment: number;
  };
  topReasons: ScoreReason[];
  topPositives: string[];
  topNegatives: string[];
  childSuitability: HealthScore;
  weightLossFriendliness: HealthScore;
  diabetesFriendliness: HealthScore;
  bloodPressureFriendliness: HealthScore;
  dailyIntakeContribution: {
    sugar: number;
    sodium: number;
    saturatedFat: number;
    protein: number;
    fiber: number;
  };
  guidelineComparison: GuidelineRow[];
  dataConfidence: DataConfidence;
  confidenceNote: string;
  summary: string;
  scoreExplanation: string;
  country: CountryCode;
}

function lerp(val: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  if (val <= inMin) return outMin;
  if (val >= inMax) return outMax;
  const t = (val - inMin) / (inMax - inMin);
  return outMin + t * (outMax - outMin);
}

function scoreNegativeNutrient(value: number | undefined, goodThreshold: number, badThreshold: number, maxScore: number): number {
  if (value === undefined) return maxScore * 0.5;
  if (value <= goodThreshold) return maxScore;
  if (value >= badThreshold) return 0;
  return lerp(value, goodThreshold, badThreshold, maxScore, 0);
}

function scorePositiveNutrient(value: number | undefined, badThreshold: number, goodThreshold: number, maxScore: number): number {
  if (value === undefined) return 0;
  if (value >= goodThreshold) return maxScore;
  if (value <= badThreshold) return 0;
  return lerp(value, badThreshold, goodThreshold, 0, maxScore);
}

function calculateNutritionScore(nutriments: NutritionFacts): { score: number; maxScore: number; reasons: ScoreReason[] } {
  let score = 0;
  const maxScore = 4;
  const reasons: ScoreReason[] = [];

  const sugarScore = scoreNegativeNutrient(nutriments.sugars, 5, 22.5, 1);
  score += sugarScore;
  if (nutriments.sugars !== undefined) {
    if (nutriments.sugars <= 5) {
      reasons.push({ title: 'Low Sugar', description: `Only ${nutriments.sugars.toFixed(1)}g sugar per 100g — excellent.`, impact: 'positive', score: 1 });
    } else if (nutriments.sugars > 22.5) {
      reasons.push({ title: 'High Sugar', description: `${nutriments.sugars.toFixed(1)}g sugar per 100g — very high.`, impact: 'negative', score: -1 });
    }
  }

  const sodiumScore = scoreNegativeNutrient(nutriments.sodium, 0.1, 1.5, 0.75);
  score += sodiumScore;
  if (nutriments.sodium !== undefined) {
    if (nutriments.sodium <= 0.1) {
      reasons.push({ title: 'Low Sodium', description: `Only ${(nutriments.sodium * 1000).toFixed(0)}mg sodium per 100g — heart-friendly.`, impact: 'positive', score: 0.75 });
    } else if (nutriments.sodium > 1.5) {
      reasons.push({ title: 'High Sodium', description: `${(nutriments.sodium * 1000).toFixed(0)}mg sodium per 100g — very high.`, impact: 'negative', score: -0.75 });
    }
  }

  const satFatScore = scoreNegativeNutrient(nutriments.saturated_fat, 1.5, 10, 0.5);
  score += satFatScore;
  if (nutriments.saturated_fat !== undefined) {
    if (nutriments.saturated_fat <= 1.5) {
      reasons.push({ title: 'Low Saturated Fat', description: `Only ${nutriments.saturated_fat.toFixed(1)}g saturated fat per 100g.`, impact: 'positive', score: 0.5 });
    } else if (nutriments.saturated_fat > 10) {
      reasons.push({ title: 'High Saturated Fat', description: `${nutriments.saturated_fat.toFixed(1)}g saturated fat per 100g.`, impact: 'negative', score: -0.5 });
    }
  }

  const proteinScore = scorePositiveNutrient(nutriments.proteins, 2, 20, 0.75);
  score += proteinScore;
  if (nutriments.proteins !== undefined) {
    if (nutriments.proteins >= 20) {
      reasons.push({ title: 'Excellent Protein', description: `${nutriments.proteins.toFixed(1)}g protein per 100g.`, impact: 'positive', score: 0.75 });
    } else if (nutriments.proteins < 2 && nutriments.proteins >= 0) {
      reasons.push({ title: 'Low Protein', description: `Only ${nutriments.proteins.toFixed(1)}g protein per 100g.`, impact: 'negative', score: -0.3 });
    }
  }

  const fiberScore = scorePositiveNutrient(nutriments.fiber, 1, 6, 0.5);
  score += fiberScore;
  if (nutriments.fiber !== undefined) {
    if (nutriments.fiber >= 6) {
      reasons.push({ title: 'High Fiber', description: `${nutriments.fiber.toFixed(1)}g fiber per 100g — excellent.`, impact: 'positive', score: 0.5 });
    } else if (nutriments.fiber < 1 && nutriments.fiber >= 0) {
      reasons.push({ title: 'Low Fiber', description: `Only ${nutriments.fiber.toFixed(1)}g fiber per 100g.`, impact: 'negative', score: -0.2 });
    }
  }

  const energyScore = scoreNegativeNutrient(nutriments.energy_kcal, 40, 400, 0.5);
  score += energyScore;

  return { score: Math.min(maxScore, Math.max(0, score)), maxScore, reasons };
}

function calculateIngredientScore(product: FoodProduct): { score: number; maxScore: number; reasons: ScoreReason[] } {
  let score = 0;
  const maxScore = 2;
  const reasons: ScoreReason[] = [];

  const hasAdditives = product.additives && product.additives.length > 0;

  if (!hasAdditives) {
    score += 0.5;
    reasons.push({ title: 'No Additives', description: 'No artificial additives detected.', impact: 'positive', score: 0.5 });
  } else {
    const additives = product.additives ?? [];
    const harmfulAdditives = additives.filter(a =>
      /e10[0249]|e122|e124|e129|e211|e212|e213|e249|e250|e251|e252|e320|e321|e621|e627|e631|e951|e952|e954/i.test(a.toLowerCase())
    );
    const colors = harmfulAdditives.filter(a => /e10[0249]|e122|e124|e129/i.test(a.toLowerCase())).length;
    const sweeteners = harmfulAdditives.filter(a => /e951|e952|e954/i.test(a.toLowerCase())).length;
    const preservatives = harmfulAdditives.filter(a => /e211|e212|e213|e249|e250|e251|e252/i.test(a.toLowerCase())).length;
    const refined = additives.length > 5;

    if (colors > 0) score = Math.max(0, score - 0.5);
    if (sweeteners > 0) score = Math.max(0, score - 0.25);
    if (preservatives > 0) score = Math.max(0, score - 0.25);
    if (refined) score = Math.max(0, score - 0.5);

    if (colors > 0 || sweeteners > 0 || preservatives > 0 || refined) {
      const details: string[] = [];
      if (colors > 0) details.push('artificial colors');
      if (sweeteners > 0) details.push('artificial sweeteners');
      if (preservatives > 0) details.push('preservatives');
      if (refined) details.push('highly refined ingredients');
      reasons.push({
        title: 'Concerning Ingredients',
        description: `Contains ${details.join(', ')}.`,
        impact: 'negative',
        score: -Math.min(1.5, (colors * 0.5 + sweeteners * 0.25 + preservatives * 0.25 + (refined ? 0.5 : 0))),
      });
    }
  }

  const ingredientCount = product.ingredients
    ? product.ingredients.split(/[,;•]/).filter(Boolean).length
    : 0;

  if (ingredientCount <= 5 || (!product.ingredients && !hasAdditives)) {
    score += 0.5;
    reasons.push({ title: 'Simple Ingredients', description: 'Short or no ingredient list — suggests minimal processing.', impact: 'positive', score: 0.5 });
  }

  if (product.labels && product.labels.some(l => /organic|natural/i.test(l))) {
    score += 0.25;
    reasons.push({ title: 'Organic/Natural', description: 'Carries organic or natural certification.', impact: 'positive', score: 0.25 });
  }

  return { score: Math.min(maxScore, Math.max(0, score)), maxScore, reasons };
}

function calculateProcessingScore(product: FoodProduct): { score: number; maxScore: number; reasons: ScoreReason[] } {
  let score = 0;
  const maxScore = 2;
  const reasons: ScoreReason[] = [];

  const nova = product.novaGroup;
  if (nova === 1) {
    score = 2;
    reasons.push({ title: 'Minimally Processed', description: 'NOVA Group 1 — unprocessed or minimally processed.', impact: 'positive', score: 2 });
  } else if (nova === 2) {
    score = 1.5;
    reasons.push({ title: 'Slightly Processed', description: 'NOVA Group 2 — minimally processed ingredients.', impact: 'positive', score: 1.5 });
  } else if (nova === 3) {
    score = 1;
    reasons.push({ title: 'Moderately Processed', description: 'NOVA Group 3 — processed food.', impact: 'positive', score: 1 });
  } else if (nova === 4) {
    score = 0;
    reasons.push({ title: 'Ultra-Processed', description: 'NOVA Group 4 — heavily processed, limit consumption.', impact: 'negative', score: -1 });
  } else {
    score = 1.5;
  }

  return { score, maxScore, reasons };
}

function calculatePositiveFactorsScore(product: FoodProduct): { score: number; maxScore: number; reasons: ScoreReason[] } {
  let score = 0;
  const maxScore = 1;
  const reasons: ScoreReason[] = [];

  const hasCalcium = product.labels?.some(l => /calcium/i.test(l)) || false;
  const hasIron = product.labels?.some(l => /iron/i.test(l)) || false;
  const hasVitamins = product.labels?.some(l => /vitamin/i.test(l)) || false;
  const hasWholeGrains = product.name?.toLowerCase().includes('whole grain')
    || product.ingredients?.toLowerCase().includes('whole grain')
    || product.labels?.some(l => /whole grain/i.test(l))
    || false;
  const hasProbiotics = product.labels?.some(l => /probiotic/i.test(l))
    || product.name?.toLowerCase().includes('probiotic')
    || false;
  const hasFortification = product.labels?.some(l => /fortif/i.test(l)) || false;

  const found: string[] = [];
  if (hasCalcium) found.push('calcium');
  if (hasIron) found.push('iron');
  if (hasVitamins) found.push('vitamins');
  if (hasWholeGrains) found.push('whole grains');
  if (hasProbiotics) found.push('probiotics');
  if (hasFortification) found.push('fortification');

  if (found.length > 0) {
    score = Math.min(1, found.length * 0.2);
    reasons.push({
      title: 'Positive Nutritional Factors',
      description: `Contains beneficial components: ${found.join(', ')}.`,
      impact: 'positive',
      score,
    });
  }

  return { score, maxScore, reasons };
}

function calculateCountryAlignment(product: FoodProduct, country: CountryCode): { score: number; maxScore: number; reasons: ScoreReason[] } {
  let score = 0;
  const maxScore = 1;
  const reasons: ScoreReason[] = [];
  const guidelines = getCountryGuidelines(country);

  let favorableCount = 0;
  let totalChecks = 0;

  const sugarLimit = guidelines.daily.sugar_max_g;
  if (product.nutriments.sugars !== undefined) {
    totalChecks++;
    if ((product.nutriments.sugars / sugarLimit) * 100 <= 30) favorableCount++;
  }

  const sodiumLimit = guidelines.daily.sodium_max_mg;
  if (product.nutriments.sodium !== undefined) {
    totalChecks++;
    if (((product.nutriments.sodium * 1000) / sodiumLimit) * 100 <= 30) favorableCount++;
  }

  const satFatLimit = guidelines.daily.saturated_fat_max_g;
  if (product.nutriments.saturated_fat !== undefined) {
    totalChecks++;
    if ((product.nutriments.saturated_fat / satFatLimit) * 100 <= 30) favorableCount++;
  }

  const proteinMin = guidelines.daily.protein_min_g;
  if (product.nutriments.proteins !== undefined) {
    totalChecks++;
    if ((product.nutriments.proteins / proteinMin) * 100 >= 20) favorableCount++;
  }

  const fiberMin = guidelines.daily.fiber_min_g;
  if (product.nutriments.fiber !== undefined) {
    totalChecks++;
    if ((product.nutriments.fiber / fiberMin) * 100 >= 20) favorableCount++;
  }

  if (totalChecks > 0) {
    const ratio = favorableCount / totalChecks;
    score = ratio * 1;
    if (score > 0.5) {
      reasons.push({ title: `Aligns with ${guidelines.countryName} Guidelines`, description: `Meets ${guidelines.countryName} dietary recommendations on ${favorableCount}/${totalChecks} key nutrients.`, impact: 'positive', score });
    } else if (score < 0.3) {
      reasons.push({ title: `Below ${guidelines.countryName} Recommendations`, description: `Falls short of ${guidelines.countryName} dietary guidelines on most nutrients.`, impact: 'negative', score: -score });
    }
  }

  return { score: Math.min(maxScore, Math.max(0, score)), maxScore, reasons };
}

function calculateDataConfidence(product: FoodProduct): { confidence: DataConfidence; note: string } {
  let completeness = 0;
  const maxFields = 7;

  if (product.ingredients) completeness++;
  if (product.nutriments.proteins !== undefined) completeness++;
  if (product.nutriments.sugars !== undefined) completeness++;
  if (product.nutriments.sodium !== undefined) completeness++;
  if (product.nutriments.fiber !== undefined) completeness++;
  if (product.additives) completeness++;
  if (product.novaGroup !== undefined) completeness++;

  const percentage = (completeness / maxFields) * 100;

  if (percentage >= 85) return { confidence: 'High Confidence', note: 'Most data fields are populated.' };
  if (percentage >= 60) return { confidence: 'Medium Confidence', note: 'Some data fields are missing; score may shift with complete data.' };
  return { confidence: 'Low Confidence', note: 'Limited data available. Score should be used with caution.' };
}

function calculateSpecializedScores(nutriments: NutritionFacts, country: CountryCode): {
  childSuitability: HealthScore;
  weightLossFriendliness: HealthScore;
  diabetesFriendliness: HealthScore;
  bloodPressureFriendliness: HealthScore;
} {
  const guidelines = getCountryGuidelines(country);

  let childScore = 0;
  if ((nutriments.sugars ?? 0) <= guidelines.childGuidelines.sugar_max_g * 0.1) childScore += 3;
  if ((nutriments.sodium ?? 0) <= guidelines.childGuidelines.sodium_max_mg * 0.01) childScore += 3;
  if ((nutriments.proteins ?? 0) >= guidelines.childGuidelines.protein_min_g * 0.5) childScore += 3;
  const childSuitability: HealthScore = childScore >= 7 ? 'Excellent' : childScore >= 5 ? 'Good' : childScore >= 3 ? 'Moderate' : 'Poor';

  let wlScore = 0;
  if ((nutriments.energy_kcal ?? 0) <= 150) wlScore += 3;
  if ((nutriments.proteins ?? 0) >= 5) wlScore += 3;
  if ((nutriments.fiber ?? 0) >= 2) wlScore += 3;
  if ((nutriments.sugars ?? 0) <= 5) wlScore += 3;
  const weightLossFriendliness: HealthScore = wlScore >= 10 ? 'Excellent' : wlScore >= 7 ? 'Good' : wlScore >= 4 ? 'Moderate' : 'Poor';

  let dbScore = 0;
  if ((nutriments.sugars ?? 0) <= guidelines.daily.sugar_max_g * 0.1) dbScore += 4;
  if ((nutriments.carbohydrates ?? 0) <= 30) dbScore += 3;
  if ((nutriments.fiber ?? 0) >= 3) dbScore += 3;
  const diabetesFriendliness: HealthScore = dbScore >= 8 ? 'Excellent' : dbScore >= 6 ? 'Good' : dbScore >= 3 ? 'Moderate' : 'Poor';

  let bpScore = 0;
  if ((nutriments.sodium ?? 0) <= guidelines.daily.sodium_max_mg * 0.01) bpScore += 5;
  if ((nutriments.fiber ?? 0) >= 2) bpScore += 3;
  if ((nutriments.saturated_fat ?? 0) <= 2) bpScore += 2;
  const bloodPressureFriendliness: HealthScore = bpScore >= 8 ? 'Excellent' : bpScore >= 5 ? 'Good' : bpScore >= 2 ? 'Moderate' : 'Poor';

  return { childSuitability, weightLossFriendliness, diabetesFriendliness, bloodPressureFriendliness };
}

export function getGradeFromScore(score: number): 'A' | 'B' | 'C' | 'D' | 'E' {
  if (score >= 8.5) return 'A';
  if (score >= 7.0) return 'B';
  if (score >= 5.5) return 'C';
  if (score >= 4.0) return 'D';
  return 'E';
}

function getVerdict(score: number): QuickVerdict {
  if (score >= 8.0) return 'Excellent Choice';
  if (score >= 6.0) return 'Good Choice';
  if (score >= 4.0) return 'Occasional Choice';
  if (score >= 2.0) return 'Limit Consumption';
  return 'Avoid Frequent Consumption';
}

function buildGuidelineComparison(product: FoodProduct, country: CountryCode): GuidelineRow[] {
  const g = getCountryGuidelines(country);
  const rows: GuidelineRow[] = [];

  const sugarVal = product.nutriments.sugars;
  if (sugarVal !== undefined) {
    const ref = g.daily.sugar_max_g;
    const percent = (sugarVal / ref) * 100;
    rows.push({
      nutrient: 'Sugar',
      productAmount: `${sugarVal.toFixed(1)}g`,
      dailyReference: `${ref}g`,
      percent: Math.round(percent),
      status: percent <= 30 ? 'favorable' : percent <= 60 ? 'moderate' : 'high',
    });
  }

  const sodiumVal = product.nutriments.sodium;
  if (sodiumVal !== undefined) {
    const ref = g.daily.sodium_max_mg;
    const sodiumMg = sodiumVal * 1000;
    const percent = (sodiumMg / ref) * 100;
    rows.push({
      nutrient: 'Sodium',
      productAmount: `${sodiumMg.toFixed(0)}mg`,
      dailyReference: `${ref}mg`,
      percent: Math.round(percent),
      status: percent <= 30 ? 'favorable' : percent <= 60 ? 'moderate' : 'high',
    });
  }

  const satFatVal = product.nutriments.saturated_fat;
  if (satFatVal !== undefined) {
    const ref = g.daily.saturated_fat_max_g;
    const percent = (satFatVal / ref) * 100;
    rows.push({
      nutrient: 'Saturated Fat',
      productAmount: `${satFatVal.toFixed(1)}g`,
      dailyReference: `${ref}g`,
      percent: Math.round(percent),
      status: percent <= 30 ? 'favorable' : percent <= 60 ? 'moderate' : 'high',
    });
  }

  const proteinVal = product.nutriments.proteins;
  if (proteinVal !== undefined) {
    const ref = g.daily.protein_min_g;
    const percent = (proteinVal / ref) * 100;
    rows.push({
      nutrient: 'Protein',
      productAmount: `${proteinVal.toFixed(1)}g`,
      dailyReference: `${ref}g`,
      percent: Math.round(percent),
      status: percent >= 50 ? 'favorable' : percent >= 25 ? 'moderate' : 'high',
    });
  }

  const fiberVal = product.nutriments.fiber;
  if (fiberVal !== undefined) {
    const ref = g.daily.fiber_min_g;
    const percent = (fiberVal / ref) * 100;
    rows.push({
      nutrient: 'Fiber',
      productAmount: `${fiberVal.toFixed(1)}g`,
      dailyReference: `${ref}g`,
      percent: Math.round(percent),
      status: percent >= 50 ? 'favorable' : percent >= 25 ? 'moderate' : 'high',
    });
  }

  return rows;
}

function calculateDailyIntakeContribution(product: FoodProduct, country: CountryCode): {
  sugar: number;
  sodium: number;
  saturatedFat: number;
  protein: number;
  fiber: number;
} {
  const g = getCountryGuidelines(country);
  return {
    sugar: product.nutriments.sugars !== undefined ? Math.round((product.nutriments.sugars / g.daily.sugar_max_g) * 100) : 0,
    sodium: product.nutriments.sodium !== undefined ? Math.round(((product.nutriments.sodium * 1000) / g.daily.sodium_max_mg) * 100) : 0,
    saturatedFat: product.nutriments.saturated_fat !== undefined ? Math.round((product.nutriments.saturated_fat / g.daily.saturated_fat_max_g) * 100) : 0,
    protein: product.nutriments.proteins !== undefined ? Math.round((product.nutriments.proteins / g.daily.protein_min_g) * 100) : 0,
    fiber: product.nutriments.fiber !== undefined ? Math.round((product.nutriments.fiber / g.daily.fiber_min_g) * 100) : 0,
  };
}

function generateScoreExplanation(breakdown: { nutrition: number; ingredients: number; processing: number; positiveFactors: number; countryAlignment: number }, maxScores: { nutrition: number; ingredients: number; processing: number; positiveFactors: number; countryAlignment: number }): string {
  const parts: string[] = [];
  if (breakdown.nutrition > 0) parts.push(`Nutrition Quality: ${breakdown.nutrition.toFixed(1)}/${maxScores.nutrition}`);
  if (breakdown.ingredients > 0) parts.push(`Ingredient Quality: ${breakdown.ingredients.toFixed(1)}/${maxScores.ingredients}`);
  if (breakdown.processing > 0) parts.push(`Processing: ${breakdown.processing.toFixed(1)}/${maxScores.processing}`);
  if (breakdown.positiveFactors > 0) parts.push(`Positive Factors: ${breakdown.positiveFactors.toFixed(1)}/${maxScores.positiveFactors}`);
  if (breakdown.countryAlignment > 0) parts.push(`Country Alignment: ${breakdown.countryAlignment.toFixed(1)}/${maxScores.countryAlignment}`);
  return parts.length > 0 ? `Score is the sum of: ${parts.join(', ')}.` : 'Score based on available data.';
}

export function calculateEnhancedHealthScore(
  product: FoodProduct,
  country: CountryCode = 'US'
): EnhancedHealthScore {
  const nutritionScore = calculateNutritionScore(product.nutriments);
  const ingredientScore = calculateIngredientScore(product);
  const processingScore = calculateProcessingScore(product);
  const positiveScore = calculatePositiveFactorsScore(product);
  const countryAlignmentScore = calculateCountryAlignment(product, country);

  const totalScore = nutritionScore.score + ingredientScore.score + processingScore.score + positiveScore.score + countryAlignmentScore.score;
  const maxTotal = nutritionScore.maxScore + ingredientScore.maxScore + processingScore.maxScore + positiveScore.maxScore + countryAlignmentScore.maxScore;

  const normalizedScore = Math.round((totalScore / maxTotal) * 10 * 10) / 10;

  const allReasons = [
    ...nutritionScore.reasons,
    ...ingredientScore.reasons,
    ...processingScore.reasons,
    ...positiveScore.reasons,
    ...countryAlignmentScore.reasons,
  ].sort((a, b) => Math.abs(b.score) - Math.abs(a.score)).slice(0, 3);

  const topPositives = allReasons.filter(r => r.impact === 'positive').map(r => r.title);
  const topNegatives = allReasons.filter(r => r.impact === 'negative').map(r => r.title);

  const { confidence, note } = calculateDataConfidence(product);
  const specializedScores = calculateSpecializedScores(product.nutriments, country);
  const dailyIntakeContribution = calculateDailyIntakeContribution(product, country);
  const guidelineComparison = buildGuidelineComparison(product, country);
  const scoreExplanation = generateScoreExplanation(
    { nutrition: nutritionScore.score, ingredients: ingredientScore.score, processing: processingScore.score, positiveFactors: positiveScore.score, countryAlignment: countryAlignmentScore.score },
    { nutrition: nutritionScore.maxScore, ingredients: ingredientScore.maxScore, processing: processingScore.maxScore, positiveFactors: positiveScore.maxScore, countryAlignment: countryAlignmentScore.maxScore }
  );

  return {
    score: normalizedScore,
    grade: getGradeFromScore(normalizedScore),
    verdict: getVerdict(normalizedScore),
    breakdown: {
      nutrition: nutritionScore.score,
      ingredients: ingredientScore.score,
      processing: processingScore.score,
      positiveFactors: positiveScore.score,
      countryAlignment: countryAlignmentScore.score,
    },
    maxScores: {
      nutrition: nutritionScore.maxScore,
      ingredients: ingredientScore.maxScore,
      processing: processingScore.maxScore,
      positiveFactors: positiveScore.maxScore,
      countryAlignment: countryAlignmentScore.maxScore,
    },
    topReasons: allReasons,
    topPositives,
    topNegatives,
    childSuitability: specializedScores.childSuitability,
    weightLossFriendliness: specializedScores.weightLossFriendliness,
    diabetesFriendliness: specializedScores.diabetesFriendliness,
    bloodPressureFriendliness: specializedScores.bloodPressureFriendliness,
    dailyIntakeContribution,
    guidelineComparison,
    dataConfidence: confidence,
    confidenceNote: note,
    summary: generateConsumerSummary(product, normalizedScore, country, topPositives, topNegatives),
    scoreExplanation,
    country,
  };
}

function generateConsumerSummary(
  product: FoodProduct,
  score: number,
  country: CountryCode,
  topPositives: string[],
  topNegatives: string[]
): string {
  const guidelines = getCountryGuidelines(country);

  if (score >= 8) {
    const parts = topPositives.length > 0 ? [`This product scores well on ${topPositives.join(', ')}.`] : [];
    parts.push(`Excellent nutritional profile — a great choice for a balanced diet per ${guidelines.countryName} guidelines.`);
    return parts.join(' ');
  }
  if (score >= 6) {
    const parts = topPositives.length > 0 ? [`Notable for ${topPositives.join(', ')}.`] : [];
    if (topNegatives.length > 0) parts.push(`Be mindful of ${topNegatives.join(', ')}.`);
    parts.push(`Good option for regular consumption in moderation when following ${guidelines.countryName} guidelines.`);
    return parts.join(' ');
  }
  if (score >= 4) {
    const parts = topPositives.length > 0 ? [`Has ${topPositives.join(', ')}.`] : [];
    if (topNegatives.length > 0) parts.push(`However, concerns include ${topNegatives.join(', ')}.`);
    parts.push(`Best consumed occasionally. Consider healthier alternatives per ${guidelines.countryName} recommendations.`);
    return parts.join(' ');
  }
  if (score >= 2) {
    return `Poor nutritional profile. Concerns: ${topNegatives.slice(0, 3).join(', ')}. Limit consumption and seek healthier alternatives per ${guidelines.countryName} guidelines.`;
  }
  return `Very poor nutritional profile. Multiple concerns including ${topNegatives.slice(0, 3).join(', ')}. We recommend avoiding frequent consumption.`;
}
