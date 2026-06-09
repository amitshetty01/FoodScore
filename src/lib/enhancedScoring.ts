/**
 * Enhanced Scoring Engine
 * Country-aware scoring with 0-100 scale
 * Incorporates nutrition, ingredients, processing, and specialized health metrics
 */

import { FoodProduct, NutritionFacts } from '@/types';
import { CountryCode, getCountryGuidelines, calculateDailyIntakeContribution, exceedsLimit } from './countryRules';
import { analyzeIngredients, isIngredientRestricted } from './ingredientIntelligence';

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
  // Primary score (0-100)
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'E';
  
  // Quick verdict
  verdict: QuickVerdict;
  
  // Score breakdown by category
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
  
  // Top 3 reasons
  topReasons: ScoreReason[];
  
  // Specialized health metrics
  childSuitability: HealthScore;
  weightLossFriendliness: HealthScore;
  diabetesFriendliness: HealthScore;
  bloodPressureFriendliness: HealthScore;
  
  // Daily intake contributions
  dailyIntakeContribution: {
    sugar: number;
    sodium: number;
    saturatedFat: number;
    protein: number;
    fiber: number;
  };
  
  // Data confidence
  dataConfidence: DataConfidence;
  
  // AI Summary
  summary: string;
  
  // Country-specific analysis
  country: CountryCode;
}

/**
 * Calculate nutrition score (0-40 points)
 */
function calculateNutritionScore(
  nutriments: NutritionFacts,
  country: CountryCode
): { score: number; maxScore: number; reasons: ScoreReason[] } {
  let score = 0;
  const maxScore = 40;
  const reasons: ScoreReason[] = [];
  const guidelines = getCountryGuidelines(country);
  
  // Protein (0-8 points)
  if ((nutriments.proteins ?? 0) >= guidelines.daily.protein_min_g) {
    score += 8;
    reasons.push({
      title: 'Adequate Protein',
      description: `Contains ${nutriments.proteins}g protein, meeting daily recommendations.`,
      impact: 'positive',
      score: 8,
    });
  } else if ((nutriments.proteins ?? 0) >= guidelines.daily.protein_min_g * 0.5) {
    score += 4;
    reasons.push({
      title: 'Moderate Protein',
      description: `Contains ${nutriments.proteins}g protein, partially meeting recommendations.`,
      impact: 'positive',
      score: 4,
    });
  } else if ((nutriments.proteins ?? 0) > 0) {
    score += 2;
  }
  
  // Fiber (0-8 points)
  if ((nutriments.fiber ?? 0) >= guidelines.daily.fiber_min_g * 0.1) {
    score += 8;
    reasons.push({
      title: 'Good Fiber Content',
      description: `Contains ${nutriments.fiber}g fiber, supporting digestive health.`,
      impact: 'positive',
      score: 8,
    });
  } else if ((nutriments.fiber ?? 0) >= guidelines.daily.fiber_min_g * 0.05) {
    score += 4;
  }
  
  // Sugar penalty (0-12 points deduction)
  const dailySugarLimit = guidelines.daily.sugar_max_g;
  if ((nutriments.sugars ?? 0) <= dailySugarLimit * 0.1) {
    score += 12; // Low sugar
  } else if ((nutriments.sugars ?? 0) <= dailySugarLimit * 0.25) {
    score += 8;
  } else if ((nutriments.sugars ?? 0) <= dailySugarLimit * 0.5) {
    score += 4;
  } else {
    score += 0;
    reasons.push({
      title: 'High Sugar Content',
      description: `Contains ${nutriments.sugars}g sugar, exceeding recommended limits.`,
      impact: 'negative',
      score: -12,
    });
  }
  
  // Sodium penalty (0-8 points)
  const dailySodiumLimit = guidelines.daily.sodium_max_mg;
  if ((nutriments.sodium ?? 0) <= dailySodiumLimit * 0.1) {
    score += 8;
  } else if ((nutriments.sodium ?? 0) <= dailySodiumLimit * 0.25) {
    score += 4;
  } else if ((nutriments.sodium ?? 0) > dailySodiumLimit * 0.5) {
    score += 0;
    reasons.push({
      title: 'High Sodium Content',
      description: `Contains ${nutriments.sodium}mg sodium, potentially exceeding safe limits.`,
      impact: 'negative',
      score: -8,
    });
  }
  
  // Saturated fat penalty (0-4 points)
  const dailySatFatLimit = guidelines.daily.saturated_fat_max_g;
  if ((nutriments.saturated_fat ?? 0) <= dailySatFatLimit * 0.1) {
    score += 4;
  } else if ((nutriments.saturated_fat ?? 0) > dailySatFatLimit * 0.5) {
    score += 0;
  }
  
  return {
    score: Math.min(maxScore, Math.max(0, score)),
    maxScore,
    reasons,
  };
}

