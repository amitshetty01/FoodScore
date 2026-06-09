/**
 * INTEGRATION EXAMPLE
 * 
 * This file demonstrates how to integrate the new country-aware scoring
 * and ingredient intelligence systems into your product page.
 * 
 * Copy and adapt this code into your actual product page components.
 */

import { FoodProduct, CountryCode } from '@/types';
import { calculateEnhancedHealthScore, EnhancedHealthScore } from '@/lib/enhancedScoring';
import { 
  getIngredientInfo, 
  analyzeIngredients,
  getIngredientCountryNotes,
  isIngredientRestricted 
} from '@/lib/ingredientIntelligence';
import { getCountryGuidelines } from '@/lib/countryRules';

// ============================================================================
// EXAMPLE 1: Calculate Enhanced Score
// ============================================================================

export function exampleCalculateScore(product: FoodProduct, country: CountryCode) {
  // Use the new 0-100 scoring system
  const enhancedScore = calculateEnhancedHealthScore(product, country);

  console.log('Enhanced Score:', {
    score: enhancedScore.score,           // 0-100
    verdict: enhancedScore.verdict,       // "Excellent Choice", "Good Choice", etc.
    topReasons: enhancedScore.topReasons, // Top 3 reasons with explanation
    summary: enhancedScore.summary,       // AI-generated natural language summary
    dataConfidence: enhancedScore.dataConfidence, // High/Medium/Low
  });

  return enhancedScore;
}

// ============================================================================
// EXAMPLE 2: Daily Intake Contributions
// ============================================================================

export function exampleDailyIntake(score: EnhancedHealthScore) {
  const { dailyIntakeContribution } = score;

  console.log('Daily Intake Contribution:', {
    sugar: `${dailyIntakeContribution.sugar.toFixed(1)}% of daily limit`,
    sodium: `${dailyIntakeContribution.sodium.toFixed(1)}% of daily limit`,
    saturatedFat: `${dailyIntakeContribution.saturatedFat.toFixed(1)}% of daily limit`,
    protein: `${dailyIntakeContribution.protein.toFixed(1)}% of daily limit`,
    fiber: `${dailyIntakeContribution.fiber.toFixed(1)}% of daily limit`,
  });

  // Display warning if exceeds limits
  if (dailyIntakeContribution.sugar > 100) {
    console.warn('⚠️  Sugar intake exceeds recommended daily limit!');
  }
  if (dailyIntakeContribution.sodium > 100) {
    console.warn('⚠️  Sodium intake exceeds recommended daily limit!');
  }
}

// ============================================================================
// EXAMPLE 3: Specialized Health Scores
// ============================================================================

export function exampleSpecializedScores(score: EnhancedHealthScore) {
  console.log('Specialized Health Scores:', {
    forChildren: score.childSuitability,           // Excellent, Good, Moderate, Poor
    forWeightLoss: score.weightLossFriendliness,   // Excellent, Good, Moderate, Poor
    forDiabetes: score.diabetesFriendliness,       // Excellent, Good, Moderate, Poor
    forBloodPressure: score.bloodPressureFriendliness, // Excellent, Good, Moderate, Poor
  });

  // Use case: Personalized filtering
  if (score.childSuitability === 'Excellent' || score.childSuitability === 'Good') {
    console.log('✅ This product is suitable for children');
  }

  if (score.weightLossFriendliness === 'Excellent') {
    console.log('✅ This product is excellent for weight loss');
  }
}

// ============================================================================
// EXAMPLE 4: Ingredient Analysis
// ============================================================================

export function exampleIngredientAnalysis(product: FoodProduct, country: CountryCode) {
  if (!product.ingredients) return;

  // Parse ingredients
  const ingredients = product.ingredients
    .split(/[,;•]/)
    .map(i => i.trim())
    .filter(Boolean);

  // Analyze all ingredients for this country
  const analysis = analyzeIngredients(ingredients, country);

  console.log('Ingredient Analysis:', {
    total: analysis.totalIngredients,
    riskBreakdown: analysis.riskBreakdown, // { Safe: X, 'Low Concern': X, ... }
    concerning: analysis.concerningIngredients,
    countryRestrictions: analysis.countryRestrictions,
  });

  // Individual ingredient analysis
  ingredients.forEach(ingredient => {
    const info = getIngredientInfo(ingredient);

    if (info) {
      console.log(`\n${ingredient}:`, {
        riskLevel: info.riskLevel,
        scientificConsensus: info.scientificConsensus.substring(0, 50) + '...',
        countryNotes: getIngredientCountryNotes(ingredient, country).substring(0, 50) + '...',
        restricted: isIngredientRestricted(ingredient, country),
      });
    }
  });
}

// ============================================================================
// EXAMPLE 5: Score Breakdown
// ============================================================================

export function exampleScoreBreakdown(score: EnhancedHealthScore) {
  const { breakdown, maxScores } = score;

  console.log('Score Breakdown:');
  console.log(`  Nutrition:        ${breakdown.nutrition}/${maxScores.nutrition}`);
  console.log(`  Ingredients:      ${breakdown.ingredients}/${maxScores.ingredients}`);
  console.log(`  Processing:       ${breakdown.processing}/${maxScores.processing}`);
  console.log(`  Positive Factors: ${breakdown.positiveFactors}/${maxScores.positiveFactors}`);
  console.log(`  ─────────────────────────────`);
  console.log(`  Total Score:      ${score.score}/100`);
}

