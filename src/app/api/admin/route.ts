import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const [totalUsers, totalSearches, totalFavorites, totalCachedProducts, recentUsers] =
    await Promise.all([
      prisma.user.count(),
      prisma.searchHistory.count(),
      prisma.favorite.count(),
      prisma.cachedProduct.count(),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, name: true, email: true, createdAt: true, role: true },
      }),
    ]);

  const topSearchesRaw = await prisma.searchHistory.groupBy({
    by: ['query'],
    _count: { query: true },
    orderBy: { _count: { query: 'desc' } },
    take: 10,
  });

  const topSearches = topSearchesRaw.map(s => ({ query: s.query, count: s._count.query }));

  return NextResponse.json({
    totalUsers,
    totalSearches,
    totalFavorites,
    totalCachedProducts,
    recentUsers,
    topSearches,
  });
}
