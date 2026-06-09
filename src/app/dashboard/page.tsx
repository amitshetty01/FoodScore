import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ScoreRing } from '@/components/features/ScoreRing';
import { Heart, Search, Scan } from 'lucide-react';
import { getGradeColor } from '@/lib/utils';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'My Dashboard — FoodScore' };

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const userId = (session.user as { id: string }).id;
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  const getGrade = (score: number) => {
    if (score >= 8) return 'A';
    if (score >= 6.5) return 'B';
    if (score >= 5) return 'C';
    if (score >= 3.5) return 'D';
    return 'F';
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-syne font-extrabold text-3xl text-zinc-900 dark:text-white">
            Welcome back, {session.user.name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="text-zinc-500 mt-1">Your saved products and search history</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Saved Products', value: favorites.length, icon: '❤️' },
            { label: 'Avg Score', value: favorites.length ? (favorites.reduce((s, f) => s + f.score, 0) / favorites.length).toFixed(1) : '—', icon: '📊' },
            { label: 'Best Score', value: favorites.length ? Math.max(...favorites.map(f => f.score)).toFixed(1) : '—', icon: '🏆' },
          ].map(s => (
            <div key={s.label} className="glass rounded-2xl p-4 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="font-syne font-bold text-xl text-zinc-900 dark:text-white">{s.value}</div>
              <div className="text-xs text-zinc-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Favorites */}
        <div>
          <h2 className="font-syne font-bold text-xl text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
            <Heart size={18} className="text-red-400 fill-current" /> Saved Products
          </h2>

          {favorites.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <div className="text-5xl mb-4">🔖</div>
              <h3 className="font-syne font-bold text-xl text-zinc-900 dark:text-white mb-2">No saved products yet</h3>
              <p className="text-zinc-500 mb-6">Start searching for products and save your favorites</p>
              <div className="flex gap-3 justify-center">
                <Link href="/search" className="flex items-center gap-2 h-10 px-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
                  <Search size={15} /> Search Products
                </Link>
                <Link href="/scan" className="flex items-center gap-2 h-10 px-5 glass rounded-xl text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                  <Scan size={15} /> Scan Barcode
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {favorites.map(fav => (
                <Link key={fav.id} href={`/product/${fav.barcode}`}
                  className="group flex items-center gap-4 p-4 glass rounded-2xl hover:shadow-lg transition-all hover:-translate-y-0.5">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 flex items-center justify-center">
                    {fav.imageUrl ? (
                      <Image src={fav.imageUrl} alt={fav.name} width={64} height={64} className="object-contain w-full h-full" unoptimized />
                    ) : <span className="text-2xl">🍽️</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-zinc-900 dark:text-white truncate text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {fav.name}
                    </h3>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${getGradeColor(getGrade(fav.score))}`}>
                      Grade {getGrade(fav.score)}
                    </span>
                  </div>
                  <ScoreRing score={fav.score} size={56} strokeWidth={6} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
