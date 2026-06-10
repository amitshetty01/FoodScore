/**
 * Enhanced Scoring Engine
 * Country-aware scoring with 1-10 scale
 * Incorporates nutrition, ingredients, processing, and specialized health metrics
 */

import { FoodProduct, NutritionFacts } from '@/types';
import { CountryCode, getCountryGuidelines, calculateDailyIntakeContribution } from './countryRules';
import { analyzeIngredients } from './ingredientIntelligence';

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
  };
  maxScores: {
    nutrition: number;
    ingredients: number;
    processing: number;
    positiveFactors: number;
  };
  topReasons: ScoreReason[];
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
  dataConfidence: DataConfidence;
  summary: string;
  country: CountryCode;
}

/**
 * Calculate nutrition score (0-40 points)
 * Uses country-specific daily limits for sugar, sodium, saturated fat
 * and minimum targets for protein and fiber.
 */
function calculateNutritionScore(
  nutriments: NutritionFacts,
  country: CountryCode
): { score: number; maxScore: number; reasons: ScoreReason[] } {
  let score = 0;
  const maxScore = 40;
  const reasons: ScoreReason[] = [];
  const guidelines = getCountryGuidelines(country);

  // Protein (0-8 points) — country protein_min_g
  if ((nutriments.proteins ?? 0) >= guidelines.daily.protein_min_g) {
    score += 8;
    reasons.push({
      title: 'Adequate Protein',
      description: `Contains ${nutriments.proteins}g protein, meeting ${guidelines.countryName} daily recommendations.`,
      impact: 'positive',
      score: 8,
    });
  } else if ((nutriments.proteins ?? 0) >= guidelines.daily.protein_min_g * 0.5) {
    score += 4;
    reasons.push({
      title: 'Moderate Protein',
      description: `Contains ${nutriments.proteins}g protein, partially meeting ${guidelines.countryName} recommendations.`,
      impact: 'positive',
      score: 4,
    });
  } else if ((nutriments.proteins ?? 0) > 0) {
    score += 2;
  }

  // Fiber (0-8 points) — country fiber_min_g
  if ((nutriments.fiber ?? 0) >= guidelines.daily.fiber_min_g * 0.1) {
    score += 8;
    reasons.push({
      title: 'Good Fiber Content',
      description: `Contains ${nutriments.fiber}g fiber, supporting digestive health per ${guidelines.countryName} guidelines.`,
      impact: 'positive',
      score: 8,
    });
  } else if ((nutriments.fiber ?? 0) >= guidelines.daily.fiber_min_g * 0.05) {
    score += 4;
  }

  // Sugar penalty (0-12 points) — uses per-serving threshold
  const servingSugarLimit = guidelines.serving.sugar_max_g;
  if ((nutriments.sugars ?? 0) <= servingSugarLimit * 0.5) {
    score += 12;
    reasons.push({
      title: 'Very Low Sugar',
      description: `Contains ${nutriments.sugars}g sugar per serving — well within ${guidelines.countryName} per-serving limits (${servingSugarLimit}g).`,
      impact: 'positive',
      score: 12,
    });
  } else if ((nutriments.sugars ?? 0) <= servingSugarLimit) {
    score += 8;
    reasons.push({
      title: 'Low Sugar',
      description: `Contains ${nutriments.sugars}g sugar per serving — within ${guidelines.countryName} per-serving limits (${servingSugarLimit}g).`,
      impact: 'positive',
      score: 8,
    });
  } else if ((nutriments.sugars ?? 0) <= servingSugarLimit * 2) {
    score += 4;
  } else {
    reasons.push({
      title: 'High Sugar Content',
      description: `Contains ${nutriments.sugars}g sugar per serving, exceeding ${guidelines.countryName} per-serving limits (${servingSugarLimit}g).`,
      impact: 'negative',
      score: -12,
    });
  }

  // Sodium penalty (0-8 points) — uses per-serving threshold
  const servingSodiumLimit = guidelines.serving.sodium_max_mg;
  if ((nutriments.sodium ?? 0) <= servingSodiumLimit * 0.5) {
    score += 8;
    reasons.push({
      title: 'Very Low Sodium',
      description: `Contains ${nutriments.sodium}mg sodium per serving — well within ${guidelines.countryName} per-serving limits (${servingSodiumLimit}mg).`,
      impact: 'positive',
      score: 8,
    });
  } else if ((nutriments.sodium ?? 0) <= servingSodiumLimit) {
    score += 4;
  } else if ((nutriments.sodium ?? 0) <= servingSodiumLimit * 1.5) {
    // neutral — noticeable but within acceptable range
  } else {
    reasons.push({
      title: 'High Sodium Content',
      description: `Contains ${nutriments.sodium}mg sodium per serving, exceeding ${guidelines.countryName} per-serving limits (${servingSodiumLimit}mg).`,
      impact: 'negative',
      score: -8,
    });
  }

  // Saturated fat penalty (0-4 points) — uses per-serving threshold
  const servingSatFatLimit = guidelines.serving.saturated_fat_max_g;
  if ((nutriments.saturated_fat ?? 0) <= servingSatFatLimit * 0.5) {
    score += 4;
  } else if ((nutriments.saturated_fat ?? 0) > servingSatFatLimit * 1.5) {
    reasons.push({
      title: 'High Saturated Fat',
      description: `Contains ${nutriments.saturated_fat}g saturated fat per serving, exceeding ${guidelines.countryName} per-serving limits (${servingSatFatLimit}g).`,
      impact: 'negative',
      score: -4,
    });
  }

  return {
    score: Math.min(maxScore, Math.max(0, score)),
    maxScore,
    reasons,
  };
}

