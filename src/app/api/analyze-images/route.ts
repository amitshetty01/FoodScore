import { createWorker } from 'tesseract.js';
import { NextResponse } from 'next/server';
import { calculateHealthScore } from '@/lib/scoring';
import { normalizeIngredientTag } from '@/lib/utils';
import type { ImageAnalysisResult, NutritionFacts } from '@/types';
import type { NextRequest } from 'next/server';

const FIELD_PATTERNS: Array<{ key: keyof NutritionFacts; patterns: RegExp[]; unit?: string }> = [
  { key: 'energy_kcal', patterns: [/energy\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*(kcal|kj)?/i, /calories\s*[:=]?\s*([0-9]+\.?[0-9]*)/i] },
  { key: 'proteins', patterns: [/protein[s]?\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*g/i] },
  { key: 'carbohydrates', patterns: [/carbohydrate[s]?\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*g/i, /carb[s]?\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*g/i] },
  { key: 'sugars', patterns: [/sugar[s]?\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*g/i] },
  { key: 'fat', patterns: [/fat\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*g/i] },
  { key: 'saturated_fat', patterns: [/saturated\s*fat\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*g/i, /sat\.?\s*fat\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*g/i] },
  { key: 'fiber', patterns: [/fiber\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*g/i, /fibre\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*g/i] },
  { key: 'sodium', patterns: [/sodium\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*mg/i, /sodium\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*g/i] },
  { key: 'salt', patterns: [/salt\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*g/i] },
];

function parseNutrition(text: string): NutritionFacts {
  const nutrition: NutritionFacts = {};
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

  for (const line of lines) {
    for (const field of FIELD_PATTERNS) {
      for (const regex of field.patterns) {
        const match = line.match(regex);
        if (match) {
          const value = Number(match[1]);
          if (Number.isNaN(value)) continue;
          if (field.key === 'energy_kcal') {
            const unit = match[2]?.toLowerCase();
            nutrition.energy_kcal = unit === 'kj' ? Math.round(value / 4.184) : value;
          } else if (field.key === 'sodium' && /mg/i.test(line)) {
            nutrition.sodium = value / 1000;
          } else {
            (nutrition[field.key] as number) = value;
          }
          break;
        }
      }
    }
  }

  return nutrition;
}

function parseIngredients(text: string): string | undefined {
  const ingredientsMatch = text.match(/ingredients\s*[:\-]?\s*(.+)/i);
  if (ingredientsMatch) {
    return ingredientsMatch[1].trim();
  }
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const candidate = lines.find((line) => /^ingredients?/i.test(line));
  return candidate?.replace(/^ingredients?\s*[:\-]?\s*/i, '').trim();
}

function parseServingSize(text: string): string | undefined {
  const match = text.match(/serving\s*size\s*[:=]?\s*([^\n]+)/i);
  return match?.[1].trim();
}

function createConfidence(nutrition: NutritionFacts, ingredients?: string): ImageAnalysisResult['confidence'] {
  const nutritionCount = Object.values(nutrition).filter((value) => value !== undefined).length;
  if (nutritionCount >= 5 && ingredients) return 'High Confidence';
  if (nutritionCount >= 3 || ingredients) return 'Medium Confidence';
  return 'Low Confidence';
}

function buildAnalysisResult(text: string): ImageAnalysisResult {
  const nutritionFacts = parseNutrition(text);
  const ingredients = parseIngredients(text);
  const servingSize = parseServingSize(text);
  const nameMatch = text.match(/^(.*?)\s*-\s*/m);
  const productName = nameMatch ? nameMatch[1].trim() : undefined;

  const product = {
    barcode: 'unknown',
    name: productName || 'Unknown product',
    brand: undefined,
    ingredients,
    ingredientTags: ingredients ? ingredients.split(/[,;]\s*/).map(normalizeIngredientTag) : [],
    additives: [],
    labels: [],
    categories: [],
    nutriments: nutritionFacts,
  } as const;

  const score = calculateHealthScore(product as any);
  const confidence = createConfidence(nutritionFacts, ingredients);

  const notes: string[] = [];
  if (!ingredients) notes.push('Unable to detect ingredients text clearly.');
  if (!nutritionFacts.energy_kcal && !nutritionFacts.sugars && !nutritionFacts.fat) {
    notes.push('Nutrition values were partially detected; score confidence may be reduced.');
  }
  if (!servingSize) notes.push('Serving size could not be extracted from the label.');

  return {
    productName,
    brandName: undefined,
    servingSize,
    nutritionFacts,
    ingredients,
    extractedText: text,
    healthScore: Math.round(score.total),
    verdict: score.summary,
    confidence,
    topReasons: score.breakdown.slice(0, 4).map((item) => item.explanation),
    notes: notes.length > 0 ? notes : ['Analysis completed successfully.'],
  };
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const files = ['frontImage', 'nutritionImage', 'ingredientsImage']
    .map((field) => ({ field, file: formData.get(field) as File | null }))
    .filter((item): item is { field: string; file: File } => item.file instanceof File && item.file.size > 0);

  if (files.length === 0) {
    return NextResponse.json({ error: 'No files uploaded.' }, { status: 400 });
  }

  const worker = await createWorker('eng');

  try {
    const extractedParts: string[] = [];
    for (const { file } of files) {
      if (!file) continue;
      const buffer = await file.arrayBuffer();
      const { data } = await worker.recognize(Buffer.from(buffer));
      extractedParts.push(data.text || '');
    }

    const extractedText = extractedParts.filter(Boolean).join('\n\n');
    const result = buildAnalysisResult(extractedText);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to analyze uploaded images.' }, { status: 500 });
  } finally {
    await worker.terminate();
  }
}
