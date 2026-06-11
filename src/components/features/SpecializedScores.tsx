'use client';

import React from 'react';
import { EnhancedHealthScore, HealthScore } from '@/lib/enhancedScoring';

interface SpecializedScoresProps {
  score: EnhancedHealthScore;
}

const healthScoreConfig: Record<
  HealthScore,
  { bg: string; text: string; icon: string; barColor: string; width: number }
> = {
  Excellent: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', icon: '⭐', barColor: 'bg-emerald-500', width: 100 },
  Good: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', icon: '✅', barColor: 'bg-green-500', width: 75 },
  Moderate: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', icon: '⚠️', barColor: 'bg-amber-500', width: 50 },
  Poor: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', icon: '❌', barColor: 'bg-red-500', width: 25 },
};

const categoryDescriptions: Record<string, string> = {
  '👶 For Children': 'Assesses suitability for children aged 5-12 based on sugar, sodium, and protein levels.',
  '⚖️ Weight Loss': 'Evaluates calorie density, protein content, fiber, and sugar levels for weight management.',
  '🩺 Diabetes Friendly': 'Measures sugar and carbohydrate content with fiber for blood sugar management.',
  '❤️ Blood Pressure': 'Evaluates sodium levels, fiber content, and saturated fat for heart health.',
};

export const SpecializedScores: React.FC<SpecializedScoresProps> = ({ score }) => {
  const [expanded, setExpanded] = React.useState<string | null>(null);

  const categories = [
    {
      title: '👶 For Children',
      value: score.childSuitability,
    },
    {
      title: '⚖️ Weight Loss',
      value: score.weightLossFriendliness,
    },
    {
      title: '🩺 Diabetes Friendly',
      value: score.diabetesFriendliness,
    },
    {
      title: '❤️ Blood Pressure',
      value: score.bloodPressureFriendliness,
    },
  ];

  return (
    <div className="space-y-3 sm:space-y-4">
      <h3 className="font-bold text-sm sm:text-lg text-gray-900 dark:text-white">Specialized Scores</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {categories.map(category => {
          const config = healthScoreConfig[category.value];
          const isExpanded = expanded === category.title;

          return (
            <button
              key={category.title}
              onClick={() => setExpanded(isExpanded ? null : category.title)}
              className={`p-3 sm:p-4 rounded-lg border-2 border-gray-200 dark:border-zinc-700 ${config.bg} text-left transition-all hover:shadow-sm`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-xs sm:text-sm">{category.title}</p>
                </div>
                <span className="text-lg sm:text-xl shrink-0">{config.icon}</span>
              </div>

              {/* Visual bar */}
              <div className="h-2 bg-white/50 dark:bg-zinc-900/30 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full ${config.barColor} rounded-full transition-all duration-500`}
                  style={{ width: `${config.width}%` }}
                />
              </div>

              <div className={`inline-block font-bold text-sm sm:text-base ${config.text}`}>{category.value}</div>

              {isExpanded && (
                <p className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400 mt-2 leading-relaxed border-t border-gray-200 dark:border-zinc-700 pt-2">
                  {categoryDescriptions[category.title]}
                </p>
              )}
            </button>
          );
        })}
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2.5 sm:p-3 text-xs sm:text-sm text-blue-800 dark:text-blue-200">
        <p className="font-semibold mb-0.5 sm:mb-1">ℹ️ Information</p>
        <p>These specialized scores evaluate the product for specific dietary needs and health conditions. Tap each card for details.</p>
      </div>
    </div>
  );
};
