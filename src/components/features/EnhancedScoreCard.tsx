'use client';

import React from 'react';
import { EnhancedHealthScore } from '@/lib/enhancedScoring';

interface EnhancedScoreCardProps {
  score: EnhancedHealthScore;
}

const verdictColors: Record<string, { bg: string; text: string; ring: string }> = {
  'Excellent Choice': { bg: 'bg-emerald-50', text: 'text-emerald-900', ring: 'ring-emerald-200' },
  'Good Choice': { bg: 'bg-green-50', text: 'text-green-900', ring: 'ring-green-200' },
  'Occasional Choice': { bg: 'bg-amber-50', text: 'text-amber-900', ring: 'ring-amber-200' },
  'Limit Consumption': { bg: 'bg-orange-50', text: 'text-orange-900', ring: 'ring-orange-200' },
  'Avoid Frequent Consumption': { bg: 'bg-red-50', text: 'text-red-900', ring: 'ring-red-200' },
};

const getScoreColor = (score: number) => {
  if (score >= 8.5) return 'from-emerald-500 to-green-600';
  if (score >= 6.5) return 'from-green-500 to-emerald-600';
  if (score >= 5) return 'from-amber-500 to-orange-600';
  if (score >= 3.5) return 'from-orange-500 to-red-600';
  return 'from-red-500 to-red-700';
};

const convertScoreTo10Scale = (score100: number): number => {
  return Math.round((score100 / 100) * 10 * 10) / 10;
};

export const EnhancedScoreCard: React.FC<EnhancedScoreCardProps> = ({ score }) => {
  const colors = verdictColors[score.verdict] || verdictColors['Occasional Choice'];

  return (
    <div className={`${colors.bg} border-2 ${colors.ring} rounded-2xl p-8 shadow-md`}>
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between mb-6">
        <div>
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">HEALTH SCORE</p>
          <div className={`bg-gradient-to-br ${getScoreColor(score.score)} rounded-xl p-6 text-white shadow-lg`}>
            <div className="text-5xl font-bold">{convertScoreTo10Scale(score.score)}</div>
            <div className="text-lg opacity-90">/10</div>
          </div>
        </div>

        <div className="text-right">
          <p className={`text-2xl font-bold ${colors.text} mb-2`}>{score.verdict}</p>
          <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-3">Grade {score.grade}</p>
          <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${colors.bg} ${colors.text}`}>
            {score.dataConfidence} Confidence
          </span>
        </div>
      </div>

      {/* AI Summary */}
      <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">📝 Summary</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{score.summary}</p>
      </div>
    </div>
  );
};
