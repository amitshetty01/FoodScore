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
    <div className="space-y-3">
      <h3 className="font-bold text-lg text-gray-900 dark:text-white">Top 3 Reasons</h3>

      {score.topReasons.map((reason, idx) => {
        const isPositive = reason.impact === 'positive';
        return (
          <div
            key={idx}
            className={`p-4 rounded-lg border-2 transition-all ${
              isPositive
                ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5">{impactIcons[reason.impact]}</span>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">{reason.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{reason.description}</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs font-mono px-2 py-1 bg-black/5 dark:bg-white/5 rounded">
                    {reason.score > 0 ? '+' : ''}{reason.score} pts
                  </span>
                  <span className="text-xs font-mono px-2 py-1 bg-black/5 dark:bg-white/5 rounded">
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