/**
 * Calculate ingredient quality score (0-30 points)
 * Uses country-specific additive restrictions and ingredient risk analysis.
 */
function calculateIngredientScore(
  product: FoodProduct,
  country: CountryCode
): { score: number; maxScore: number; reasons: ScoreReason[] } {
  let score = 0;
  const maxScore = 30;
  const reasons: ScoreReason[] = [];
  const guidelines = getCountryGuidelines(country);

  const ingredients = product.ingredients?.split(/[,;•]/).filter(Boolean) || [];

  if (ingredients.length === 0) {
    return { score: 0, maxScore, reasons: [{ title: 'No Ingredient Data', description: `Unable to analyze ingredients per ${guidelines.countryName} standards.`, impact: 'negative', score: -30 }] };
  }

  score += 5; // Base for having ingredient list

  // Country-specific additive analysis
  const analysis = analyzeIngredients(ingredients, country);

  // Penalize for country-specific restricted additives
  const harmfulAdditiveKeywords = [
    ...guidelines.artificialAdditives.colors,
    ...guidelines.artificialAdditives.sweeteners,
    ...guidelines.artificialAdditives.preservatives,
  ];

  const countryRestrictedAdditives = (product.additives || []).filter(a =>
    harmfulAdditiveKeywords.some(h => a.toLowerCase().includes(h.toLowerCase()))
  );

  if (countryRestrictedAdditives.length > 0) {
    const penalty = Math.min(countryRestrictedAdditives.length * 3, 10);
    score -= penalty;
    reasons.push({
      title: `${guidelines.countryName}-Restricted Additives`,
      description: `Contains ${countryRestrictedAdditives.join(', ')} which are flagged under ${guidelines.countryName} guidelines.`,
      impact: 'negative',
      score: -penalty,
    });
  }

  if (analysis.countryRestrictions.length > 0) {
    score -= Math.min(analysis.countryRestrictions.length * 2, 6);
    reasons.push({
      title: 'Country-Restricted Ingredients',
      description: analysis.countryRestrictions.slice(0, 2).join('; '),
      impact: 'negative',
      score: -Math.min(analysis.countryRestrictions.length * 2, 6),
    });
  }

  // Reward for clean ingredients — stricter threshold when country has tighter rules
  if ((product.additives?.length ?? 0) === 0) {
    score += 10;
    reasons.push({
      title: 'No Added Additives',
      description: `Clean ingredient list with no artificial additives per ${guidelines.countryName} standards.`,
      impact: 'positive',
      score: 10,
    });
  } else if ((product.additives?.length ?? 0) <= 3) {
    score += 5;
  } else if ((product.additives?.length ?? 0) > 8) {
    score -= 5;
    reasons.push({
      title: 'High Additive Count',
      description: `Contains ${product.additives?.length} additives, indicating heavy processing.`,
      impact: 'negative',
      score: -5,
    });
  }

  // Reward for beneficial labels
  if (product.labels && product.labels.length > 0) {
    const beneficialLabels = product.labels.filter(l =>
      ['organic', 'natural', 'whole grain', 'high protein', 'low sugar', 'fortified', 'probiotic'].some(b => l.toLowerCase().includes(b))
    );
    if (beneficialLabels.length > 0) {
      score += Math.min(5, beneficialLabels.length * 2);
      reasons.push({
        title: 'Beneficial Certifications',
        description: `Product carries positive certifications: ${beneficialLabels.join(', ')}.`,
        impact: 'positive',
        score: Math.min(5, beneficialLabels.length * 2),
      });
    }
  }

  // Reward for having predominantly safe ingredients (from analysis)
  if (analysis.safeIngredients.length >= analysis.totalIngredients * 0.5) {
    score += 3;
    reasons.push({
      title: 'Predominantly Safe Ingredients',
      description: `Most ingredients are classified as safe per ${guidelines.countryName} standards.`,
      impact: 'positive',
      score: 3,
    });
  }

  return {
    score: Math.min(maxScore, Math.max(0, score)),
    maxScore,
    reasons,
  };
}

