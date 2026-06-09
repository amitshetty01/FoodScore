'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Upload, RefreshCcw, CheckCircle2, XCircle } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { SearchBar } from './SearchBar';
import { useAppStore } from '@/lib/store';
import { SearchResult } from '@/types';
import { cn } from '@/lib/utils';

const progressSteps = [
  'Product Search',
  'Nutrition Extraction',
  'Ingredient Analysis',
  'Country Guideline Evaluation',
  'Score Generation',
  'Final Report',
];

interface SearchExperienceProps {
  defaultQuery?: string;
}

export function SearchExperience({ defaultQuery = '' }: SearchExperienceProps) {
  const [query, setQuery] = useState(defaultQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Enter a product name or barcode to begin');
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [noResults, setNoResults] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const recentSearches = useAppStore((state) => state.recentSearches);
  const addRecentSearch = useAppStore((state) => state.addRecentSearch);
  const setSearchResults = useAppStore((state) => state.setSearchResults);

  const stepProgress = useMemo(() => {
    return progressSteps.map((step, index) => ({
      label: step,
      state: index < currentStep ? 'complete' : index === currentStep ? 'active' : 'pending',
    }));
  }, [currentStep]);

  useEffect(() => {
    setQuery(defaultQuery);
    if (defaultQuery.trim()) {
      executeSearch(defaultQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultQuery]);

  const clearLoading = useCallback(() => {
    setLoading(false);
    setCurrentStep(0);
    timeoutRef.current && clearTimeout(timeoutRef.current);
  }, []);

  const advanceStep = useCallback((nextStep: number) => {
    setCurrentStep(nextStep);
    const messages = [
      'Searching product database...',
      'Extracting nutrition details...',
      'Analyzing ingredients...',
      'Applying country guidelines...',
      'Calculating food score...',
      'Preparing final report...',
    ];
    setStatus(messages[nextStep] || 'Processing...');
  }, []);

  const executeSearch = useCallback(async (searchQuery: string) => {
    const q = searchQuery.trim();
    if (!q) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setError(null);
    setNoResults(false);
    setResults([]);
    setCount(0);
    setLoading(true);
    addRecentSearch(q);
    advanceStep(0);

    const updateStep = (stepIndex: number, delay = 450) => {
      timeoutRef.current = setTimeout(() => advanceStep(stepIndex), delay);
    };

    updateStep(1, 300);

    try {
      const response = await fetch(`/api/products?q=${encodeURIComponent(q)}&page=1`, {
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        if (response.status === 404) {
          setNoResults(true);
          setError('We could not find this product. You can upload images for image-based analysis.');
        } else {
          throw new Error('Search failed.');
        }
        return;
      }

      updateStep(2, 700);
      const data = await response.json();
      const searchResults: SearchResult[] = data.results || [];
      setResults(searchResults);
      setCount(data.count || searchResults.length);
      setSearchResults(searchResults);

      if (searchResults.length === 0) {
        setNoResults(true);
        setError('No products were found for this search. Try a different query or upload images.');
      } else {
        advanceStep(4);
        await new Promise((resolve) => setTimeout(resolve, 250));
        advanceStep(5);
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setError('Search failed. Please try again or upload product images.');
      }
    } finally {
      clearLoading();
    }
  }, [addRecentSearch, advanceStep, clearLoading, setSearchResults]);

  const handleSearch = useCallback((q: string) => {
    setQuery(q);
    executeSearch(q);
  }, [executeSearch]);

  const handleRecentClick = (value: string) => {
    setQuery(value);
    executeSearch(value);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="space-y-3">
          <SearchBar defaultValue={query} size="large" autoFocus={!query} placeholder="Search products or scan a barcode..." onSearch={handleSearch} />
          <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
            <span className="font-semibold text-zinc-800 dark:text-zinc-100">Recent searches:</span>
            {recentSearches.length > 0 ? (
              recentSearches.map((item) => (
                <button key={item} type="button" onClick={() => handleRecentClick(item)}
                  className="rounded-full border border-zinc-200 dark:border-zinc-700 px-3 py-1 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                  {item}
                </button>
              ))
            ) : (
              <span>No recent searches yet. Start by searching for a product.</span>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            {(loading || error || noResults) && (
              <div className="glass rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-300">Analysis Progress</p>
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{status}</p>
                  </div>
                  <div className="text-xs uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">{loading ? 'Working...' : 'Ready'}</div>
                </div>

                <div className="mt-6 space-y-3">
                  {stepProgress.map((step) => (
                    <div key={step.label} className="flex items-center gap-3">
                      <div className={cn(
                        'w-3 h-3 rounded-full transition-colors',
                        step.state === 'complete' ? 'bg-emerald-500' : step.state === 'active' ? 'bg-blue-500' : 'bg-zinc-300 dark:bg-zinc-700'
                      )} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-zinc-900 dark:text-white">{step.label}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{step.state === 'active' ? 'In progress' : step.state === 'complete' ? 'Completed' : 'Pending'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {loading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="h-32 glass rounded-3xl animate-pulse" />
                ))}
              </div>
            ) : error || noResults ? (
              <div className="glass rounded-3xl p-10 border border-zinc-200 dark:border-zinc-800 text-center space-y-4">
                <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-300">
                  <XCircle size={28} />
                </div>
                <h2 className="font-bold text-xl text-zinc-900 dark:text-white">We couldn't find this product.</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                  {error || 'Try another search or upload product images to analyze the nutrition label and ingredients.'}
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-3 mt-4">
                  <button type="button" onClick={() => executeSearch(query)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 text-white px-5 py-3 text-sm font-semibold hover:opacity-90 transition-opacity">
                    <RefreshCcw size={16} /> Try again
                  </button>
                  <Link href="/upload"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-700 px-5 py-3 text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                    <Upload size={16} /> Upload images
                  </Link>
                </div>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="text-sm text-zinc-500">{count.toLocaleString()} results for</p>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">"{query}"</h2>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-950/30 px-4 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 size={16} /> {count} matches
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {results.map((product) => (
                    <ProductCard key={product.barcode} product={product} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="glass rounded-3xl p-10 border border-zinc-200 dark:border-zinc-800 text-center">
                <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300">
                  <ArrowRight size={24} />
                </div>
                <h2 className="font-bold text-xl text-zinc-900 dark:text-white">Start your search</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto mt-2">
                  Enter a product name or barcode above and see search results, progress tracking, and helpful suggestions.
                </p>
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="glass rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400 mb-4">Search Guide</h3>
              <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-300">
                <li>• Search by product name, brand, or barcode.</li>
                <li>• Upload images if the product is not in the database.</li>
                <li>• Use recent searches for faster access.</li>
                <li>• Country and goals are remembered during your session.</li>
              </ul>
            </div>

            <div className="glass rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400 mb-4">Need image-based analysis?</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mb-5">
                Upload a nutrition label or ingredients photo to generate a score and analysis when the product is unavailable.
              </p>
              <Link href="/upload"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 text-white px-4 py-3 text-sm font-semibold hover:bg-emerald-600 transition-colors">
                Upload images for analysis
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
