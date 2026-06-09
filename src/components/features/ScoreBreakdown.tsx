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
    <div className="space-y-4">
      <h3 className="font-bold text-lg text-gray-900 dark:text-white">Score Breakdown</h3>

      <div className="space-y-4">
        {categories.map(category => {
          const color = getCategoryColor(category.actual, category.max);
          const percentage = (category.actual / category.max) * 100;

          return (
            <div key={category.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">{category.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{category.description}</p>
                </div>
                <span className={`font-bold text-lg ${color.text} ml-2 whitespace-nowrap`}>
                  {category.actual}/{category.max}
                </span>
              </div>

              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${color.bar} transition-all duration-300`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-zinc-800 dark:to-zinc-900 rounded-lg p-4 text-white mt-6">
        <div className="flex items-center justify-between">
          <span className="font-semibold">Total Score</span>
          <span className="text-4xl font-bold">{Math.round((score.score / 100) * 10 * 10) / 10}</span>
        </div>
        <p className="text-sm text-gray-300 mt-2">out of 10 points</p>
      </div>

      <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/30 p-3 rounded-lg">
        <p className="font-semibold mb-1">📊 How the score is calculated</p>
        <p>Your score is the sum of four components: nutrition (0-40 pts), ingredients (0-30 pts), processing (0-15 pts), and positive factors (0-15 pts).</p>
      </div>
    </div>
  );
};