/**
 * Calculate processing level penalty (0-15 points)
 * Uses country-specific processing perspectives when available.
 */
function calculateProcessingScore(
  product: FoodProduct,
  country: CountryCode
): { score: number; maxScore: number; reasons: ScoreReason[] } {
  let score = 0;
  const maxScore = 15;
  const reasons: ScoreReason[] = [];
  const guidelines = getCountryGuidelines(country);

  // NOVA processing levels — some countries have stricter views on processing
  if (product.novaGroup === 1) {
    score += 15;
    reasons.push({
      title: 'Minimally Processed',
      description: `Unprocessed or naturally processed — best choice per ${guidelines.countryName} dietary guidelines.`,
      impact: 'positive',
      score: 15,
    });
  } else if (product.novaGroup === 2) {
    score += 12;
    reasons.push({
      title: 'Slightly Processed',
      description: `Contains minimal processing; preserves natural food components (${guidelines.countryName} guidelines).`,
      impact: 'positive',
      score: 12,
    });
  } else if (product.novaGroup === 3) {
    score += 8;
  } else if (product.novaGroup === 4) {
    reasons.push({
      title: 'Ultra-Processed',
      description: `Heavily processed — ${guidelines.countryName} guidelines recommend limiting ultra-processed foods.`,
      impact: 'negative',
      score: -15,
    });
  } else {
    score += 7;
  }

  // Additional penalty for high additive count (linked to processing)
  if ((product.additives?.length ?? 0) > 10) {
    score -= 3;
  }

  return {
    score: Math.min(maxScore, Math.max(0, score)),
    maxScore,
    reasons,
  };
}

/**
 * Calculate positive factors bonus (0-15 points)
 * Uses country-specific fortification standards.
 */
function calculatePositiveFactorsScore(
  product: FoodProduct,
  country: CountryCode
): { score: number; maxScore: number; reasons: ScoreReason[] } {
  let score = 0;
  const maxScore = 15;
  const reasons: ScoreReason[] = [];
  const guidelines = getCountryGuidelines(country);

  // Country-specific fortification bonus
  if (product.labels && product.labels.length > 0) {
    const matchingFortifications = product.labels.filter(l =>
      guidelines.fortificationStandards.some(f => l.toLowerCase().includes(f.toLowerCase()))
    );
    if (matchingFortifications.length > 0) {
      score += Math.min(5, matchingFortifications.length * 2);
      reasons.push({
        title: `Fortified per ${guidelines.countryName} Standards`,
        description: `Product is fortified with: ${matchingFortifications.join(', ')} — aligns with ${guidelines.countryName} fortification recommendations.`,
        impact: 'positive',
        score: Math.min(5, matchingFortifications.length * 2),
      });
    }
  }

  // Whole grain bonus
  const wholeGrainIndicators = ['whole grain', 'oat', 'brown rice', 'quinoa', 'barley'];
  if (product.name && wholeGrainIndicators.some(w => product.name.toLowerCase().includes(w))) {
    score += 5;
    reasons.push({
      title: 'Contains Whole Grains',
      description: `Product is made with whole grains, providing nutritional benefits per ${guidelines.countryName} guidelines.`,
      impact: 'positive',
      score: 5,
    });
  }

  // Check for allergen awareness
  if (product.allergens && product.allergens.length > 0) {
    score += 2;
  }

  // Natural/Organic bonus
  if (product.labels && product.labels.some(l => l.toLowerCase().includes('organic'))) {
    score += 3;
    reasons.push({
      title: 'Organic Certification',
      description: `Organic certification recognized under ${guidelines.countryName} standards.`,
      impact: 'positive',
      score: 3,
    });
  }

  return {
    score: Math.min(maxScore, Math.max(0, score)),
    maxScore,
    reasons,
  };
}

/**
 * Generate data confidence score
 */
