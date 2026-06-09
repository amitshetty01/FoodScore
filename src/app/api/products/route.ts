import { NextRequest, NextResponse } from 'next/server';
import { getProductByBarcode, searchProducts } from '@/lib/openfoodfacts';
import { calculateHealthScore } from '@/lib/scoring';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const barcode = searchParams.get('barcode');
  const query = searchParams.get('q');
  const page = parseInt(searchParams.get('page') || '1');

  if (barcode) {
    // Check cache first
    const cached = await prisma.cachedProduct.findUnique({ where: { barcode } });
    if (cached) {
      await prisma.cachedProduct.update({ where: { barcode }, data: { viewCount: { increment: 1 } } });
      return NextResponse.json({ product: cached.data, score: cached.scoreData });
    }

    const product = await getProductByBarcode(barcode);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const score = calculateHealthScore(product);

    // Cache the product
    await prisma.cachedProduct.create({
      data: {
        barcode,
        data: product as object,
        score: score.total,
        scoreData: score as object,
        viewCount: 1,
      },
    });

    return NextResponse.json({ product, score });
  }

  if (query) {
    const { products, count } = await searchProducts(query, page);
    const results = products.map(p => {
      const score = calculateHealthScore(p);
      return {
        barcode: p.barcode,
        name: p.name,
        brand: p.brand,
        imageUrl: p.thumbnailUrl,
        score: score.total,
        grade: score.grade,
      };
    });

    return NextResponse.json({ results, count, page });
  }

  return NextResponse.json({ error: 'Missing barcode or query' }, { status: 400 });
}
