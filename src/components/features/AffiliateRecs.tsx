'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ExternalLink, ShoppingBag, Sparkles } from 'lucide-react';
import { FoodProduct } from '@/types';

interface AffiliateProduct {
  title: string;
  description: string;
  category: string;
  searchQuery: string;
  affiliateUrl: string;
  tag: string;
}

function getAffiliateRecs(product: FoodProduct): AffiliateProduct[] {
  const recs: AffiliateProduct[] = [];
  const n = product.nutriments;

  if ((n.proteins ?? 0) < 10) {
    recs.push({
      title: 'High-Protein Alternatives',
      description: 'Boost your protein intake with healthier options',
      category: 'Protein',
      searchQuery: 'high protein healthy snacks',
      affiliateUrl: `https://www.amazon.com/s?k=high+protein+healthy+snacks&tag=${process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG || 'foodscore-20'}`,
      tag: 'protein',
    });
  }

  if ((n.fiber ?? 0) < 3) {
    recs.push({
      title: 'High-Fibre Foods',
      description: 'Increase your daily fibre with these wholesome picks',
      category: 'Fibre',
      searchQuery: 'high fiber healthy food',
      affiliateUrl: `https://www.amazon.com/s?k=high+fiber+healthy+food&tag=${process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG || 'foodscore-20'}`,
      tag: 'fiber',
    });
  }

  if ((n.sugars ?? 0) > 12) {
    recs.push({
      title: 'Low-Sugar Alternatives',
      description: 'Great-tasting options without the sugar spike',
      category: 'Low Sugar',
      searchQuery: 'low sugar healthy snacks',
      affiliateUrl: `https://www.amazon.com/s?k=low+sugar+healthy+snacks&tag=${process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG || 'foodscore-20'}`,
      tag: 'low-sugar',
    });
  }

  // Always show a general healthy alternatives rec
  if (recs.length < 2) {
    recs.push({
      title: 'Healthier Alternatives',
      description: 'Discover better-for-you versions of similar products',
      category: 'Healthy',
      searchQuery: `healthy ${product.categories?.[0] || 'snacks'}`,
      affiliateUrl: `https://www.amazon.com/s?k=healthy+${encodeURIComponent(product.categories?.[0] || 'snacks')}&tag=${process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG || 'foodscore-20'}`,
      tag: 'healthy',
    });
  }

  return recs.slice(0, 3);
}

export function AffiliateRecommendations({ product }: { product: FoodProduct }) {
  const [recs, setRecs] = useState<AffiliateProduct[]>([]);

  useEffect(() => {
    setRecs(getAffiliateRecs(product));
  }, [product]);

  if (recs.length === 0) return null;

  return (
    <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-5">
      <h3 className="font-syne font-bold text-zinc-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2 text-xs sm:text-sm">
        <Sparkles size={13} className="text-amber-400 shrink-0" /> Healthier Alternatives
      </h3>
      <div className="space-y-2 sm:space-y-3">
        {recs.map((rec) => (
          <a
            key={rec.tag}
            href={rec.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white dark:bg-zinc-700 flex items-center justify-center shrink-0 shadow-sm">
              <ShoppingBag size={13} className="text-zinc-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] sm:text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">{rec.title}</p>
              <p className="text-[11px] sm:text-xs text-zinc-400 truncate">{rec.description}</p>
            </div>
            <ExternalLink size={11} className="text-zinc-300 group-hover:text-emerald-500 transition-colors shrink-0" />
          </a>
        ))}
      </div>
      <p className="text-[11px] sm:text-xs text-zinc-300 dark:text-zinc-600 mt-2 sm:mt-3">
        * Affiliate links — we may earn a small commission
      </p>
    </div>
  );
}

// For use on the product page sidebar
export function SearchAlternativesButton({ product }: { product: FoodProduct }) {
  const category = product.categories?.[0]?.replace(/-/g, ' ') || 'similar products';

  return (
    <Link
      href={`/search?q=${encodeURIComponent(category)}`}
      className="flex items-center justify-center gap-2 w-full h-9 sm:h-10 glass rounded-xl text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all"
    >
      <Sparkles size={13} /> Find Healthier Alternatives
    </Link>
  );
}
