import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') return null;
  return session;
}

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 20;

  const [products, total] = await Promise.all([
    prisma.cachedProduct.findMany({
      orderBy: { viewCount: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: { id: true, barcode: true, score: true, viewCount: true, createdAt: true, updatedAt: true, data: true },
    }),
    prisma.cachedProduct.count(),
  ]);

  return NextResponse.json({ products, total, page, pages: Math.ceil(total / limit) });
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  await prisma.cachedProduct.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
