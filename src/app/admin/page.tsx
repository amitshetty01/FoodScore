import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Users, Search, Heart, Database, TrendingUp, Shield, ChevronRight, Activity } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Admin Dashboard — FoodScore' };

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') redirect('/');

  const [totalUsers, totalSearches, totalFavorites, totalCached, recentUsers, topProducts, searchTrend] =
    await Promise.all([
      prisma.user.count(),
      prisma.searchHistory.count(),
      prisma.favorite.count(),
      prisma.cachedProduct.count(),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 6,
        select: { id: true, name: true, email: true, createdAt: true, role: true },
      }),
      prisma.cachedProduct.findMany({
        orderBy: { viewCount: 'desc' },
        take: 6,
        select: { id: true, barcode: true, score: true, viewCount: true, data: true },
      }),
      prisma.searchHistory.groupBy({
        by: ['query'],
        _count: { query: true },
        orderBy: { _count: { query: 'desc' } },
        take: 8,
      }),
    ]);

  const stats = [
    { label: 'Total Users', value: totalUsers, icon: <Users size={18} />, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', href: '/admin/users' },
    { label: 'Total Searches', value: totalSearches, icon: <Search size={18} />, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20', href: null },
    { label: 'Total Favorites', value: totalFavorites, icon: <Heart size={18} />, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', href: null },
    { label: 'Cached Products', value: totalCached, icon: <Database size={18} />, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', href: '/admin/products' },
  ];

  const navCards = [
    { title: 'User Management', desc: 'View, promote, and delete users', href: '/admin/users', icon: <Users size={20} />, count: totalUsers },
    { title: 'Product Cache', desc: 'Browse and manage cached products', href: '/admin/products', icon: <Database size={20} />, count: totalCached },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center">
              <Shield size={18} className="text-white dark:text-zinc-900" />
            </div>
            <div>
              <h1 className="font-syne font-extrabold text-3xl text-zinc-900 dark:text-white">Admin</h1>
              <p className="text-zinc-500 text-sm">Platform overview</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full">
            <Activity size={12} className="animate-pulse" /> Live
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(s => {
            const card = (
              <div className={`glass rounded-2xl p-5 ${s.href ? 'hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer' : ''}`}>
                <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3 ${s.color}`}>{s.icon}</div>
                <div className="font-syne font-bold text-2xl text-zinc-900 dark:text-white">{s.value.toLocaleString()}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{s.label}</div>
              </div>
            );
            return s.href ? <Link key={s.label} href={s.href}>{card}</Link> : <div key={s.label}>{card}</div>;
          })}
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {navCards.map(c => (
            <Link key={c.title} href={c.href}
              className="glass rounded-2xl p-5 flex items-center gap-4 hover:shadow-lg transition-all hover:-translate-y-0.5 group">
              <div className="w-11 h-11 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 group-hover:text-emerald-500 transition-all">
                {c.icon}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-zinc-900 dark:text-white">{c.title}</p>
                <p className="text-xs text-zinc-500">{c.desc}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-zinc-400">{c.count.toLocaleString()}</span>
                <ChevronRight size={16} className="text-zinc-300 group-hover:text-emerald-500 transition-colors" />
              </div>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-syne font-bold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
                <Users size={15} /> Recent Users
              </h2>
              <Link href="/admin/users" className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline">View all →</Link>
            </div>
            <div className="space-y-3">
              {recentUsers.map(u => (
                <div key={u.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {u.name?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{u.name || 'Unnamed'}</p>
                    <p className="text-xs text-zinc-500 truncate">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {u.role === 'ADMIN' && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900">Admin</span>
                    )}
                    <span className="text-xs text-zinc-400 hidden sm:block">{new Date(u.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-syne font-bold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
                <TrendingUp size={15} /> Most Viewed
              </h2>
              <Link href="/admin/products" className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline">View all →</Link>
            </div>
            <div className="space-y-3">
              {topProducts.map((p, i) => {
                const d = p.data as { name?: string };
                const color = p.score >= 7 ? '#10b981' : p.score >= 5 ? '#eab308' : '#ef4444';
                return (
                  <Link key={p.id} href={`/product/${p.barcode}`} className="flex items-center gap-3 group">
                    <span className="text-xs font-bold text-zinc-300 dark:text-zinc-600 w-4 text-right shrink-0">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{d.name || 'Unknown'}</p>
                      <p className="text-xs font-mono text-zinc-400">{p.barcode}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-bold" style={{ color }}>{p.score.toFixed(1)}</span>
                      <span className="text-xs text-zinc-400">{p.viewCount}×</span>
                    </div>
                  </Link>
                );
              })}
              {topProducts.length === 0 && <p className="text-sm text-zinc-400 text-center py-4">No cached products yet</p>}
            </div>
          </div>

          <div className="glass rounded-2xl p-6 lg:col-span-2">
            <h2 className="font-syne font-bold text-lg text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <Search size={15} /> Top Search Queries
            </h2>
            <div className="flex flex-wrap gap-2">
              {searchTrend.map((s, i) => (
                <Link key={s.query} href={`/search?q=${encodeURIComponent(s.query)}`}
                  className="flex items-center gap-2 px-3 py-1.5 glass rounded-full text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group">
                  <span className="text-xs font-bold text-zinc-300 dark:text-zinc-600">#{i + 1}</span>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{s.query}</span>
                  <span className="text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-full">{s._count.query}</span>
                </Link>
              ))}
              {searchTrend.length === 0 && <p className="text-sm text-zinc-400">No searches recorded yet</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
