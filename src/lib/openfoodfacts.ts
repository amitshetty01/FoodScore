import { FoodProduct, NutritionFacts } from '@/types';

const OFF_BASE_URL = 'https://world.openfoodfacts.org';

export async function getProductByBarcode(barcode: string): Promise<FoodProduct | null> {
  try {
    const res = await fetch(`${OFF_BASE_URL}/api/v2/product/${barcode}?fields=product_name,brands,image_url,image_thumb_url,ingredients_text,ingredients_tags,ingredients_analysis_tags,allergens_tags,additives_tags,labels_tags,categories_tags,nutriments,nutriscore_grade,nova_group,quantity,serving_size,countries`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (data.status !== 1 || !data.product) return null;

    return mapProduct(barcode, data.product);
  } catch {
    return null;
  }
}

export async function searchProducts(query: string, page = 1): Promise<{ products: FoodProduct[]; count: number }> {
  try {
    const res = await fetch(
      `${OFF_BASE_URL}/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page=${page}&page_size=20&fields=code,product_name,brands,image_thumb_url,nutriments,nutriscore_grade`,
      { next: { revalidate: 300 } }
    );

    if (!res.ok) return { products: [], count: 0 };

    const data = await res.json();
    const products = (data.products || []).map((p: Record<string, unknown>) =>
      mapProduct((p.code as string) || '', p)
    );

    return { products, count: data.count || 0 };
  } catch {
    return { products: [], count: 0 };
  }
}

function mapProduct(barcode: string, p: Record<string, unknown>): FoodProduct {
  const nutriments = (p.nutriments as Record<string, unknown>) || {};

  const nutrition: NutritionFacts = {
    energy_kcal: num(nutriments['energy-kcal_100g'] ?? nutriments['energy-kcal']),
    proteins: num(nutriments['proteins_100g'] ?? nutriments['proteins']),
    carbohydrates: num(nutriments['carbohydrates_100g'] ?? nutriments['carbohydrates']),
    sugars: num(nutriments['sugars_100g'] ?? nutriments['sugars']),
    fat: num(nutriments['fat_100g'] ?? nutriments['fat']),
    saturated_fat: num(nutriments['saturated-fat_100g'] ?? nutriments['saturated-fat']),
    fiber: num(nutriments['fiber_100g'] ?? nutriments['fiber']),
    sodium: num(nutriments['sodium_100g'] ?? nutriments['sodium']),
    salt: num(nutriments['salt_100g'] ?? nutriments['salt']),
  };

  const allergens = ((p.allergens_tags as string[]) || [])
    .map((a: string) => a.replace(/^en:/, '').replace(/-/g, ' '));

  const additives = ((p.additives_tags as string[]) || [])
    .map((a: string) => a.replace(/^en:/, ''));

  return {
    barcode: barcode || (p.code as string) || '',
    name: (p.product_name as string) || 'Unknown Product',
    brand: p.brands as string | undefined,
    imageUrl: p.image_url as string | undefined,
    thumbnailUrl: (p.image_thumb_url as string | undefined) || (p.image_url as string | undefined),
    ingredients: p.ingredients_text as string | undefined,
    allergens,
    additives,
    labels: ((p.labels_tags as string[]) || []).map((l: string) => l.replace(/^en:/, '')),
    ingredientTags: ((p.ingredients_tags as string[]) || []).map((i: string) => i.replace(/^en:/, '').replace(/-/g, ' ')),
    ingredientAnalysisTags: ((p.ingredients_analysis_tags as string[]) || []).map((i: string) => i.replace(/^en:/, '').replace(/-/g, ' ')),
    categories: ((p.categories_tags as string[]) || []).map((c: string) => c.replace(/^en:/, '')),
    nutriments: nutrition,
    nutriScore: p.nutriscore_grade as string | undefined,
    novaGroup: p.nova_group as number | undefined,
    quantity: p.quantity as string | undefined,
    servingSize: p.serving_size as string | undefined,
    countries: p.countries as string | undefined,
  };
}

function num(v: unknown): number | undefined {
  const n = parseFloat(String(v));
  return isNaN(n) ? undefined : n;
}
