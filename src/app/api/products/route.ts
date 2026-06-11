import { NextRequest, NextResponse } from 'next/server';
import { getProductByBarcode, searchProducts } from '@/lib/openfoodfacts';
import { calculateHealthScore } from '@/lib/scoring';
import { calculateEnhancedHealthScore } from '@/lib/enhancedScoring';
import { prisma } from '@/lib/prisma';
import { CountryCode } from '@/types';

async function tryCacheLookup(barcode: string): Promise<{ data: unknown; scoreData: unknown } | null> {
  try {
    const cached = await prisma.cachedProduct.findUnique({ where: { barcode } });
    if (cached) {
      await prisma.cachedProduct.update({
        where: { barcode },
        data: { viewCount: { increment: 1 } },
      }).catch(() => {});
      return { data: cached.data, scoreData: cached.scoreData };
    }
  } catch {
    // Database unavailable — skip cache
  }
  return null;
}

async function tryCacheSave(barcode: string, data: unknown, score: number, scoreData: unknown): Promise<void> {
  try {
    await prisma.cachedProduct.create({
      data: {
        barcode,
        data: data as object,
        score,
        scoreData: scoreData as object,
        viewCount: 1,
      },
    });
  } catch {
    // Database unavailable — skip caching
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const barcode = searchParams.get('barcode');
  const query = searchParams.get('q');
  const page = parseInt(searchParams.get('page') || '1');
  const countryParam = searchParams.get('country');
  const country: CountryCode = (['IN', 'US', 'CA', 'AU'].includes(countryParam ?? '') ? countryParam : 'US') as CountryCode;

  if (barcode) {
    const cached = await tryCacheLookup(barcode);
    if (cached) {
      return NextResponse.json({ product: cached.data, score: cached.scoreData });
    }

    const product = await getProductByBarcode(barcode);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const score = calculateHealthScore(product);

    await tryCacheSave(barcode, product, score.total, score);

    return NextResponse.json({ product, score });
  }

  if (query) {
    const { products, count } = await searchProducts(query, page);
    const results = products.map(p => {
      const enhanced = calculateEnhancedHealthScore(p, country);
      return {
        barcode: p.barcode,
        name: p.name,
        brand: p.brand,
        imageUrl: p.thumbnailUrl,
        score: enhanced.score,
        grade: enhanced.grade,
        novaGroup: p.novaGroup,
      };
    });

    return NextResponse.json({ results, count, page });
  }

  return NextResponse.json({ error: 'Missing barcode or query' }, { status: 400 });
}
