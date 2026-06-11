'use client';

import React from 'react';
import { GuidelineRow } from '@/types';

interface GovernmentGuidelineComparisonProps {
  countryName: string;
  rows: GuidelineRow[];
}

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  favorable: { bg: 'bg-emerald-50 dark:bg-emerald-950/20', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' },
  moderate: { bg: 'bg-amber-50 dark:bg-amber-950/20', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' },
  high: { bg: 'bg-red-50 dark:bg-red-950/20', text: 'text-red-700 dark:text-red-300', dot: 'bg-red-500' },
};

export const GovernmentGuidelineComparison: React.FC<GovernmentGuidelineComparisonProps> = ({ countryName, rows }) => {
  if (rows.length === 0) {
    return (
      <div className="space-y-3 sm:space-y-4">
        <h3 className="font-bold text-sm sm:text-lg text-gray-900 dark:text-white">Government Guideline Comparison</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Insufficient data to compare against {countryName} guidelines.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <h3 className="font-bold text-sm sm:text-lg text-gray-900 dark:text-white">Government Guideline Comparison</h3>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Comparing this product against {countryName} official daily reference values.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-700">
              <th className="text-left py-2.5 pr-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Nutrient</th>
              <th className="text-right py-2.5 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Product Amount</th>
              <th className="text-right py-2.5 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Daily Reference</th>
              <th className="text-right py-2.5 pl-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">% of Daily</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {rows.map((row, idx) => {
              const colors = statusColors[row.status] || statusColors.moderate;
              return (
                <tr key={idx} className={`${colors.bg} transition-colors`}>
                  <td className="py-2.5 pr-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${colors.dot} shrink-0`} />
                      <span className="font-medium text-zinc-900 dark:text-white text-xs sm:text-sm">{row.nutrient}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold text-zinc-900 dark:text-white text-xs sm:text-sm">
                    {row.productAmount}
                  </td>
                  <td className="py-2.5 px-3 text-right text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm">
                    {row.dailyReference}
                  </td>
                  <td className="py-2.5 pl-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 sm:w-20 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${colors.dot}`}
                          style={{ width: `${Math.min(row.percent, 100)}%` }}
                        />
                      </div>
                      <span className={`font-bold text-xs sm:text-sm ${colors.text} w-10 text-right`}>
                        {row.percent}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Favorable</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Moderate</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> High</span>
      </div>

      <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
        Percentages show how much of the daily reference value a single serving (100g) provides.
        Green = favorable, Yellow = moderate, Red = high contribution.
      </p>
    </div>
  );
};