// ============================================================================
// EXAMPLE 6: Top 3 Reasons
// ============================================================================

export function exampleTopReasons(score: EnhancedHealthScore) {
  console.log('Top 3 Reasons:', score.topReasons.map((reason, idx) => ({
    '#': idx + 1,
    title: reason.title,
    description: reason.description,
    impact: reason.impact === 'positive' ? '✅' : '⚠️',
    score: reason.score > 0 ? `+${reason.score}` : reason.score,
  })));
}

// ============================================================================
// EXAMPLE 7: AI Summary
// ============================================================================

export function exampleAISummary(score: EnhancedHealthScore) {
  console.log('AI-Generated Summary:');
  console.log(`"${score.summary}"`);
}

// ============================================================================
// EXAMPLE 8: Country-Specific Guidelines
// ============================================================================

export function exampleCountryGuidelines(country: CountryCode) {
  const guidelines = getCountryGuidelines(country);

  console.log(`Guidelines for ${guidelines.countryName}:`);
  console.log(`  References: ${guidelines.references.join(', ')}`);
  console.log(`  Daily Sugar Limit: ${guidelines.daily.sugar_max_g}g`);
  console.log(`  Daily Sodium Limit: ${guidelines.daily.sodium_max_mg}mg`);
  console.log(`  Daily Fiber Min: ${guidelines.daily.fiber_min_g}g`);
  console.log(`  Child Sugar Limit: ${guidelines.childGuidelines.sugar_max_g}g`);
  console.log(`  Child Sodium Limit: ${guidelines.childGuidelines.sodium_max_mg}mg`);
}

// ============================================================================
// EXAMPLE 9: React Component - Complete Product Analysis
// ============================================================================

import React from 'react';

interface ProductAnalysisProps {
  product: FoodProduct;
  country: CountryCode;
}

export const ProductAnalysisComponent: React.FC<ProductAnalysisProps> = ({
  product,
  country,
}) => {
  const score = calculateEnhancedHealthScore(product, country);
  const ingredients = product.ingredients?.split(/[,;•]/) || [];

  return (
    <div className="space-y-6">
      {/* Main Score Card */}
      <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm opacity-90">Health Score</p>
            <h2 className="text-6xl font-bold">{score.score}</h2>
            <p className="text-sm opacity-90">/100</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{score.verdict}</p>
            <p className="text-sm opacity-90">{score.dataConfidence}</p>
          </div>
        </div>
      </div>

      {/* AI Summary */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-2">Summary</p>
        <p className="text-sm text-blue-800 dark:text-blue-200">{score.summary}</p>
      </div>

      {/* Top 3 Reasons */}
      <div className="space-y-2">
        <h3 className="font-semibold text-sm">Top Reasons</h3>
        <div className="space-y-2">
          {score.topReasons.map((reason, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg ${
                reason.impact === 'positive'
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}
            >
              <p className="font-semibold text-sm">{reason.title}</p>
              <p className="text-xs mt-1">{reason.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Intake */}
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
        <h3 className="font-semibold text-sm mb-3">Daily Intake Contribution</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Sugar', value: score.dailyIntakeContribution.sugar },
            { label: 'Sodium', value: score.dailyIntakeContribution.sodium },
            { label: 'Saturated Fat', value: score.dailyIntakeContribution.saturatedFat },
            { label: 'Protein', value: score.dailyIntakeContribution.protein },
          ].map(item => (
            <div key={item.label}>
              <p className="text-xs text-gray-600 dark:text-gray-400">{item.label}</p>
              <p className="text-lg font-bold">{item.value.toFixed(0)}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* Specialized Scores */}
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
        <h3 className="font-semibold text-sm mb-3">Health Categories</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Children', score: score.childSuitability },
            { label: 'Weight Loss', score: score.weightLossFriendliness },
            { label: 'Diabetes', score: score.diabetesFriendliness },
            { label: 'Blood Pressure', score: score.bloodPressureFriendliness },
          ].map(item => (
            <div key={item.label} className="text-center">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{item.label}</p>
              <p className="text-sm font-semibold">{item.score}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Ingredient Concerns */}
      {product.additives && product.additives.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Additives</h3>
          <div className="flex flex-wrap gap-2">
            {product.additives.slice(0, 5).map(additive => (
              <span
                key={additive}
                className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 rounded"
              >
                {additive}
              </span>
            ))}
            {product.additives.length > 5 && (
              <span className="text-xs px-2 py-1 text-gray-600 dark:text-gray-400">
                +{product.additives.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Score Breakdown */}
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
        <h3 className="font-semibold text-sm mb-3">Score Breakdown</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Nutrition:</span>
            <span className="font-semibold">
              {score.breakdown.nutrition}/{score.maxScores.nutrition}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Ingredients:</span>
            <span className="font-semibold">
              {score.breakdown.ingredients}/{score.maxScores.ingredients}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Processing:</span>
            <span className="font-semibold">
              {score.breakdown.processing}/{score.maxScores.processing}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Positive Factors:</span>
            <span className="font-semibold">
              {score.breakdown.positiveFactors}/{score.maxScores.positiveFactors}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// USAGE IN YOUR APP
// ============================================================================

/*

In your product page:

import { ProductAnalysisComponent } from '@/path/to/this/file';

export default function ProductPage() {
  const product = await getProductByBarcode(barcode);
  const country: CountryCode = 'US'; // From user selection

  return (
    <div>
      <ProductAnalysisComponent product={product} country={country} />
    </div>
  );
}

*/
