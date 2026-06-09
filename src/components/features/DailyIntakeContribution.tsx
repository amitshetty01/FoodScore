'use client';

import React from 'react';
import { EnhancedHealthScore } from '@/lib/enhancedScoring';

interface DailyIntakeProps {
  score: EnhancedHealthScore;
}

const getNutrientColor = (percentage: number) => {
  if (percentage <= 25) return 'bg-emerald-500';
  if (percentage <= 50) return 'bg-green-500';
  if (percentage <= 75) return 'bg-amber-500';
  if (percentage <= 100) return 'bg-orange-500';
  return 'bg-red-500';
};

const getNutrientBgColor = (percentage: number) => {
  if (percentage <= 25) return 'from-emerald-500 to-emerald-600';
  if (percentage <= 50) return 'from-green-500 to-green-600';
  if (percentage <= 75) return 'from-amber-500 to-amber-600';
  if (percentage <= 100) return 'from-orange-500 to-orange-600';
  return 'from-red-500 to-red-600';
};

export const DailyIntakeContribution: React.FC<DailyIntakeProps> = ({ score }) => {
  const nutrients = [
    { name: 'Sugar', value: score.dailyIntakeContribution.sugar, limit: 100 },
    { name: 'Sodium', value: score.dailyIntakeContribution.sodium, limit: 100 },
    { name: 'Saturated Fat', value: score.dailyIntakeContribution.saturatedFat, limit: 100 },
    { name: 'Protein', value: score.dailyIntakeContribution.protein, limit: 100, beneficial: true },
    { name: 'Fiber', value: score.dailyIntakeContribution.fiber, limit: 100, beneficial: true },
  ];

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg text-gray-900 dark:text-white">Daily Intake Contribution</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {nutrients.map(nutrient => {
          const exceedsLimit = nutrient.value > 100;
          const clampedValue = Math.min(nutrient.value, 150);

          return (
            <div key={nutrient.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900 dark:text-white text-sm">{nutrient.name}</span>
                <span className={`font-bold text-lg ${exceedsLimit ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                  {nutrient.value.toFixed(0)}%
                </span>
              </div>

              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getNutrientBgColor(clampedValue)} transition-all duration-300`}
                  style={{ width: `${Math.min((clampedValue / nutrient.limit) * 100, 100)}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-400">
                <span>{nutrient.beneficial ? '✓ Beneficial' : '⚠️ Limit'}</span>
                {exceedsLimit && <span className="text-red-600 font-semibold">⚠️ Exceeds Limit</span>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-sm text-amber-800 dark:text-amber-200">
        <p className="font-semibold mb-1">💡 Tip</p>
        <p>This is a single serving. Consuming multiple servings will multiply these percentages.</p>
      </div>
    </div>
  );
};
