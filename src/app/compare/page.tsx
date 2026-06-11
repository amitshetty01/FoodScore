'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAppStore } from '@/lib/store';
import { ScoreRing } from '@/components/features/ScoreRing';
import { getGradeColor } from '@/lib/utils';
import { getGradeFromScore } from '@/lib/enhancedScoring';
import { SearchResult } from '@/types';
import { X, Search, Plus, BarChart3, ArrowLeft, Trash2, AlertCircle, RefreshCcw } from 'lucide-react';

interface CompareNutrients {
  energy_kcal?: number;
  proteins?: number;
  sugars?: number;
  saturated_fat?: number;
  fiber?: number;
  sodium?: number;
  carbohydrates?: number;
  fat?: number;
}

interface LoadedProduct {
  barcode: string;
  name: string;
  brand?: string;
  imageUrl?: string;
  score: number;
  grade: string;
  novaGroup?: number;
  nutriments: CompareNutrients;
  ingredients?: string;
  additives?: string[];
  allergens?: string[];
  labels?: string[];
}

interface ProductLoadResult {
  barcode: string;
  status: 'loaded' | 'error';
  product?: LoadedProduct;
  error?: string;
}

const compareCategories = [
  { key: 'score', label: 'Health Score', type: 'score' },
  { key: 'grade', label: 'Grade', type: 'badge' },
  { key: 'novaGroup', label: 'NOVA Group', type: 'nova' },
  { key: 'energy_kcal', label: 'Energy', type: 'nutrient', unit: 'kcal' },
  { key: 'proteins', label: 'Protein', type: 'nutrient', unit: 'g' },
  { key: 'carbohydrates', label: 'Carbs', type: 'nutrient', unit: 'g' },
  { key: 'sugars', label: 'Sugar', type: 'nutrient', unit: 'g' },
  { key: 'fat', label: 'Fat', type: 'nutrient', unit: 'g' },
  { key: 'saturated_fat', label: 'Sat. Fat', type: 'nutrient', unit: 'g' },
  { key: 'fiber', label: 'Fiber', type: 'nutrient', unit: 'g' },
  { key: 'sodium', label: 'Sodium', type: 'nutrient', unit: 'mg' },
  { key: 'additives', label: 'Additives', type: 'count' },
  { key: 'allergens', label: 'Allergens', type: 'count' },
  { key: 'labels', label: 'Certifications', type: 'count' },
];

function computeBestIdx(products: LoadedProduct[], cat: typeof compareCategories[number]): number {
  if (products.length < 2) return -1;
  const values = products.map(p => {
    switch (cat.type) {
      case 'score': return p.score;
      case 'badge': return 5 - Math.max(0, 'ABCDE'.indexOf(p.grade));
      case 'nova': return p.novaGroup ? 5 - p.novaGroup : 0;
      case 'nutrient': {
        const val = p.nutriments[cat.key as keyof CompareNutrients] ?? 0;
        if (['sugars', 'saturated_fat', 'sodium', 'energy_kcal'].includes(cat.key)) return -val;
        return val;
      }
      case 'count': {
        if (cat.key === 'additives') return -(p.additives?.length ?? 0);
        if (cat.key === 'allergens') return -(p.allergens?.length ?? 0);
        if (cat.key === 'labels') return p.labels?.length ?? 0;
        return 0;
      }
      default: return 0;
    }
  });
  const max = Math.max(...values);
  return values.indexOf(max);
}