function calculateDataConfidence(product: FoodProduct): DataConfidence {
  let completeness = 0;
  const maxFields = 8;

  if (product.ingredients) completeness++;
  if (product.nutriments.proteins !== undefined) completeness++;
  if (product.nutriments.sugars !== undefined) completeness++;
  if (product.nutriments.sodium !== undefined) completeness++;
  if (product.nutriments.fat !== undefined) completeness++;
  if (product.additives) completeness++;
  if (product.labels) completeness++;
  if (product.allergens) completeness++;

  const percentage = (completeness / maxFields) * 100;

  if (percentage >= 80) return 'High Confidence';
  if (percentage >= 50) return 'Medium Confidence';
  return 'Low Confidence';
}

/**
 * Generate specialized health scores using country-specific child guidelines
 */
function calculateSpecializedScores(
  nutriments: NutritionFacts,
  country: CountryCode
): {
  childSuitability: HealthScore;
  weightLossFriendliness: HealthScore;
  diabetesFriendliness: HealthScore;
  bloodPressureFriendliness: HealthScore;
} {
  const guidelines = getCountryGuidelines(country);

  // Child suitability — uses country childGuidelines
  let childScore = 0;
  if ((nutriments.sugars ?? 0) <= guidelines.childGuidelines.sugar_max_g) childScore += 3;
  if ((nutriments.sodium ?? 0) <= guidelines.childGuidelines.sodium_max_mg) childScore += 3;
  if ((nutriments.proteins ?? 0) >= guidelines.childGuidelines.protein_min_g * 0.5) childScore += 3;
  const childSuitability: HealthScore = childScore >= 7 ? 'Excellent' : childScore >= 5 ? 'Good' : childScore >= 3 ? 'Moderate' : 'Poor';

  // Weight loss friendliness
  let wlScore = 0;
  if ((nutriments.energy_kcal ?? 0) <= 150) wlScore += 3;
  if ((nutriments.proteins ?? 0) >= 5) wlScore += 3;
  if ((nutriments.fiber ?? 0) >= 2) wlScore += 3;
  if ((nutriments.sugars ?? 0) <= 5) wlScore += 3;
  const weightLossFriendliness: HealthScore = wlScore >= 10 ? 'Excellent' : wlScore >= 7 ? 'Good' : wlScore >= 4 ? 'Moderate' : 'Poor';

  // Diabetes friendliness — uses country daily sugar limit
  let dbScore = 0;
  if ((nutriments.sugars ?? 0) <= guidelines.daily.sugar_max_g * 0.1) dbScore += 4;
  if ((nutriments.carbohydrates ?? 0) <= 30) dbScore += 3;
  if ((nutriments.fiber ?? 0) >= 3) dbScore += 3;
  const diabetesFriendliness: HealthScore = dbScore >= 8 ? 'Excellent' : dbScore >= 6 ? 'Good' : dbScore >= 3 ? 'Moderate' : 'Poor';

  // Blood pressure friendliness — uses country sodium limit
  let bpScore = 0;
  if ((nutriments.sodium ?? 0) <= guidelines.daily.sodium_max_mg * 0.1) bpScore += 5;
  if ((nutriments.fiber ?? 0) >= 2) bpScore += 3;
  if ((nutriments.saturated_fat ?? 0) <= 2) bpScore += 2;
  const bloodPressureFriendliness: HealthScore = bpScore >= 8 ? 'Excellent' : bpScore >= 5 ? 'Good' : bpScore >= 2 ? 'Moderate' : 'Poor';

  return {
    childSuitability,
    weightLossFriendliness,
    diabetesFriendliness,
    bloodPressureFriendliness,
  };
}

function getGradeFromScore(score: number): 'A' | 'B' | 'C' | 'D' | 'E' {
  if (score >= 8.5) return 'A';
  if (score >= 7.0) return 'B';
  if (score >= 5.5) return 'C';
  if (score >= 4.0) return 'D';
  return 'E';
}

