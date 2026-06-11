'use client';

import React from 'react';
import { EnhancedHealthScore } from '@/lib/enhancedScoring';

interface TopReasonsProps {
  score: EnhancedHealthScore;
}

export const TopReasons: React.FC<TopReasonsProps> = ({ score }) => {
  if (score.topReasons.length === 0) {
    return (
      <div className="space-y-2 sm:space-y-3">
        <h3 className="font-bold text-sm sm:text-lg text-gray-900 dark:text-white">Score Factors</h3>
        <p className="text-sm text-zinc-500">No specific factors identified due to limited data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 sm:space-y-3">
      <h3 className="font-bold text-sm sm:text-lg text-gray-900 dark:text-white">Key Score Factors</h3>
      <p className="text-xs text-zinc-500">The most significant factors affecting this product&apos;s score.</p>

      <div className="space-y-2 sm:space-y-3">
        {score.topReasons.map((reason, idx) => {
          const isPositive = reason.impact === 'positive';
          const absScore = Math.abs(reason.score);
          const intensity = absScore >= 10 ? 'high' : absScore >= 5 ? 'medium' : 'low';

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
                {/* Impact indicator */}
                <div className={`mt-0.5 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 text-base sm:text-lg ${
                  isPositive
                    ? 'bg-emerald-200/50 dark:bg-emerald-800/50'
                    : 'bg-red-200/50 dark:bg-red-800/50'
                }`}>
                  {isPositive ? '👍' : '👎'}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">{reason.title}</p>
                    <span className={`text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                      isPositive
                        ? 'bg-emerald-200/50 dark:bg-emerald-800/50 text-emerald-800 dark:text-emerald-200'
                        : 'bg-red-200/50 dark:bg-red-800/50 text-red-800 dark:text-red-200'
                    }`}>
                      {isPositive ? '+' : ''}{reason.score.toFixed(0)} pts
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-sm text-gray-600 dark:text-gray-300 mt-0.5 sm:mt-1">{reason.description}</p>

                  {/* Impact bar */}
                  <div className="mt-1.5 sm:mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isPositive ? 'bg-emerald-500' : 'bg-red-500'
                        }`}
                        style={{
                          width: `${Math.min((absScore / 15) * 100, 100)}%`,
                          opacity: intensity === 'high' ? 1 : intensity === 'medium' ? 0.7 : 0.4,
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 shrink-0 capitalize">{intensity} impact</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