export default function ComparePage() {
  const { compareList, removeFromCompare, clearCompare, addToast } = useAppStore();
  const [products, setProducts] = useState<LoadedProduct[]>([]);
  const [loadResults, setLoadResults] = useState<ProductLoadResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const addToCompare = useAppStore((s) => s.addToCompare);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetchProducts = useCallback(async () => {
    if (compareList.length === 0) {
      setProducts([]);
      setLoadResults([]);
      setLoadError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setInitialLoad(false);
    setLoadError(null);

    const results: ProductLoadResult[] = await Promise.all(
      compareList.map(async (item) => {
        try {
          const res = await fetch(`/api/products?barcode=${item.barcode}`);
          if (!res.ok) {
            return { barcode: item.barcode, status: 'error' as const, error: `Could not load product (${res.status})` };
          }
          const data = await res.json();
          const p = data.product;
          if (!p) {
            return { barcode: item.barcode, status: 'error' as const, error: 'Product data not available' };
          }
          return {
            barcode: item.barcode,
            status: 'loaded' as const,
            product: {
              barcode: item.barcode,
              name: p.name || item.name || 'Unknown',
              brand: p.brand,
              imageUrl: p.imageUrl || p.thumbnailUrl || item.imageUrl,
              score: data.enhancedScore?.score ?? item.score ?? 5,
              grade: data.enhancedScore?.grade || item.grade || getGradeFromScore(data.enhancedScore?.score ?? item.score ?? 5),
              novaGroup: p.novaGroup,
              nutriments: p.nutriments || {},
              ingredients: p.ingredients,
              additives: p.additives,
              allergens: p.allergens,
              labels: p.labels,
            },
          };
        } catch {
          return { barcode: item.barcode, status: 'error' as const, error: 'Network error loading product' };
        }
      })
    );

    if (mountedRef.current) {
      setLoadResults(results);
      const loaded = results.filter((r): r is ProductLoadResult & { status: 'loaded'; product: LoadedProduct } =>
        r.status === 'loaded' && !!r.product
      ).map(r => r.product);
      setProducts(loaded);

      const errors = results.filter(r => r.status === 'error');
      if (errors.length > 0) {
        setLoadError(`${errors.length} product(s) could not be loaded.`);
      } else {
        setLoadError(null);
      }
      setLoading(false);
    }
  }, [compareList]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults([]); return; }
    setSearchLoading(true);
    try {
      const res = await fetch(`/api/products?q=${encodeURIComponent(q)}&page=1`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults((data.results || []).slice(0, 8));
      }
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddProduct = (result: SearchResult) => {
    addToCompare({
      barcode: result.barcode,
      name: result.name,
      brand: result.brand,
      imageUrl: result.imageUrl,
      score: result.score,
      grade: result.grade,
    });
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const showEmptyState = compareList.length === 0 && products.length === 0 && !loading && !initialLoad;

  if (showEmptyState) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 rounded-3xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-6">
            <BarChart3 size={36} className="text-zinc-400" />
          </div>
          <h1 className="font-syne font-extrabold text-3xl text-zinc-900 dark:text-white mb-3">
            Compare Products
          </h1>
          <p className="text-zinc-500 leading-relaxed mb-8 max-w-md mx-auto">
            Add products to compare their health scores, nutrition facts, and ingredients side by side.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/search"
              className="h-11 px-6 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2">
              <Search size={15} /> Search Products
            </Link>
            <button onClick={() => setSearchOpen(true)}
              className="h-11 px-6 glass rounded-xl text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2">
              <Plus size={15} /> Add a Product
            </button>
          </div>

          {searchOpen && (
            <div className="mt-8 glass rounded-2xl p-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search products..."
                autoFocus
                className="w-full h-11 px-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {searchLoading && <p className="text-sm text-zinc-400 mt-2">Searching...</p>}
              {searchResults.length > 0 && (
                <div className="mt-3 space-y-1 max-h-60 overflow-y-auto">
                  {searchResults.map(r => (
                    <button key={r.barcode} onClick={() => handleAddProduct(r)}
                      className="w-full text-left flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
                        {r.imageUrl ? <Image src={r.imageUrl} alt="" width={32} height={32} className="object-contain" unoptimized /> : <span>🍽️</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{r.name}</p>
                        {r.brand && <p className="text-xs text-zinc-500 truncate">{r.brand}</p>}
                      </div>
                      <Plus size={15} className="text-emerald-500 shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  const errorProducts = loadResults.filter(r => r.status === 'error');

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <Link href="/search" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-2">
              <ArrowLeft size={14} /> Back to search
            </Link>
            <h1 className="font-syne font-extrabold text-2xl text-zinc-900 dark:text-white flex items-center gap-2">
              <BarChart3 size={22} className="text-emerald-500" /> Compare Products
            </h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setSearchOpen(!searchOpen)}
              className="h-10 px-4 glass rounded-xl text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2">
              <Plus size={15} /> Add Product
            </button>
            <button onClick={() => { clearCompare(); addToast({ message: 'Compare list cleared', type: 'info' }); }}
              className="h-10 px-4 glass rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2">
              <Trash2 size={15} /> Clear All
            </button>
          </div>
        </div>

        {loadError && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-200">
            <AlertCircle size={16} className="shrink-0" />
            <span>{loadError}</span>
            <button onClick={fetchProducts} className="ml-auto text-xs font-semibold underline hover:no-underline flex items-center gap-1">
              <RefreshCcw size={12} /> Retry
            </button>
          </div>
        )}

        {searchOpen && (
          <div className="mb-6 glass rounded-2xl p-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search products to add..."
              autoFocus
              className="w-full h-11 px-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {searchLoading && <p className="text-sm text-zinc-400 mt-2">Searching...</p>}
            {searchResults.length > 0 && (
              <div className="mt-3 grid gap-1 sm:grid-cols-2 max-h-48 overflow-y-auto">
                {searchResults.map(r => (
                  <button key={r.barcode} onClick={() => handleAddProduct(r)}
                    className="w-full text-left flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700">
                    <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
                      {r.imageUrl ? <Image src={r.imageUrl} alt="" width={40} height={40} className="object-contain" unoptimized /> : <span>🍽️</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{r.name}</p>
                      {r.brand && <p className="text-xs text-zinc-500 truncate">{r.brand}</p>}
                    </div>
                    <Plus size={15} className="text-emerald-500 shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {loading || (compareList.length > 0 && products.length === 0 && errorProducts.length === 0 && initialLoad) ? (
          <div className="space-y-4">
            <div className="grid grid-cols-[100px_repeat(auto-fill,160px)] gap-4">
              <div className="h-12" />
              {compareList.map((_, i) => (
                <div key={i} className="h-12 glass rounded-2xl animate-pulse" />
              ))}
            </div>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="grid grid-cols-[100px_repeat(auto-fill,160px)] gap-4">
                <div className="h-10" />
                {compareList.map((_, j) => (
                  <div key={j} className="h-10 glass rounded-xl animate-pulse" />
                ))}
              </div>
            ))}
          </div>
        ) : products.length === 0 && errorProducts.length > 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30 text-red-500">
              <AlertCircle size={28} />
            </div>
            <h2 className="font-bold text-xl text-zinc-900 dark:text-white mb-2">Could not load products</h2>
            <p className="text-sm text-zinc-500 max-w-md mx-auto mb-6">
              The comparison data could not be retrieved. This may be because the database is temporarily unavailable.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={fetchProducts}
                className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 text-white px-5 py-3 text-sm font-semibold hover:opacity-90 transition-opacity">
                <RefreshCcw size={16} /> Retry
              </button>
              <button onClick={() => { clearCompare(); addToast({ message: 'Compare list cleared', type: 'info' }); }}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-700 px-5 py-3 text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                Clear All
              </button>
            </div>
          </div>
        ) : (
          <div className="glass rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-700">
                    <th className="text-left p-3 sm:p-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 w-28 sm:w-36">
                      Category
                    </th>
                    {products.map(p => (
                      <th key={p.barcode} className="p-3 sm:p-4 min-w-[140px] sm:min-w-[180px]">
                        <div className="relative">
                          <button
                            onClick={() => { removeFromCompare(p.barcode); addToast({ message: 'Product removed from compare', type: 'info' }); }}
                            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-400 hover:text-red-600 flex items-center justify-center z-10"
                          >
                            <X size={12} />
                          </button>
                          <Link href={`/product/${p.barcode}`} className="flex items-center gap-2 group">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
                              {p.imageUrl ? <Image src={p.imageUrl} alt="" width={40} height={40} className="object-contain" unoptimized /> : <span>🍽️</span>}
                            </div>
                            <div className="text-left min-w-0">
                              <p className="font-semibold text-zinc-900 dark:text-white text-xs sm:text-sm truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                {p.name}
                              </p>
                              {p.brand && <p className="text-[10px] sm:text-xs text-zinc-500 truncate">{p.brand}</p>}
                            </div>
                          </Link>
                        </div>
                      </th>
                    ))}
                    {errorProducts.map(ep => (
                      <th key={ep.barcode} className="p-3 sm:p-4 min-w-[140px] sm:min-w-[180px] opacity-60">
                        <div className="relative">
                          <button
                            onClick={() => { removeFromCompare(ep.barcode); addToast({ message: 'Product removed from compare', type: 'info' }); }}
                            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-400 hover:text-red-600 flex items-center justify-center z-10"
                          >
                            <X size={12} />
                          </button>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                              <AlertCircle size={16} className="text-red-400" />
                            </div>
                            <div className="text-left min-w-0">
                              <p className="font-semibold text-zinc-500 text-xs sm:text-sm truncate">Unavailable</p>
                              <p className="text-[10px] text-red-400 truncate">Load failed</p>
                            </div>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {compareCategories.map(cat => {
                    const bestIdx = computeBestIdx(products, cat);

                    return (
                      <tr key={cat.key} className="border-b border-zinc-100 dark:border-zinc-800 last:border-b-0 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                        <td className="p-3 sm:p-4 text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                          {cat.label}
                        </td>
                        {products.map((p, idx) => (
                          <td key={p.barcode} className={`p-3 sm:p-4 ${idx === bestIdx ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : ''}`}>
                            {cat.type === 'score' ? (
                              <div className="flex items-center gap-2">
                                <ScoreRing score={p.score} size={36} strokeWidth={4} />
                                <span className="font-bold text-zinc-900 dark:text-white">{p.score.toFixed(1)}</span>
                              </div>
                            ) : cat.type === 'badge' ? (
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getGradeColor(p.grade)}`}>
                                {p.grade}
                              </span>
                            ) : cat.type === 'nova' ? (
                              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                {p.novaGroup || 'N/A'}
                              </span>
                            ) : cat.type === 'nutrient' ? (
                              <span className="font-semibold text-zinc-900 dark:text-white">
                                {(() => {
                                  const val = p.nutriments[cat.key as keyof CompareNutrients];
                                  if (val === undefined || val === null) return 'N/A';
                                  return `${val.toFixed(1)}${cat.unit || ''}`;
                                })()}
                              </span>
                            ) : cat.type === 'count' ? (
                              <span className="font-semibold text-zinc-900 dark:text-white">
                                {(() => {
                                  if (cat.key === 'additives') return p.additives?.length ?? 0;
                                  if (cat.key === 'allergens') return p.allergens?.length ?? 0;
                                  if (cat.key === 'labels') return p.labels?.length ?? 0;
                                  return 0;
                                })()}
                              </span>
                            ) : (
                              <span className="text-zinc-500">—</span>
                            )}
                            {idx === bestIdx && cat.key !== 'novaGroup' && cat.key !== 'grade' && (
                              <span className="ml-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Best</span>
                            )}
                          </td>
                        ))}
                        {errorProducts.map(ep => (
                          <td key={ep.barcode} className="p-3 sm:p-4 text-zinc-400 text-xs">
                            —
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {compareList.length > 0 && !loading && (
          <p className="text-xs text-zinc-400 mt-4 text-center">
            Best values are highlighted. Add up to 4 products for comparison.
          </p>
        )}
      </div>
    </div>
  );
}
