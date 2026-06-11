'use client';

import React, { useState, useEffect } from 'react';
import { FoodProduct } from '@/types';
import { calculateEnhancedHealthScore, EnhancedHealthScore } from '@/lib/enhancedScoring';
import { getCountryGuidelines } from '@/lib/countryRules';
import { EnhancedScoreCard } from './EnhancedScoreCard';
import { TopReasons } from './TopReasons';
import { DailyIntakeContribution } from './DailyIntakeContribution';
import { SpecializedScores } from './SpecializedScores';
import { ScoreBreakdown } from './ScoreBreakdown';
import { GovernmentGuidelineComparison } from './GovernmentGuidelineComparison';
import { useAppStore } from '@/lib/store';
import { ChevronDown, HelpCircle, CheckCircle2, AlertCircle } from 'lucide-react';

interface EnhancedScoreDisplayProps {
  product: FoodProduct;
}

const scoreDimensions = [
  {
    name: 'Nutrition Quality',
    icon: '🥗',
    description: 'Protein, fiber, sugar, sodium, saturated fat, and calories (0-4 pts).',
  },
  {
    name: 'Ingredient Quality',
    icon: '🧪',
    description: 'Evaluates additives, artificial colors, sweeteners, preservatives, and refined ingredients (0-2 pts).',
  },
  {
    name: 'Processing Level',
    icon: '🏭',
    description: 'Based on NOVA classification. NOVA 1=2pts, NOVA 2=1.5pts, NOVA 3=1pt, NOVA 4=0pts.',
  },
  {
    name: 'Positive Factors',
    icon: '🌟',
    description: 'Bonus for calcium, iron, vitamins, whole grains, probiotics, fortification (0-1 pt).',
  },
  {
    name: 'Country Alignment',
    icon: '🌍',
    description: 'Small adjustment based on alignment with country dietary guidelines (0-1 pt).',
  },
];

export const EnhancedScoreDisplay: React.FC<EnhancedScoreDisplayProps> = ({
  product,
}) => {
  const selectedCountry = useAppStore((state) => state.selectedCountry);
  const [showExplanation, setShowExplanation] = useState(false);

  const [enhancedScore, setEnhancedScore] = useState<EnhancedHealthScore | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    let active = true;
    setIsUpdating(true);

    const frame = window.requestAnimationFrame(() => {
      if (!active) return;
      try {
        const result = calculateEnhancedHealthScore(product, selectedCountry);
        setEnhancedScore(result);
      } catch {
        setEnhancedScore(null);
      }
      setIsUpdating(false);
    });

    return () => {
      active = false;
      window.cancelAnimationFrame(frame);
    };
  }, [product, selectedCountry]);

  if (!enhancedScore) {
    return (
      <div className="p-4 text-gray-600 dark:text-gray-400">
        {isUpdating ? 'Recalculating analysis...' : 'Enhanced analysis unavailable'}
      </div>
    );
  }

  const guidelines = getCountryGuidelines(selectedCountry);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="min-w-0">
        <h2 className="font-bold text-sm sm:text-lg text-gray-900 dark:text-white">Health Analysis</h2>
        <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 sm:mt-1">
          Scored using {guidelines.countryName} guidelines
        </p>
      </div>

      <EnhancedScoreCard score={enhancedScore} />

      {/* Top Positives & Negatives */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {enhancedScore.topPositives.length > 0 && (
          <div className="glass rounded-xl p-3 sm:p-4 border border-emerald-200 dark:border-emerald-800">
            <h4 className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-2 flex items-center gap-1.5">
              <CheckCircle2 size={14} /> Top Positive Factors
            </h4>
            <ul className="space-y-1">
              {enhancedScore.topPositives.map((p, i) => (
                <li key={i} className="text-xs text-zinc-700 dark:text-zinc-300 flex items-start gap-1.5">
                  <span className="text-emerald-500 mt-0.5">+</span> {p}
                </li>
              ))}
            </ul>
          </div>
        )}
        {enhancedScore.topNegatives.length > 0 && (
          <div className="glass rounded-xl p-3 sm:p-4 border border-red-200 dark:border-red-800">
            <h4 className="text-xs font-semibold text-red-700 dark:text-red-300 mb-2 flex items-center gap-1.5">
              <AlertCircle size={14} /> Top Negative Factors
            </h4>
            <ul className="space-y-1">
              {enhancedScore.topNegatives.map((n, i) => (
                <li key={i} className="text-xs text-zinc-700 dark:text-zinc-300 flex items-start gap-1.5">
                  <span className="text-red-500 mt-0.5">−</span> {n}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Confidence & Explanation */}
      <div className="glass rounded-xl p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            enhancedScore.dataConfidence === 'High Confidence'
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
              : enhancedScore.dataConfidence === 'Medium Confidence'
              ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
          }`}>
            {enhancedScore.dataConfidence}
          </span>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{enhancedScore.confidenceNote}</span>
        </div>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{enhancedScore.scoreExplanation}</p>
      </div>

      {/* Explanation */}
      <div className="glass rounded-2xl overflow-hidden">
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="w-full flex items-center justify-between p-3 sm:p-4 text-left"
        >
          <div className="flex items-center gap-2">
            <HelpCircle size={15} className="text-emerald-500" />
            <span className="font-semibold text-sm text-zinc-900 dark:text-white">How this score works</span>
          </div>
          <ChevronDown
            size={16}
            className={`text-zinc-400 transition-transform duration-200 ${showExplanation ? 'rotate-180' : ''}`}
          />
        </button>
        {showExplanation && (
          <div className="px-3 sm:px-4 pb-4 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Score is the sum of five components totaling up to 10 points. Each component is scored independently
              using {guidelines.countryName} dietary guidelines where applicable.
            </p>
            <div className="grid gap-2">
              {scoreDimensions.map((dim) => (
                <div key={dim.name} className="flex gap-3 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                  <span className="text-lg mt-0.5">{dim.icon}</span>
                  <div>
                    <p className="text-xs font-semibold text-zinc-900 dark:text-white">{dim.name}</p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">{dim.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Top Reasons */}
      <TopReasons score={enhancedScore} />

      {/* Daily Intake Contribution */}
      <DailyIntakeContribution score={enhancedScore} />

      {/* Government Guideline Comparison */}
      <GovernmentGuidelineComparison
        countryName={guidelines.countryName}
        rows={enhancedScore.guidelineComparison}
      />

      {/* Specialized Scores */}
      <SpecializedScores score={enhancedScore} />

      {/* Score Breakdown */}
      <ScoreBreakdown score={enhancedScore} />
    </div>
  );
};
