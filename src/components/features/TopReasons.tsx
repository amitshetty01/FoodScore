'use client';

import React from 'react';
import { EnhancedHealthScore } from '@/lib/enhancedScoring';

interface TopReasonsProps {
  score: EnhancedHealthScore;
}

const impactIcons: Record<string, string> = {
  positive: '✅',
  negative: '⚠️',
};

export const TopReasons: React.FC<TopReasonsProps> = ({ score }) => {
  return (
    <div className="space-y-2 sm:space-y-3">
      <h3 className="font-bold text-sm sm:text-lg text-gray-900 dark:text-white">Top 3 Reasons</h3>

      {score.topReasons.map((reason, idx) => {
        const isPositive = reason.impact === 'positive';
        return (
          <div
            key={idx}
            className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
              isPositive
                ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
            }`}
          >
            <div className="flex items-start gap-2 sm:gap-3">
              <span className="text-base sm:text-xl mt-0.5 shrink-0">{impactIcons[reason.impact]}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">{reason.title}</p>
                <p className="text-[11px] sm:text-sm text-gray-600 dark:text-gray-300 mt-0.5 sm:mt-1">{reason.description}</p>
                <div className="flex gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
                  <span className="text-[11px] sm:text-xs font-mono px-1.5 sm:px-2 py-0.5 sm:py-1 bg-black/5 dark:bg-white/5 rounded">
                    {reason.score > 0 ? '+' : ''}{reason.score} pts
                  </span>
                  <span className="text-[11px] sm:text-xs font-mono px-1.5 sm:px-2 py-0.5 sm:py-1 bg-black/5 dark:bg-white/5 rounded">
                    Impact: {Math.abs(reason.score)}/10
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
