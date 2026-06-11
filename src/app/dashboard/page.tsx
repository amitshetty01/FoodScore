import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ScoreRing } from '@/components/features/ScoreRing';
import { Heart, Search, Scan, TrendingUp, Percent, Award, ArrowRight, BarChart3 } from 'lucide-react';
import { getGradeColor } from '@/lib/utils';
import { getGradeFromScore } from '@/lib/enhancedScoring';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'My Dashboard — FoodScore' };

function getScoreCategory(score: number): { label: string; color: string } {
  if (score >= 7) return { label: 'Healthy', color: 'text-emerald-600 dark:text-emerald-400' };
  if (score >= 5) return { label: 'Average', color: 'text-amber-600 dark:text-amber-400' };
  return { label: 'Needs Improvement', color: 'text-red-600 dark:text-red-400' };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const userId = (session.user as { id: string }).id;
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  const avgScore = favorites.length
    ? favorites.reduce((s, f) => s + f.score, 0) / favorites.length
    : 0;
  const bestScore = favorites.length ? Math.max(...favorites.map(f => f.score)) : 0;
  const worstScore = favorites.length ? Math.min(...favorites.map(f => f.score)) : 0;

  const healthyCount = favorites.filter(f => f.score >= 7).length;
  const averageCount = favorites.filter(f => f.score >= 5 && f.score < 7).length;
  const poorCount = favorites.filter(f => f.score < 5).length;

  const recentFavorites = favorites.slice(0, 6);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-syne font-extrabold text-3xl text-zinc-900 dark:text-white">
              Welcome back, {session.user.name?.split(' ')[0] || 'there'}
            </h1>
            <p className="text-zinc-500 mt-1">Your nutrition dashboard and saved products</p>
          </div>
          <Link href="/search"
            className="inline-flex items-center gap-2 h-10 px-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shrink-0">
            <Search size={15} /> Browse Products
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                <Heart size={18} className="text-red-500" />
              </div>
              <div>
                <div className="font-syne font-bold text-xl text-zinc-900 dark:text-white">{favorites.length}</div>
                <div className="text-xs text-zinc-500">Saved Products</div>
              </div>
            </div>
          </div>
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
                <Award size={18} className="text-emerald-500" />
              </div>
              <div>
                <div className="font-syne font-bold text-xl text-zinc-900 dark:text-white">
                  {favorites.length ? avgScore.toFixed(1) : '—'}
                </div>
                <div className="text-xs text-zinc-500">Avg Score</div>
              </div>
            </div>
          </div>
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                <TrendingUp size={18} className="text-blue-500" />
              </div>
              <div>
                <div className="font-syne font-bold text-xl text-zinc-900 dark:text-white">
                  {favorites.length ? bestScore.toFixed(1) : '—'}
                </div>
                <div className="text-xs text-zinc-500">Best Score</div>
              </div>
            </div>
          </div>
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
                <BarChart3 size={18} className="text-amber-500" />
              </div>
              <div>
                <div className="font-syne font-bold text-xl text-zinc-900 dark:text-white">
                  {favorites.length ? getScoreCategory(avgScore).label : '—'}
                </div>
                <div className="text-xs text-zinc-500">Overall Trend</div>
              </div>
            </div>
          </div>
        </div>

        {/* Dietary breakdown + Recent activity */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Dietary Breakdown */}
          <div className="lg:col-span-2 glass rounded-2xl p-5">
            <h2 className="font-syne font-bold text-lg text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <Percent size={16} className="text-emerald-500" /> Saved Products Breakdown
            </h2>
            {favorites.length > 0 ? (
              <div className="space-y-4">
                <div className="flex h-3 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  {healthyCount > 0 && (
                    <div
                      className="bg-emerald-500 transition-all duration-500"
                      style={{ width: `${(healthyCount / favorites.length) * 100}%` }}
                      title={`Healthy: ${healthyCount}`}
                    />
                  )}
                  {averageCount > 0 && (
                    <div
                      className="bg-amber-400 transition-all duration-500"
                      style={{ width: `${(averageCount / favorites.length) * 100}%` }}
                      title={`Average: ${averageCount}`}
                    />
                  )}
                  {poorCount > 0 && (
                    <div
                      className="bg-red-400 transition-all duration-500"
                      style={{ width: `${(poorCount / favorites.length) * 100}%` }}
                      title={`Needs improvement: ${poorCount}`}
                    />
                  )}
                </div>
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-zinc-600 dark:text-zinc-400">Healthy ({healthyCount})</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="text-zinc-600 dark:text-zinc-400">Average ({averageCount})</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <span className="text-zinc-600 dark:text-zinc-400">Needs Improvement ({poorCount})</span>
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-zinc-500">Save products to see your dietary breakdown.</p>
            )}
          </div>

          {/* Score Range */}
          <div className="glass rounded-2xl p-5">
            <h2 className="font-syne font-bold text-lg text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <Award size={16} className="text-emerald-500" /> Score Range
            </h2>
            {favorites.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-500">Highest</span>
                  <span className="font-syne font-bold text-lg text-emerald-600 dark:text-emerald-400">{bestScore.toFixed(1)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-500">Average</span>
                  <span className="font-syne font-bold text-lg text-zinc-900 dark:text-white">{avgScore.toFixed(1)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-500">Lowest</span>
                  <span className="font-syne font-bold text-lg text-red-600 dark:text-red-400">{worstScore.toFixed(1)}</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-24 text-center">
                <p className="text-sm text-zinc-500">No data yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Favorites */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-syne font-bold text-xl text-zinc-900 dark:text-white flex items-center gap-2">
              <Heart size={18} className="text-red-400 fill-current" /> Saved Products
            </h2>
            {favorites.length > 0 && (
              <Link href="/compare" className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
                <BarChart3 size={13} /> Compare Products
              </Link>
            )}
          </div>

          {favorites.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <div className="text-5xl mb-4">🔖</div>
              <h3 className="font-syne font-bold text-xl text-zinc-900 dark:text-white mb-2">No saved products yet</h3>
              <p className="text-zinc-500 mb-6 max-w-sm mx-auto">
                Start searching for products and save your favorites. Your dashboard will track your scores and help you make informed choices.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link href="/search" className="flex items-center gap-2 h-10 px-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
                  <Search size={15} /> Search Products
                </Link>
                <Link href="/scan" className="flex items-center gap-2 h-10 px-5 glass rounded-xl text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                  <Scan size={15} /> Scan Barcode
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Recent favorites */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-6">
                {recentFavorites.map(fav => (
                  <Link key={fav.id} href={`/product/${fav.barcode}`}
                    className="group flex items-center gap-4 p-4 glass rounded-2xl hover:shadow-lg transition-all hover:-translate-y-0.5">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 flex items-center justify-center">
                      {fav.imageUrl ? (
                        <Image src={fav.imageUrl} alt={fav.name} width={56} height={56} className="object-contain w-full h-full" unoptimized />
                      ) : <span className="text-2xl">🍽️</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-zinc-900 dark:text-white truncate text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {fav.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getGradeColor(getGradeFromScore(fav.score))}`}>
                          Grade {getGradeFromScore(fav.score)}
                        </span>
                        <span className="text-xs text-zinc-500">{fav.score.toFixed(1)}</span>
                      </div>
                    </div>
                    <ScoreRing score={fav.score} size={48} strokeWidth={5} />
                  </Link>
                ))}
              </div>

              {/* View all link */}
              {favorites.length > 6 && (
                <div className="text-center">
                  <Link href="/search"
                    className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                    View all {favorites.length} saved products <ArrowRight size={14} />
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
