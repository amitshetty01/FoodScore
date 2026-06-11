'use client';

import React from 'react';
import { EnhancedHealthScore } from '@/lib/enhancedScoring';

interface DailyIntakeProps {
  score: EnhancedHealthScore;
}

const getNutrientBgColor = (percentage: number) => {
  if (percentage <= 25) return 'from-emerald-500 to-emerald-600';
  if (percentage <= 50) return 'from-green-500 to-green-600';
  if (percentage <= 75) return 'from-amber-500 to-amber-600';
  if (percentage <= 100) return 'from-orange-500 to-orange-600';
  return 'from-red-500 to-red-600';
};

const getNutrientIcon = (name: string) => {
  switch (name) {
    case 'Sugar': return '🍬';
    case 'Sodium': return '🧂';
    case 'Saturated Fat': return '🧈';
    case 'Protein': return '🥩';
    case 'Fiber': return '🌾';
    default: return '📊';
  }
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
    <div className="space-y-3 sm:space-y-4">
      <h3 className="font-bold text-sm sm:text-lg text-gray-900 dark:text-white">Daily Intake Contribution</h3>
      <p className="text-xs text-zinc-500">Percentage of recommended daily limits met by a single serving.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {nutrients.map(nutrient => {
          const exceedsLimit = nutrient.value > 100;
          const clampedValue = Math.min(nutrient.value, 150);

          return (
            <div key={nutrient.name} className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-sm">{getNutrientIcon(nutrient.name)}</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100 text-xs sm:text-sm truncate">{nutrient.name}</span>
                </div>
                <span className={`font-bold text-base sm:text-lg shrink-0 ${exceedsLimit ? 'text-red-500 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>
                  {nutrient.value.toFixed(0)}%
                </span>
              </div>

              <div className="h-2 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getNutrientBgColor(clampedValue)} transition-all duration-300 rounded-full`}
                  style={{ width: `${Math.min(clampedValue, 100)}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[11px] sm:text-xs text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  {nutrient.beneficial ? '✅ Beneficial nutrient' : '⚠️ Limit intake'}
                </span>
                {exceedsLimit && <span className="text-red-600 font-semibold">Exceeds limit</span>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-2.5 sm:p-3 text-xs sm:text-sm text-amber-800 dark:text-amber-200">
        <p className="font-semibold mb-0.5 sm:mb-1">💡 Tip</p>
        <p>This is calculated per serving. Consuming multiple servings will increase these percentages proportionally.</p>
      </div>
    </div>
  );
};
