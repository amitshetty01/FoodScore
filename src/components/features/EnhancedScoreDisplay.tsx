'use client';

import React, { useState, useEffect } from 'react';
import { FoodProduct, CountryCode } from '@/types';
import { calculateEnhancedHealthScore } from '@/lib/enhancedScoring';
import { CountrySelector } from './CountrySelector';
import { EnhancedScoreCard } from './EnhancedScoreCard';
import { TopReasons } from './TopReasons';
import { DailyIntakeContribution } from './DailyIntakeContribution';
import { SpecializedScores } from './SpecializedScores';
import { ScoreBreakdown } from './ScoreBreakdown';
import { useAppStore } from '@/lib/store';

interface EnhancedScoreDisplayProps {
  product: FoodProduct;
}

export const EnhancedScoreDisplay: React.FC<EnhancedScoreDisplayProps> = ({
  product,
}) => {
  const selectedCountry = useAppStore((state) => state.selectedCountry);
  const setSelectedCountry = useAppStore((state) => state.setSelectedCountry);

  const [enhancedScore, setEnhancedScore] = useState(() => {
    try {
      return calculateEnhancedHealthScore(product, selectedCountry);
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
        setEnhancedScore(calculateEnhancedHealthScore(product, selectedCountry));
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
    <div className="space-y-6">
      {/* Country Selector */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-bold text-lg text-gray-900 dark:text-white">Enhanced Analysis</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
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
