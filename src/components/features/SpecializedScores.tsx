'use client';

import React from 'react';
import { EnhancedHealthScore, HealthScore } from '@/lib/enhancedScoring';

interface SpecializedScoresProps {
  score: EnhancedHealthScore;
}

const healthScoreConfig: Record<
  HealthScore,
  { bg: string; text: string; icon: string }
> = {
  Excellent: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', icon: '⭐' },
  Good: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', icon: '✅' },
  Moderate: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', icon: '⚠️' },
  Poor: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', icon: '❌' },
};

export const SpecializedScores: React.FC<SpecializedScoresProps> = ({ score }) => {
  const categories = [
    {
      title: '👶 For Children',
      value: score.childSuitability,
      description: 'Age 5-12 appropriateness',
    },
    {
      title: '⚖️ Weight Loss',
      value: score.weightLossFriendliness,
      description: 'Low calorie & high protein',
    },
    {
      title: '🩺 Diabetes Friendly',
      value: score.diabetesFriendliness,
      description: 'Low sugar & carb content',
    },
    {
      title: '❤️ Blood Pressure',
      value: score.bloodPressureFriendliness,
      description: 'Low sodium profile',
    },
  ];

  return (
    <div className="space-y-3 sm:space-y-4">
      <h3 className="font-bold text-sm sm:text-lg text-gray-900 dark:text-white">Specialized Scores</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {categories.map(category => {
          const config = healthScoreConfig[category.value];
          return (
            <div
              key={category.title}
              className={`p-3 sm:p-4 rounded-lg border-2 border-gray-200 dark:border-zinc-700 ${config.bg}`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5 sm:mb-2">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-xs sm:text-sm">{category.title}</p>
                  <p className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400 mt-0.5">{category.description}</p>
                </div>
                <span className="text-xl sm:text-2xl shrink-0">{config.icon}</span>
              </div>
              <div className={`inline-block font-bold text-sm sm:text-lg ${config.text}`}>{category.value}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2.5 sm:p-3 text-xs sm:text-sm text-blue-800 dark:text-blue-200">
        <p className="font-semibold mb-0.5 sm:mb-1">ℹ️ Information</p>
        <p>These specialized scores evaluate the product for specific dietary needs and health conditions.</p>
      </div>
    </div>
  );
};
