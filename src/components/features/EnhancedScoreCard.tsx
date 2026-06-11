'use client';

import React from 'react';
import { EnhancedHealthScore } from '@/lib/enhancedScoring';
import { getCountryGuidelines } from '@/lib/countryRules';

interface EnhancedScoreCardProps {
  score: EnhancedHealthScore;
}

const verdictConfig: Record<string, { bg: string; text: string; ring: string; label: string }> = {
  'Excellent Choice': { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-900 dark:text-emerald-200', ring: 'ring-emerald-200 dark:ring-emerald-700', label: 'Excellent Choice' },
  'Good Choice': { bg: 'bg-green-50 dark:bg-green-950/40', text: 'text-green-900 dark:text-green-200', ring: 'ring-green-200 dark:ring-green-700', label: 'Good Choice' },
  'Occasional Choice': { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-900 dark:text-amber-200', ring: 'ring-amber-200 dark:ring-amber-700', label: 'Occasional Choice' },
  'Limit Consumption': { bg: 'bg-orange-50 dark:bg-orange-950/40', text: 'text-orange-900 dark:text-orange-200', ring: 'ring-orange-200 dark:ring-orange-700', label: 'Limit Consumption' },
  'Avoid Frequent Consumption': { bg: 'bg-red-50 dark:bg-red-950/40', text: 'text-red-900 dark:text-red-200', ring: 'ring-red-200 dark:ring-red-700', label: 'Avoid Frequent Consumption' },
};

const scoreGradient = (score: number) => {
  if (score >= 8.5) return 'from-emerald-500 via-green-500 to-emerald-600';
  if (score >= 6.5) return 'from-green-500 via-emerald-500 to-teal-600';
  if (score >= 5) return 'from-amber-500 via-yellow-500 to-orange-500';
  if (score >= 3.5) return 'from-orange-500 via-red-500 to-red-600';
  return 'from-red-500 via-rose-600 to-red-700';
};

export const EnhancedScoreCard: React.FC<EnhancedScoreCardProps> = ({ score }) => {
  const colors = verdictConfig[score.verdict] || verdictConfig['Occasional Choice'];
  const guidelines = getCountryGuidelines(score.country);

  const scorePercent = (score.score / 10) * 100;

  return (
    <div className={`${colors.bg} border-2 ${colors.ring} rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-md`}>
      <div className="flex flex-col gap-4 sm:gap-5 md:flex-row md:items-end md:justify-between mb-4 sm:mb-6">
        <div>
          <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1.5 sm:mb-2">HEALTH SCORE</p>
          <div className={`bg-gradient-to-br ${scoreGradient(score.score)} rounded-xl p-4 sm:p-5 md:p-6 text-white shadow-lg`}>
            <div className="flex items-end gap-2">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold leading-none">{score.score.toFixed(1)}</div>
              <div className="text-sm sm:text-base md:text-lg opacity-80 leading-none pb-1">/10</div>
            </div>
            {/* Mini score bar */}
            <div className="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white/60 rounded-full" style={{ width: `${scorePercent}%` }} />
            </div>
          </div>
        </div>

        <div className="text-left md:text-right">
          <div className="mb-1 sm:mb-2">
            <span className={`text-sm sm:text-base md:text-lg font-bold ${colors.text}`}>{score.verdict}</span>
          </div>
          <div className="flex items-center gap-2 md:justify-end mb-2 sm:mb-3">
            <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${score.grade === 'A' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : score.grade === 'B' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : score.grade === 'C' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' : score.grade === 'D' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
              Grade {score.grade}
            </span>
            <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-1 rounded-full ${colors.bg} ${colors.text} border ${colors.ring}`}>
              {score.dataConfidence}
            </span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white dark:bg-zinc-800/60 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-zinc-700">
        <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1 sm:mb-2">Summary</p>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{score.summary}</p>
      </div>

      {/* Reference Set Indicator */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 sm:mt-3 text-[11px] sm:text-xs">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 font-medium">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" /></svg>
          {score.country}
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
          Sugar ≤ {guidelines.serving.sugar_max_g}g/serving
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
          Sodium ≤ {guidelines.serving.sodium_max_mg}mg/serving
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
          Sat Fat ≤ {guidelines.serving.saturated_fat_max_g}g/serving
        </span>
      </div>
    </div>
  );
};
