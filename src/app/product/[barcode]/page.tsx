import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { Metadata } from 'next';
import { getProductByBarcode, searchProducts } from '@/lib/openfoodfacts';
import { calculateHealthScore } from '@/lib/scoring';
import { NutritionPanel } from '@/components/features/NutritionPanel';
import { FavoriteButton } from '@/components/features/FavoriteButton';
import { AffiliateRecommendations, SearchAlternativesButton } from '@/components/features/AffiliateRecs';
import { EnhancedScoreDisplay } from '@/components/features/EnhancedScoreDisplay';
import { getNutriScoreColor, getGradeColor, classifyIngredient, getIngredientBadgeClass } from '@/lib/utils';
import { AlertCircle, Tag, Package, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { FoodProduct, SearchResult } from '@/types';

interface ProductPageProps {
  params: { barcode: string };
}

function normalizeSearchQuery(product: FoodProduct) {
  if (product.categories && product.categories.length > 0) {
    return product.categories[0].replace(/-/g, ' ').replace(/\s+\(.*\)/, '');
  }

  if (product.name) {
    return product.name.split(/\(|-|:/)[0].trim();
  }

  return 'healthy snacks';
}

async function getHealthierAlternatives(product: FoodProduct, currentScore: number): Promise<SearchResult[]> {
  const query = normalizeSearchQuery(product);
  const searchQuery = `healthy ${query}`;
  const { products } = await searchProducts(searchQuery, 1);

  const alternatives = products
    .map((p): SearchResult => {
      const score = calculateHealthScore(p);
      return {
        barcode: p.barcode,
        name: p.name,
        brand: p.brand,
        imageUrl: p.thumbnailUrl,
        score: score.total,
        grade: score.grade,
      };
    })
    .filter((result) => result.barcode !== product.barcode && (result.score ?? 0) > currentScore)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 3);

  return alternatives;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProductByBarcode(params.barcode);
  if (!product) return { title: 'Product Not Found — FoodScore' };
  const score = calculateHealthScore(product);
  return {
    title: `${product.name} — Health Score ${score.total}/10 | FoodScore`,
    description: `${product.name} by ${product.brand || 'Unknown brand'} has a health score of ${score.total}/10. ${score.summary}`,
    openGraph: {
      title: `${product.name} — Score ${score.total}/10`,
      description: score.summary,
      images: product.imageUrl ? [{ url: product.imageUrl }] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductByBarcode(params.barcode);
  if (!product) notFound();

  const score = calculateHealthScore(product);

  const ingredientItems = Array.from(
    new Set(
      (product.ingredients || '')
        .replace(/\([^)]*\)/g, '')
        .split(/[,;•]/)
        .map(item => item.trim())
        .filter(Boolean)
    )
  ).map(ingredient => ({
    name: ingredient,
    status: classifyIngredient(
      ingredient,
      product.ingredientTags,
      product.additives,
      product.allergens,
      product.ingredientAnalysisTags
    ),
  }));

  const alternatives = await getHealthierAlternatives(product, score.total);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    brand: { '@type': 'Brand', name: product.brand },
    image: product.imageUrl,
    description: `Health score: ${score.total}/10. ${score.summary}`,
    gtin: params.barcode,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: score.total,
      bestRating: 10,
      worstRating: 1,
      ratingCount: 1,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">

          {/* Back link */}
          <Link href="/search" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-5 group">
            <ChevronLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" /> Back to search
          </Link>

          {/* Product header */}
          <div className="glass rounded-3xl p-6 mb-6">
            <div className="flex items-start gap-5">
              <div className="w-28 h-28 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 flex items-center justify-center shadow-md">
                {product.imageUrl ? (
                  <Image src={product.imageUrl} alt={product.name} width={112} height={112} className="object-contain w-full h-full" unoptimized />
                ) : (
                  <span className="text-4xl">🍽️</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h1 className="font-syne font-extrabold text-xl sm:text-2xl text-zinc-900 dark:text-white leading-tight">{product.name}</h1>
                    {product.brand && <p className="text-sm text-zinc-500 mt-0.5">{product.brand}</p>}
                  </div>
                  <FavoriteButton product={product} score={score.total} />
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${getGradeColor(score.grade)}`}>
                    Grade {score.grade}
                  </span>
                  {product.nutriScore && (
                    <span className={`text-xs font-bold px-3 py-1 rounded-full text-white ${getNutriScoreColor(product.nutriScore)}`}>
                      Nutri-Score {product.nutriScore.toUpperCase()}
                    </span>
                  )}
                  {product.novaGroup && (
                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      NOVA {product.novaGroup}
                    </span>
                  )}
                  {product.quantity && (
                    <span className="text-xs text-zinc-400 flex items-center gap-1">
                      <Package size={11} /> {product.quantity}
                    </span>
                  )}
                </div>

                <p className="text-xs font-mono text-zinc-400 mt-2 flex items-center gap-1">
                  <Tag size={11} /> {params.barcode}
                </p>
              </div>
            </div>
          </div>

          {/* Main content grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: Nutrition panel */}
            <div className="lg:col-span-2 space-y-6">
              <EnhancedScoreDisplay product={product} />

              <NutritionPanel score={score} nutriments={product.nutriments} />

              {alternatives.length > 0 && (
                <div className="glass rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-syne font-bold text-zinc-900 dark:text-white text-sm">Healthier Alternatives</h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Products with a stronger health score than this item.</p>
                    </div>
                    <span className="text-xs uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400 font-semibold">Better score</span>
                  </div>
                  <div className="space-y-3">
                    {alternatives.map((alt) => (
                      <Link
                        key={alt.barcode}
                        href={`/product/${alt.barcode}`}
                        className="block p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">{alt.name}</p>
                            {alt.brand && <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 truncate">{alt.brand}</p>}
                          </div>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getGradeColor(alt.grade ?? 'C')}`}>
                            Grade {alt.grade ?? 'C'}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Sidebar */}
            <div className="space-y-4">
              {/* Search alternatives */}
              <SearchAlternativesButton product={product} />

              {/* Ingredients */}
              {product.ingredients && (
                <div className="glass rounded-2xl p-5">
                  <h3 className="font-syne font-bold text-zinc-900 dark:text-white mb-3 text-sm">Ingredients</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {ingredientItems.map(item => (
                      <span key={item.name} className={`text-xs font-medium px-2.5 py-1 rounded-full ${getIngredientBadgeClass(item.status)}`}>
                        {item.name}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{product.ingredients}</p>
                  <div className="mt-3 text-[11px] uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400">
                    <span className="font-semibold text-red-700 dark:text-red-300">Harmful</span> · <span className="font-semibold text-emerald-700 dark:text-emerald-300">Good</span> · <span className="font-semibold text-zinc-700 dark:text-zinc-200">Neutral</span>
                  </div>
                </div>
              )}

              {/* Allergens */}
              {product.allergens && product.allergens.length > 0 && (
                <div className="glass rounded-2xl p-5 border border-amber-200 dark:border-amber-800/50">
                  <h3 className="font-syne font-bold text-amber-700 dark:text-amber-400 mb-3 text-sm flex items-center gap-1.5">
                    <AlertCircle size={14} /> Allergens
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {product.allergens.map(a => (
                      <span key={a} className="text-xs font-medium px-2 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 capitalize">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Additives */}
              {product.additives && product.additives.length > 0 && (
                <div className="glass rounded-2xl p-5">
                  <h3 className="font-syne font-bold text-zinc-900 dark:text-white mb-3 text-sm">Additives ({product.additives.length})</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {product.additives.slice(0, 12).map(a => (
                      <span key={a} className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 uppercase">
                        {a}
                      </span>
                    ))}
                    {product.additives.length > 12 && (
                      <span className="text-xs text-zinc-400">+{product.additives.length - 12} more</span>
                    )}
                  </div>
                </div>
              )}

              {/* Labels */}
              {product.labels && product.labels.length > 0 && (
                <div className="glass rounded-2xl p-5">
                  <h3 className="font-syne font-bold text-zinc-900 dark:text-white mb-3 text-sm">Labels & Certifications</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {product.labels.slice(0, 8).map(l => (
                      <span key={l} className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 capitalize">
                        {l.replace(/-/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Affiliate recommendations */}
              <AffiliateRecommendations product={product} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
