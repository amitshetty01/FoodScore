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
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-semibold shadow-md hover:shadow-lg"
      >
        <span className="text-xl">{countryInfo[selectedCountry].flag}</span>
        <span>{countryInfo[selectedCountry].name}</span>
        <span className="text-sm ml-1">▼</span>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 min-w-max">
          {countries.map(country => (
            <button
              key={country}
              onClick={() => {
                onCountryChange(country);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                selectedCountry === country
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100'
              }`}
            >
              <span className="text-xl">{countryInfo[country].flag}</span>
              <div>
                <p className="font-semibold">{countryInfo[country].name}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{countryInfo[country].code}</p>
              </div>
              {selectedCountry === country && (
                <span className="ml-auto text-blue-600 dark:text-blue-400">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