/**
 * Calculate ingredient quality score (0-30 points)
 */
function calculateIngredientScore(
  product: FoodProduct,
  country: CountryCode
): { score: number; maxScore: number; reasons: ScoreReason[] } {
  let score = 0;
  const maxScore = 30;
  const reasons: ScoreReason[] = [];
  
  const ingredients = product.ingredients?.split(/[,;•]/).filter(Boolean) || [];
  const analysis = analyzeIngredients(ingredients, country);
  
  // Base score for having ingredient data
  if (ingredients.length === 0) {
    return { score: 0, maxScore, reasons: [{ title: 'No Ingredient Data', description: 'Unable to analyze ingredients.', impact: 'negative', score: -30 }] };
  }
  
  score += 5; // Base for having ingredient list
  
  // Penalize for harmful additives
  const harmful = product.additives?.filter(a => ['BHA', 'BHT', 'TBHQ', 'tartrazine', 'allura red'].some(h => a.toLowerCase().includes(h.toLowerCase()))) || [];
  if (harmful.length === 0) {
    score += 10;
    reasons.push({
      title: 'No Harmful Additives Detected',
      description: 'Product does not contain known harmful preservatives or artificial colors.',
      impact: 'positive',
      score: 10,
    });
  } else {
    score -= harmful.length * 3;
    reasons.push({
      title: 'Contains Harmful Additives',
      description: `Contains ${harmful.join(', ')}.`,
      impact: 'negative',
      score: -harmful.length * 3,
    });
  }
  
  // Reward for natural ingredients (fewer additives)
  if ((product.additives?.length ?? 0) === 0) {
    score += 10;
    reasons.push({
      title: 'No Added Additives',
      description: 'Clean ingredient list with no artificial preservatives.',
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
  
  return {
    score: Math.min(maxScore, Math.max(0, score)),
    maxScore,
    reasons,
  };
}

/**
 * Calculate processing level penalty (0-15 points)
 */
function calculateProcessingScore(product: FoodProduct): { score: number; maxScore: number; reasons: ScoreReason[] } {
  let score = 0;
  const maxScore = 15;
  const reasons: ScoreReason[] = [];
  
  // NOVA processing levels
  if (product.novaGroup === 1) {
    score += 15;
    reasons.push({
      title: 'Minimally Processed',
      description: 'Product is unprocessed or naturally processed with no additives.',
      impact: 'positive',
      score: 15,
    });
  } else if (product.novaGroup === 2) {
    score += 12;
    reasons.push({
      title: 'Slightly Processed',
      description: 'Contains minimal processing; preserves natural food components.',
      impact: 'positive',
      score: 12,
    });
  } else if (product.novaGroup === 3) {
    score += 8;
    reasons.push({
      title: 'Moderately Processed',
      description: 'Standard food preparation; some processing but maintains nutritional value.',
      impact: 'positive',
      score: 8,
    });
  } else if (product.novaGroup === 4) {
    score += 0;
    reasons.push({
      title: 'Ultra-Processed',
      description: 'Heavily processed with multiple additives and transformations.',
      impact: 'negative',
      score: -15,
    });
  } else {
    score += 7; // Unknown, assume moderate
  }
  
  return {
    score: Math.min(maxScore, Math.max(0, score)),
    maxScore,
    reasons,
  };
}

/**
 * Calculate positive factors bonus (0-15 points)
 */
function calculatePositiveFactorsScore(product: FoodProduct): { score: number; maxScore: number; reasons: ScoreReason[] } {
  let score = 0;
  const maxScore = 15;
  const reasons: ScoreReason[] = [];
  
  // Check for fortification
  if (product.labels && product.labels.some(l => l.toLowerCase().includes('fortified'))) {
    score += 5;
    reasons.push({
      title: 'Fortified with Nutrients',
      description: 'Product is fortified with additional essential nutrients.',
      impact: 'positive',
      score: 5,
    });
  }
  
  // Whole grain bonus
  const wholeGrainIndicators = ['whole grain', 'oat', 'brown rice', 'quinoa', 'barley'];
  if (product.name && wholeGrainIndicators.some(w => product.name.toLowerCase().includes(w))) {
    score += 5;
    reasons.push({
      title: 'Contains Whole Grains',
      description: 'Product is made with whole grains, providing nutritional benefits.',
      impact: 'positive',
      score: 5,
    });
  }
  
  // Check for allergen awareness
  if (product.allergens && product.allergens.length > 0) {
    score += 2; // Points for transparency
  }
  
  // Natural/Organic bonus
  if (product.labels && product.labels.some(l => l.toLowerCase().includes('organic'))) {
    score += 3;
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
  let maxFields = 8;
  
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
 * Generate specialized health scores
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
  
  // Child suitability
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
  
  // Diabetes friendliness
  let dbScore = 0;
  if ((nutriments.sugars ?? 0) <= guidelines.daily.sugar_max_g * 0.1) dbScore += 4;
  if ((nutriments.carbohydrates ?? 0) <= 30) dbScore += 3;
  if ((nutriments.fiber ?? 0) >= 3) dbScore += 3;
  const diabetesFriendliness: HealthScore = dbScore >= 8 ? 'Excellent' : dbScore >= 6 ? 'Good' : dbScore >= 3 ? 'Moderate' : 'Poor';
  
  // Blood pressure friendliness
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

/**
 * Generate AI consumer summary
 */
function getGradeFromScore(score: number): 'A' | 'B' | 'C' | 'D' | 'E' {
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 55) return 'C';
  if (score >= 40) return 'D';
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
  if ((product.nutriments.sugars ?? 0) > guidelines.daily.sugar_max_g * 0.25) {
    negatives.push(`high sugar content (${product.nutriments.sugars}g)`);
  }
  if ((product.nutriments.sodium ?? 0) > guidelines.daily.sodium_max_mg * 0.15) {
    negatives.push(`significant sodium (${product.nutriments.sodium}mg)`);
  }
  if (product.novaGroup === 4) {
    negatives.push('heavily processed');
  }
  
  // Build summary
  if (positives.length > 0) {
    summary += `Offers ${positives.join(', ')}. `;
  }
  
  if (negatives.length > 0) {
    summary += `However, ${negatives.join(', ')}. `;
  }
  
  // Recommendation
  if (score >= 70) {
    summary += 'Suitable as a regular dietary component.';
  } else if (score >= 50) {
    summary += 'Best consumed occasionally rather than regularly.';
  } else {
    summary += 'Consider healthier alternatives for frequent consumption.';
  }
  
  return summary;
}

/**
 * Calculate enhanced health score (main function)
 */
export function calculateEnhancedHealthScore(
  product: FoodProduct,
  country: CountryCode = 'US'
): EnhancedHealthScore {
  // Calculate component scores
  const nutritionScore = calculateNutritionScore(product.nutriments, country);
  const ingredientScore = calculateIngredientScore(product, country);
  const processingScore = calculateProcessingScore(product);
  const positiveScore = calculatePositiveFactorsScore(product);
  
  // Total score (0-100)
  const totalScore = nutritionScore.score + ingredientScore.score + processingScore.score + positiveScore.score;
  const maxTotal = nutritionScore.maxScore + ingredientScore.maxScore + processingScore.maxScore + positiveScore.maxScore;
  const normalizedScore = (totalScore / maxTotal) * 100;
  
  // Determine verdict
  let verdict: QuickVerdict = 'Occasional Choice';
  if (normalizedScore >= 80) {
    verdict = 'Excellent Choice';
  } else if (normalizedScore >= 60) {
    verdict = 'Good Choice';
  } else if (normalizedScore >= 40) {
    verdict = 'Occasional Choice';
  } else if (normalizedScore >= 20) {
    verdict = 'Limit Consumption';
  } else {
    verdict = 'Avoid Frequent Consumption';
  }
  
  // Collect top reasons
  const allReasons = [
    ...nutritionScore.reasons,
    ...ingredientScore.reasons,
    ...processingScore.reasons,
    ...positiveScore.reasons,
  ].sort((a, b) => Math.abs(b.score) - Math.abs(a.score)).slice(0, 3);
  
  // Daily intake contributions
  const guidelines = getCountryGuidelines(country);
  const dailyIntakeContribution = {
    sugar: calculateDailyIntakeContribution(country, product.nutriments.sugars ?? 0, 'sugar_max_g'),
    sodium: calculateDailyIntakeContribution(country, product.nutriments.sodium ?? 0, 'sodium_max_mg'),
    saturatedFat: calculateDailyIntakeContribution(country, product.nutriments.saturated_fat ?? 0, 'saturated_fat_max_g'),
    protein: calculateDailyIntakeContribution(country, product.nutriments.proteins ?? 0, 'protein_min_g'),
    fiber: calculateDailyIntakeContribution(country, product.nutriments.fiber ?? 0, 'fiber_min_g'),
  };
  
  const specializedScores = calculateSpecializedScores(product.nutriments, country);
  
  return {
    score: Math.round(normalizedScore),
    grade: getGradeFromScore(Math.round(normalizedScore)),
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
