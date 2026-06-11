'use client';

import React from 'react';
import { EnhancedHealthScore } from '@/lib/enhancedScoring';
import { Info } from 'lucide-react';

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

const getImpactIcon = (actual: number, max: number): string => {
  const percentage = (actual / max) * 100;
  if (percentage >= 85) return '🟢';
  if (percentage >= 70) return '✅';
  if (percentage >= 50) return '⚠️';
  return '❌';
};

const categoryDetails: Record<string, { what: string; why: string }> = {
  Nutrition: {
    what: 'Protein, fiber, sugar, sodium, saturated fat',
    why: 'Measures how well the product meets dietary guidelines for essential nutrients and limits for less desirable ones.',
  },
  Ingredients: {
    what: 'Additives, harmful substances, beneficial components',
    why: 'Evaluates ingredient quality including artificial additives, preservatives, and beneficial components like whole grains.',
  },
  Processing: {
    what: 'NOVA classification (1-4)',
    why: 'Less processed foods are generally healthier. NOVA 1 (unprocessed) scores highest, NOVA 4 (ultra-processed) scores lowest.',
  },
  'Positive Factors': {
    what: 'Fortification, certifications, labels',
    why: 'Extra credit for organic certification, fortification, whole grain content, and transparent allergen labeling.',
  },
};

export const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ score }) => {
  const categories = [
    {
      name: 'Nutrition',
      actual: score.breakdown.nutrition,
      max: score.maxScores.nutrition,
    },
    {
      name: 'Ingredients',
      actual: score.breakdown.ingredients,
      max: score.maxScores.ingredients,
    },
    {
      name: 'Processing',
      actual: score.breakdown.processing,
      max: score.maxScores.processing,
    },
    {
      name: 'Positive Factors',
      actual: score.breakdown.positiveFactors,
      max: score.maxScores.positiveFactors,
    },
  ];

  const [expandedIndex, setExpandedIndex] = React.useState<number | null>(null);

  return (
    <div className="space-y-3 sm:space-y-4">
      <h3 className="font-bold text-sm sm:text-lg text-gray-900 dark:text-white">Score Breakdown</h3>

      <div className="space-y-3 sm:space-y-4">
        {categories.map((category, idx) => {
          const color = getCategoryColor(category.actual, category.max);
          const percentage = (category.actual / category.max) * 100;
          const isExpanded = expandedIndex === idx;

          return (
            <div key={category.name} className="space-y-1.5 sm:space-y-2">
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                className="w-full flex items-center justify-between gap-2 text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{getImpactIcon(category.actual, category.max)}</span>
                    <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{category.name}</p>
                  </div>
                  <p className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400 truncate mt-0.5">{categoryDetails[category.name]?.what}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`font-bold text-sm sm:text-lg ${color.text} whitespace-nowrap`}>
                    {category.actual}/{category.max}
                  </span>
                  <Info size={13} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors" />
                </div>
              </button>

              <div className="h-1.5 sm:h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${color.bar} transition-all duration-500 ease-out`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              {isExpanded && (
                <div className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-zinc-800/50 p-2.5 sm:p-3 rounded-lg border border-gray-200 dark:border-zinc-700 animate-in fade-in slide-in-from-top-1 duration-200">
                  <p className="font-semibold mb-1 text-gray-800 dark:text-gray-200">Why this matters</p>
                  <p>{categoryDetails[category.name]?.why}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Total Score */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-800 dark:from-emerald-800 dark:to-teal-900 rounded-lg p-3 sm:p-4 text-white mt-4 sm:mt-6">
        <div className="flex items-center justify-between">
          <span className="text-sm sm:text-base font-semibold">Total Score</span>
          <span className="text-2xl sm:text-3xl md:text-4xl font-bold">{score.score.toFixed(1)}</span>
        </div>
        <p className="text-xs sm:text-sm text-gray-200 mt-1 sm:mt-2">out of 10 points · {score.country} guidelines applied</p>
      </div>

      <div className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-zinc-800/50 p-2.5 sm:p-3 rounded-lg border border-gray-200 dark:border-zinc-700">
        <p className="font-semibold mb-0.5 sm:mb-1 text-gray-800 dark:text-gray-200">Calculation method</p>
        <p>Your score is the sum of four weighted components: nutrition (0-40 pts), ingredients (0-30 pts), processing (0-15 pts), and positive factors (0-15 pts). Each component is based on {score.country} dietary guidelines.</p>
      </div>
    </div>
  );
};
