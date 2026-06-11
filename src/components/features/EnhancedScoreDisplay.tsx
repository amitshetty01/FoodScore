'use client';

import React, { useState, useEffect } from 'react';
import { FoodProduct } from '@/types';
import { calculateEnhancedHealthScore } from '@/lib/enhancedScoring';
import { CountrySelector } from './CountrySelector';
import { EnhancedScoreCard } from './EnhancedScoreCard';
import { TopReasons } from './TopReasons';
import { DailyIntakeContribution } from './DailyIntakeContribution';
import { SpecializedScores } from './SpecializedScores';
import { ScoreBreakdown } from './ScoreBreakdown';
import { useAppStore } from '@/lib/store';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface EnhancedScoreDisplayProps {
  product: FoodProduct;
}

const scoreDimensions = [
  {
    name: 'Nutrition',
    icon: '🥗',
    description: 'How well the product meets daily nutritional needs for protein, fiber, while limiting sugar, sodium, and saturated fat.',
    color: 'from-emerald-500 to-green-500',
  },
  {
    name: 'Ingredients',
    icon: '🧪',
    description: 'Evaluation of ingredient quality — rewards clean labels, penalizes artificial additives and restricted substances.',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    name: 'Processing',
    icon: '🏭',
    description: 'Based on NOVA classification. Unprocessed foods score highest, ultra-processed foods score lowest.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    name: 'Positive Factors',
    icon: '🌟',
    description: 'Bonus points for organic certification, fortification, whole grains, and transparent allergen labeling.',
    color: 'from-violet-500 to-purple-500',
  },
];

export const EnhancedScoreDisplay: React.FC<EnhancedScoreDisplayProps> = ({
  product,
}) => {
  const selectedCountry = useAppStore((state) => state.selectedCountry);
  const setSelectedCountry = useAppStore((state) => state.setSelectedCountry);
  const [showExplanation, setShowExplanation] = useState(false);

  const [enhancedScore, setEnhancedScore] = useState(() => {
    try {
      const result = calculateEnhancedHealthScore(product, selectedCountry);
      return result;
    } catch (error) {
      console.error('Error calculating enhanced score:', error);
      return null;
    }
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    let active = true;
    setIsUpdating(true);

    const frame = window.requestAnimationFrame(() => {
      if (!active) return;
      try {
        const result = calculateEnhancedHealthScore(product, selectedCountry);
        setEnhancedScore(result);
      } catch (error) {
        console.error('Error calculating enhanced score:', error);
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

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Country Selector */}
      <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="font-bold text-sm sm:text-lg text-gray-900 dark:text-white">Enhanced Analysis</h2>
          <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 sm:mt-1">
            {isUpdating ? `Recalculating with ${selectedCountry} guidelines...` : `Using ${selectedCountry} dietary guidelines`}
          </p>
        </div>
        <CountrySelector
          selectedCountry={selectedCountry}
          onCountryChange={(country) => {
            if (country !== selectedCountry) {
              setSelectedCountry(country);
            }
          }}
        />
      </div>

      {/* Enhanced Score Card */}
      <EnhancedScoreCard score={enhancedScore} />

      {/* How this score works - expandable */}
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
              This product is analyzed across four dimensions. Each dimension is scored against {selectedCountry} government dietary guidelines. The total score is normalized to a 1-10 scale.
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

      {/* Top 3 Reasons */}
      <TopReasons score={enhancedScore} />

      {/* Daily Intake Contribution */}
      <DailyIntakeContribution score={enhancedScore} />

      {/* Specialized Scores */}
      <SpecializedScores score={enhancedScore} />

      {/* Score Breakdown */}
      <ScoreBreakdown score={enhancedScore} />
    </div>
  );
};
