'use client';

import React from 'react';
import { CountryCode } from '@/types';

interface CountrySelectorProps {
  selectedCountry: CountryCode;
  onCountryChange: (country: CountryCode) => void;
}

const countryInfo: Record<
  CountryCode,
  { name: string; flag: string; code: string }
> = {
  IN: { name: 'India', flag: '🇮🇳', code: 'IN' },
  US: { name: 'USA', flag: '🇺🇸', code: 'US' },
  CA: { name: 'Canada', flag: '🇨🇦', code: 'CA' },
  AU: { name: 'Australia', flag: '🇦🇺', code: 'AU' },
};

const countries: CountryCode[] = ['IN', 'US', 'CA', 'AU'];

export const CountrySelector: React.FC<CountrySelectorProps> = ({
  selectedCountry,
  onCountryChange,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-semibold text-xs sm:text-sm shadow-md hover:shadow-lg w-full sm:w-auto justify-center"
      >
        <span className="text-base sm:text-xl">{countryInfo[selectedCountry].flag}</span>
        <span className="truncate">{countryInfo[selectedCountry].name}</span>
        <span className="text-xs sm:text-sm ml-0.5">▼</span>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 right-0 sm:right-auto sm:left-0 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 min-w-[200px]">
          {countries.map(country => (
            <button
              key={country}
              onClick={() => {
                onCountryChange(country);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3 transition-colors ${
                selectedCountry === country
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100'
              }`}
            >
              <span className="text-base sm:text-xl">{countryInfo[country].flag}</span>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-semibold truncate">{countryInfo[country].name}</p>
                <p className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400">{countryInfo[country].code}</p>
              </div>
              {selectedCountry === country && (
                <span className="ml-auto text-blue-600 dark:text-blue-400 shrink-0 text-xs sm:text-sm">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
