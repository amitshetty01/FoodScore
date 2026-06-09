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
    <div className="space-y-4">
      <h3 className="font-bold text-lg text-gray-900 dark:text-white">Specialized Scores</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map(category => {
          const config = healthScoreConfig[category.value];
          return (
            <div
              key={category.title}
              className={`p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 ${config.bg}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{category.title}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{category.description}</p>
                </div>
                <span className="text-2xl">{config.icon}</span>
              </div>
              <div className={`inline-block font-bold text-lg ${config.text} mt-2`}>{category.value}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm text-blue-800 dark:text-blue-200">
        <p className="font-semibold mb-1">ℹ️ Information</p>
        <p>These specialized scores evaluate the product for specific dietary needs and health conditions.</p>
      </div>
    </div>
  );
};