function generateConsumerSummary(
  product: FoodProduct,
  score: number,
  country: CountryCode
): string {
  const guidelines = getCountryGuidelines(country);
  let summary = '';

  // Positives
  const positives: string[] = [];
  if ((product.nutriments.proteins ?? 0) >= guidelines.daily.protein_min_g * 0.1) {
    positives.push(`good protein content (${product.nutriments.proteins}g)`);
  }
  if ((product.nutriments.fiber ?? 0) >= 3) {
    positives.push('decent fiber for digestive health');
  }
  if ((product.additives?.length ?? 0) === 0) {
    positives.push('no artificial additives');
  }

  // Negatives
  const negatives: string[] = [];
  if ((product.nutriments.sugars ?? 0) > guidelines.serving.sugar_max_g) {
    negatives.push(`high sugar per serving (${product.nutriments.sugars}g vs ${guidelines.countryName} limit ${guidelines.serving.sugar_max_g}g)`);
  }
  if ((product.nutriments.sodium ?? 0) > guidelines.serving.sodium_max_mg) {
    negatives.push(`significant sodium per serving (${product.nutriments.sodium}mg vs ${guidelines.countryName} limit ${guidelines.serving.sodium_max_mg}mg)`);
  }
  if (product.novaGroup === 4) {
    negatives.push('heavily processed');
  }

  if (positives.length > 0) {
    summary += `Offers ${positives.join(', ')}. `;
  }

  if (negatives.length > 0) {
    summary += `However, ${negatives.join(', ')}. `;
  }

  if (score >= 7.0) {
    summary += 'Suitable as a regular dietary component.';
  } else if (score >= 5.0) {
    summary += 'Best consumed occasionally rather than regularly.';
  } else {
    summary += 'Consider healthier alternatives for frequent consumption.';
  }

  return summary;
}

/**
 * Calculate enhanced health score (main function)
 * All sub-scores are calculated with country-specific guidelines.
 */
export function calculateEnhancedHealthScore(
  product: FoodProduct,
  country: CountryCode = 'US'
): EnhancedHealthScore {
  const nutritionScore = calculateNutritionScore(product.nutriments, country);
  const ingredientScore = calculateIngredientScore(product, country);
  const processingScore = calculateProcessingScore(product, country);
  const positiveScore = calculatePositiveFactorsScore(product, country);

  const totalScore = nutritionScore.score + ingredientScore.score + processingScore.score + positiveScore.score;
  const maxTotal = nutritionScore.maxScore + ingredientScore.maxScore + processingScore.maxScore + positiveScore.maxScore;
  const rawScore = (totalScore / maxTotal) * 10;
  const normalizedScore = Math.round(rawScore * 10) / 10;

  let verdict: QuickVerdict = 'Occasional Choice';
  if (normalizedScore >= 8.0) {
    verdict = 'Excellent Choice';
  } else if (normalizedScore >= 6.0) {
    verdict = 'Good Choice';
  } else if (normalizedScore >= 4.0) {
    verdict = 'Occasional Choice';
  } else if (normalizedScore >= 2.0) {
    verdict = 'Limit Consumption';
  } else {
    verdict = 'Avoid Frequent Consumption';
  }

  const allReasons = [
    ...nutritionScore.reasons,
    ...ingredientScore.reasons,
    ...processingScore.reasons,
    ...positiveScore.reasons,
  ].sort((a, b) => Math.abs(b.score) - Math.abs(a.score)).slice(0, 3);

  const dailyIntakeContribution = {
    sugar: calculateDailyIntakeContribution(country, product.nutriments.sugars ?? 0, 'sugar_max_g'),
    sodium: calculateDailyIntakeContribution(country, product.nutriments.sodium ?? 0, 'sodium_max_mg'),
    saturatedFat: calculateDailyIntakeContribution(country, product.nutriments.saturated_fat ?? 0, 'saturated_fat_max_g'),
    protein: calculateDailyIntakeContribution(country, product.nutriments.proteins ?? 0, 'protein_min_g'),
    fiber: calculateDailyIntakeContribution(country, product.nutriments.fiber ?? 0, 'fiber_min_g'),
  };

  const specializedScores = calculateSpecializedScores(product.nutriments, country);

  return {
    score: normalizedScore,
    grade: getGradeFromScore(normalizedScore),
    verdict,
    breakdown: {
      nutrition: nutritionScore.score,
      ingredients: ingredientScore.score,
      processing: processingScore.score,
      positiveFactors: positiveScore.score,
    },
    maxScores: {
      nutrition: nutritionScore.maxScore,
      ingredients: ingredientScore.maxScore,
      processing: processingScore.maxScore,
      positiveFactors: positiveScore.maxScore,
    },
    topReasons: allReasons,
    childSuitability: specializedScores.childSuitability,
    weightLossFriendliness: specializedScores.weightLossFriendliness,
    diabetesFriendliness: specializedScores.diabetesFriendliness,
    bloodPressureFriendliness: specializedScores.bloodPressureFriendliness,
    dailyIntakeContribution,
    dataConfidence: calculateDataConfidence(product),
    summary: generateConsumerSummary(product, normalizedScore, country),
    country,
  };
}
