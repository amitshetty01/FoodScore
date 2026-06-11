'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Upload, RefreshCcw, CheckCircle2, XCircle, SlidersHorizontal, Plus, BarChart3 } from 'lucide-react';
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

const gradeLevels = [
  { label: 'Any Grade', value: '' },
  { label: 'A Only', value: 'A' },
  { label: 'B or higher', value: 'B' },
  { label: 'C or higher', value: 'C' },
  { label: 'D or higher', value: 'D' },
];

const novaLevels = [
  { label: 'Any Processing', value: '' },
  { label: 'NOVA 1 - Unprocessed', value: '1' },
  { label: 'NOVA 1-2 - Minimal', value: '2' },
  { label: 'NOVA 1-3 - Moderate', value: '3' },
];

const gradeOrder: Record<string, number> = { 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1, 'F': 0 };

const FETCH_TIMEOUT_MS = 15000;

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
  const [showFilters, setShowFilters] = useState(false);
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const [fetchError, setFetchError] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  const searchIdRef = useRef(0);

  const recentSearches = useAppStore((state) => state.recentSearches);
  const addRecentSearch = useAppStore((state) => state.addRecentSearch);
  const setSearchResultsStore = useAppStore((state) => state.setSearchResults);
  const searchFilters = useAppStore((state) => state.searchFilters);
  const setSearchFilters = useAppStore((state) => state.setSearchFilters);
  const addToCompare = useAppStore((state) => state.addToCompare);
  const compareList = useAppStore((state) => state.compareList);
  const selectedCountry = useAppStore((state) => state.selectedCountry);
  const setSelectedCountry = useAppStore((state) => state.setSelectedCountry);
  const hasSelectedCountry = useAppStore((state) => state.hasSelectedCountry);
  const setHasSelectedCountry = useAppStore((state) => state.setHasSelectedCountry);

  const stepProgress = useMemo(() => {
    return progressSteps.map((step, index) => ({
      label: step,
      state: index < currentStep ? 'complete' : index === currentStep ? 'active' : 'pending',
    }));
  }, [currentStep]);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
      fetchTimeoutRef.current = null;
    }
  }, []);

  const cleanupSearch = useCallback(() => {
    clearTimers();
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
  }, [clearTimers]);

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

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      cleanupSearch();
    };
  }, [cleanupSearch]);

  const executeSearch = useCallback(async (searchQuery: string) => {
    const q = searchQuery.trim();
    if (!q) return;

    const searchId = ++searchIdRef.current;

    cleanupSearch();

    setError(null);
    setFetchError(false);
    setNoResults(false);
    setResults([]);
    setFilteredResults([]);
    setCount(0);
    setLoading(true);
    addRecentSearch(q);
    advanceStep(0);

    const controller = new AbortController();
    abortRef.current = controller;

    const scheduleStep = (stepIndex: number, delay: number) => {
      timeoutRef.current = setTimeout(() => {
        if (mountedRef.current && searchId === searchIdRef.current) {
          advanceStep(stepIndex);
        }
      }, delay);
    };

    scheduleStep(1, 200);

    const fetchTimeout = setTimeout(() => {
      if (searchId === searchIdRef.current) {
        controller.abort();
        if (mountedRef.current) {
          setFetchError(true);
          setError('Search is taking longer than expected. Please try again.');
          setLoading(false);
        }
      }
    }, FETCH_TIMEOUT_MS);
    fetchTimeoutRef.current = fetchTimeout;

    try {
      const response = await fetch(`/api/products?q=${encodeURIComponent(q)}&page=1&country=${selectedCountry}`, {
        signal: controller.signal,
      });

      if (searchId !== searchIdRef.current) return;

      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = null;
      }

      if (!response.ok) {
        if (response.status === 404) {
          setNoResults(true);
          setError('We could not find this product. You can upload images for image-based analysis.');
        } else {
          setFetchError(true);
          setError('Search service is temporarily unavailable. Please try again.');
        }
        setLoading(false);
        return;
      }

      scheduleStep(2, 350);

      const data = await response.json();

      if (searchId !== searchIdRef.current) return;

      const searchResults: SearchResult[] = data.results || [];
      setResults(searchResults);
      setCount(data.count || searchResults.length);
      setSearchResultsStore(searchResults);

      if (searchResults.length === 0) {
        setNoResults(true);
        setError('No products were found for this search. Try a different query or upload images.');
      } else {
        advanceStep(4);
        await new Promise((resolve) => setTimeout(resolve, 200));
        if (searchId === searchIdRef.current) {
          advanceStep(5);
        }
      }
    } catch (err) {
      if (searchId !== searchIdRef.current) return;
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = null;
      }
      const errName = (err as Error)?.name;
      if (errName === 'AbortError') {
        if (!fetchError) {
          setFetchError(true);
          setError('Search was cancelled. Please try again.');
        }
      } else {
        setFetchError(true);
        setError('Search failed due to a network error. Please check your connection and try again.');
      }
    } finally {
      if (searchId === searchIdRef.current) {
        setLoading(false);
      }
    }
  }, [addRecentSearch, advanceStep, cleanupSearch, setSearchResultsStore, fetchError, selectedCountry]);

  const searchFnRef = useRef(executeSearch);
  searchFnRef.current = executeSearch;

  useEffect(() => {
    setQuery(defaultQuery);
    if (defaultQuery.trim()) {
      searchFnRef.current(defaultQuery);
    }
  }, [defaultQuery]);

  useEffect(() => {
    let filtered = [...results];
    if (searchFilters.minGrade) {
      const minRank = gradeOrder[searchFilters.minGrade] ?? 0;
      filtered = filtered.filter(r => {
        const rank = gradeOrder[r.grade ?? 'F'] ?? 0;
        return rank >= minRank;
      });
    }
    if (searchFilters.novaGroup) {
      const maxNova = parseInt(searchFilters.novaGroup);
      filtered = filtered.filter(r => (r.novaGroup ?? 4) <= maxNova);
    }
    setFilteredResults(filtered);
  }, [results, searchFilters]);

  const handleSearch = useCallback((q: string) => {
    setQuery(q);
    executeSearch(q);
  }, [executeSearch]);

  const handleRecentClick = (value: string) => {
    setQuery(value);
    executeSearch(value);
  };

  const handleAddToCompare = (product: SearchResult) => {
    addToCompare({
      barcode: product.barcode,
      name: product.name,
      brand: product.brand,
      imageUrl: product.imageUrl,
      score: product.score,
      grade: product.grade,
    });
  };

  const displayResults = filteredResults;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {!hasSelectedCountry && (
          <div className="glass rounded-2xl p-4 sm:p-5 border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-3">
              Select your country for personalized health scores
            </p>
            <div className="flex flex-wrap gap-2">
              {(['IN', 'US', 'CA', 'AU'] as const).map((code) => {
                const flags: Record<string, string> = { IN: '🇮🇳', US: '🇺🇸', CA: '🇨🇦', AU: '🇦🇺' };
                const names: Record<string, string> = { IN: 'India', US: 'USA', CA: 'Canada', AU: 'Australia' };
                return (
                  <button
                    key={code}
                    onClick={() => { setSelectedCountry(code); setHasSelectedCountry(true); }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-800 dark:text-zinc-200 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all shadow-sm"
                  >
                    <span className="text-lg">{flags[code]}</span>
                    {names[code]}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <SearchBar defaultValue={query} size="large" autoFocus={!query} placeholder="Search products or scan a barcode..." onSearch={handleSearch} />
          <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
            <span className="font-semibold text-zinc-800 dark:text-zinc-100">Recent:</span>
            {recentSearches.length > 0 ? (
              recentSearches.map((item) => (
                <button key={item} type="button" onClick={() => handleRecentClick(item)}
                  className="rounded-full border border-zinc-300 dark:border-zinc-600 px-3 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
                  {item}
                </button>
              ))
            ) : (
              <span>No recent searches yet.</span>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            {loading && (
              <div className="glass rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-300">Analysis Progress</p>
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{status}</p>
                  </div>
                  <div className="text-xs uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Working...</div>
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

            {(error || noResults || fetchError) && !loading && (
              <div className="glass rounded-3xl p-10 border border-zinc-200 dark:border-zinc-800 text-center space-y-4">
                <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-300">
                  <XCircle size={28} />
                </div>
                <h2 className="font-bold text-xl text-zinc-900 dark:text-white">
                  {fetchError ? 'Something went wrong' : 'We couldn&apos;t find this product.'}
                </h2>
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
            )}

            {loading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="h-32 glass rounded-3xl animate-pulse" />
                ))}
              </div>
            ) : !error && results.length > 0 ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="text-sm text-zinc-500">{count.toLocaleString()} results for</p>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">&quot;{query}&quot;</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition-colors ${
                        showFilters
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                          : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <SlidersHorizontal size={14} /> Filters
                    </button>
                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 dark:bg-emerald-900/50 px-4 py-2 text-xs font-semibold text-emerald-800 dark:text-emerald-200">
                      <CheckCircle2 size={16} /> {displayResults.length} matches
                    </span>
                  </div>
                </div>

                {showFilters && (
                  <div className="glass rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-zinc-500">Grade:</label>
                        <select
                          value={searchFilters.minGrade}
                          onChange={(e) => setSearchFilters({ minGrade: e.target.value })}
                          className="text-xs h-8 px-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          {gradeLevels.map(g => (
                            <option key={g.value} value={g.value}>{g.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-zinc-500">Processing:</label>
                        <select
                          value={searchFilters.novaGroup}
                          onChange={(e) => setSearchFilters({ novaGroup: e.target.value })}
                          className="text-xs h-8 px-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          {novaLevels.map(n => (
                            <option key={n.value} value={n.value}>{n.label}</option>
                          ))}
                        </select>
                      </div>
                      {(searchFilters.minGrade || searchFilters.novaGroup) && (
                        <button
                          onClick={() => setSearchFilters({ minGrade: '', novaGroup: '' })}
                          className="text-xs font-medium text-red-500 hover:text-red-600 transition-colors"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  {displayResults.map((product) => (
                    <div key={product.barcode} className="relative group">
                      <ProductCard product={product} />
                      <button
                        onClick={() => handleAddToCompare(product)}
                        disabled={compareList.some(c => c.barcode === product.barcode)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm border border-zinc-200 dark:border-zinc-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-emerald-50 dark:hover:bg-emerald-900/20 disabled:opacity-50"
                        title={compareList.some(c => c.barcode === product.barcode) ? 'Already in compare list' : 'Add to compare'}
                      >
                        <Plus size={13} className="text-emerald-600" />
                      </button>
                    </div>
                  ))}
                </div>

                {compareList.length > 0 && (
                  <div className="flex justify-center">
                    <Link href="/compare"
                      className="inline-flex items-center gap-2 h-10 px-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
                      <BarChart3 size={15} /> Compare {compareList.length} Product{compareList.length > 1 ? 's' : ''}
                    </Link>
                  </div>
                )}
              </div>
            ) : !loading && !error ? (
              <div className="glass rounded-3xl p-10 border border-zinc-200 dark:border-zinc-800 text-center">
                <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300">
                  <ArrowRight size={24} />
                </div>
                <h2 className="font-bold text-xl text-zinc-900 dark:text-white">Start your search</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto mt-2">
                  Enter a product name or barcode above and see search results, progress tracking, and helpful suggestions.
                </p>
              </div>
            ) : null}
          </div>

          <aside className="space-y-6">
            <div className="glass rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400 mb-4">Search Guide</h3>
              <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-300">
                <li>• Search by product name, brand, or barcode.</li>
                <li>• Upload images if the product is not in the database.</li>
                <li>• Use filters to narrow by grade or processing level.</li>
                <li>• Hover over results and click + to compare products.</li>
                <li>• Country and goals are remembered during your session.</li>
              </ul>
            </div>

            {compareList.length > 0 && (
              <div className="glass rounded-3xl p-6 border border-emerald-200 dark:border-emerald-800">
                <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-300 mb-4 flex items-center gap-2">
                  <BarChart3 size={14} /> Compare List
                </h3>
                <div className="space-y-2 mb-4">
                  {compareList.map(item => (
                    <div key={item.barcode} className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                      <div className="w-6 h-6 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                        {item.imageUrl ? <Image src={item.imageUrl} alt="" width={24} height={24} className="object-contain" unoptimized /> : <span className="text-xs">🍽️</span>}
                      </div>
                      <span className="truncate flex-1">{item.name}</span>
                      <span className="text-xs font-semibold">{item.score?.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
                <Link href="/compare"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 text-white px-4 py-3 text-sm font-semibold hover:bg-emerald-600 transition-colors">
                  <BarChart3 size={15} /> View Comparison
                </Link>
              </div>
            )}

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
