'use client';

import React from 'react';
import { FoodProduct } from '@/types';
import { ShieldCheck, Database, Globe, BarChart3 } from 'lucide-react';

interface TrustIndicatorsProps {
  product: FoodProduct;
  dataConfidence: string;
}

export const TrustIndicators: React.FC<TrustIndicatorsProps> = ({ product, dataConfidence }) => {
  const indicators = [
    {
      icon: Database,
      label: 'Data Source',
      value: 'Open Food Facts',
      detail: 'Public, collaborative food database',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      icon: BarChart3,
      label: 'Data Completeness',
      value: dataConfidence,
      detail: getCompletenessDetail(product),
      color: dataConfidence === 'High Confidence' ? 'text-emerald-500' : dataConfidence === 'Medium Confidence' ? 'text-amber-500' : 'text-zinc-500',
      bgColor: dataConfidence === 'High Confidence' ? 'bg-emerald-50 dark:bg-emerald-900/20' : dataConfidence === 'Medium Confidence' ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-zinc-50 dark:bg-zinc-800',
    },
    {
      icon: Globe,
      label: 'Analysis For',
      value: 'Multiple Countries',
      detail: 'IN · US · CA · AU guidelines',
      color: 'text-violet-500',
      bgColor: 'bg-violet-50 dark:bg-violet-900/20',
    },
    {
      icon: ShieldCheck,
      label: 'Scoring Method',
      value: 'Government Standards',
      detail: 'Based on official dietary guidelines',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
  ];

  return (
    <div className="glass rounded-2xl p-4 sm:p-5">
      <h3 className="font-syne font-bold text-zinc-900 dark:text-gray-100 mb-3 sm:mb-4 text-sm flex items-center gap-1.5">
        <ShieldCheck size={14} className="text-emerald-500" /> Trust Indicators
      </h3>
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {indicators.map((indicator) => (
          <div
            key={indicator.label}
            className={`${indicator.bgColor} rounded-xl p-2.5 sm:p-3`}
          >
            <div className="flex items-center gap-2 mb-1">
              <indicator.icon size={13} className={indicator.color} />
              <span className="text-[10px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                {indicator.label}
              </span>
            </div>
            <p className={`text-xs sm:text-sm font-semibold ${indicator.color}`}>
              {indicator.value}
            </p>
            <p className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              {indicator.detail}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

function getCompletenessDetail(product: FoodProduct): string {
  let count = 0;
  const total = 8;
  if (product.ingredients) count++;
  if (product.nutriments.proteins !== undefined) count++;
  if (product.nutriments.sugars !== undefined) count++;
  if (product.nutriments.sodium !== undefined) count++;
  if (product.nutriments.fat !== undefined) count++;
  if (product.additives) count++;
  if (product.labels) count++;
  if (product.allergens) count++;
  return `${count}/${total} fields available`;
}
