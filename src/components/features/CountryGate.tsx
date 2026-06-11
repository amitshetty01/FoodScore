'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { CountryCode } from '@/types';

const countries: { code: CountryCode; name: string; flag: string; description: string }[] = [
  { code: 'IN', name: 'India', flag: '🇮🇳', description: 'FSSAI guidelines, Indian dietary patterns' },
  { code: 'US', name: 'USA', flag: '🇺🇸', description: 'FDA & USDA dietary guidelines' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', description: 'Health Canada & CFIA standards' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', description: 'FSANZ & Australian dietary guidelines' },
];

export function CountryGate() {
  const { hasSelectedCountry, setHasSelectedCountry, setSelectedCountry } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || hasSelectedCountry) return null;

  const handleSelect = (code: CountryCode) => {
    setSelectedCountry(code);
    setHasSelectedCountry(true);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white dark:bg-zinc-950">
      <div className="max-w-lg w-full mx-auto px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
          <span className="text-white font-bold text-2xl font-syne">F</span>
        </div>
        <h1 className="font-syne font-extrabold text-3xl text-zinc-900 dark:text-white mb-2">
          Welcome to FoodScore
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-sm mx-auto leading-relaxed">
          Select your country to get personalized health scores based on local dietary guidelines.
        </p>

        <div className="grid gap-3">
          {countries.map((c) => (
            <button
              key={c.code}
              onClick={() => handleSelect(c.code)}
              className="group w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-transparent bg-zinc-50 dark:bg-zinc-900 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition-all text-left"
            >
              <span className="text-3xl shrink-0">{c.flag}</span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-zinc-900 dark:text-white text-base">{c.name}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{c.description}</p>
              </div>
              <span className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity text-sm font-semibold shrink-0">
                Select →
              </span>
            </button>
          ))}
        </div>

        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-8">
          Your selection is saved locally. Change it anytime from the header.
        </p>
      </div>
    </div>
  );
}
