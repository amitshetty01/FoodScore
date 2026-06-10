'use client';

import React from 'react';
import { EnhancedHealthScore } from '@/lib/enhancedScoring';

interface ScoreBreakdownProps {
  score: EnhancedHealthScore;
}

const getCategoryColor = (
  actual: number,
  max: number
): { bar: string; text: string } => {
  const percentage = (actual / max) * 100;
  if (percentage >= 85) return { bar: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-300' };
  if (percentage >= 70) return { bar: 'bg-green-500', text: 'text-green-700 dark:text-green-300' };
  if (percentage >= 50) return { bar: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-300' };
  return { bar: 'bg-red-500', text: 'text-red-700 dark:text-red-300' };
};

export const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ score }) => {
  const categories = [
    {
      name: 'Nutrition',
      actual: score.breakdown.nutrition,
      max: score.maxScores.nutrition,
      description: 'Protein, fiber, sugar, sodium, saturated fat',
    },
    {
      name: 'Ingredients',
      actual: score.breakdown.ingredients,
      max: score.maxScores.ingredients,
      description: 'Additives, harmful substances, beneficial components',
    },
    {
      name: 'Processing',
      actual: score.breakdown.processing,
      max: score.maxScores.processing,
      description: 'NOVA classification (1-4)',
    },
    {
      name: 'Positive Factors',
      actual: score.breakdown.positiveFactors,
      max: score.maxScores.positiveFactors,
      description: 'Fortification, certifications, labels',
    },
  ];

  return (
    <div className="space-y-3 sm:space-y-4">
      <h3 className="font-bold text-sm sm:text-lg text-gray-900 dark:text-white">Score Breakdown</h3>

      <div className="space-y-3 sm:space-y-4">
        {categories.map(category => {
          const color = getCategoryColor(category.actual, category.max);
          const percentage = (category.actual / category.max) * 100;

          return (
            <div key={category.name} className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{category.name}</p>
                  <p className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400 truncate">{category.description}</p>
                </div>
                <span className={`font-bold text-sm sm:text-lg ${color.text} whitespace-nowrap shrink-0`}>
                  {category.actual}/{category.max}
                </span>
              </div>

              <div className="h-1.5 sm:h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${color.bar} transition-all duration-300`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-gradient-to-r from-emerald-700 to-teal-800 dark:from-emerald-800 dark:to-teal-900 rounded-lg p-3 sm:p-4 text-white mt-4 sm:mt-6">
        <div className="flex items-center justify-between">
          <span className="text-sm sm:text-base font-semibold">Total Score</span>
          <span className="text-2xl sm:text-3xl md:text-4xl font-bold">{score.score.toFixed(1)}</span>
        </div>
        <p className="text-xs sm:text-sm text-gray-200 mt-1 sm:mt-2">out of 10 points</p>
      </div>

      <div className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-zinc-800/50 p-2.5 sm:p-3 rounded-lg border border-gray-200 dark:border-zinc-700">
        <p className="font-semibold mb-0.5 sm:mb-1 text-gray-800 dark:text-gray-200">How the score is calculated</p>
        <p className="text-gray-600 dark:text-gray-400">Your score is the sum of four components: nutrition (0-40 pts), ingredients (0-30 pts), processing (0-15 pts), and positive factors (0-15 pts).</p>
      </div>
    </div>
  );
};
