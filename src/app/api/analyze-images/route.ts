import { createWorker } from 'tesseract.js';
import { NextResponse } from 'next/server';
import { calculateHealthScore } from '@/lib/scoring';
import { normalizeIngredientTag } from '@/lib/utils';
import { OCR_LANGUAGES, detectLanguage, translateIngredients } from '@/lib/ingredientTranslation';
import type { FoodProduct, ImageAnalysisResult, NutritionFacts } from '@/types';
import type { NextRequest } from 'next/server';

const FIELD_PATTERNS: Array<{ key: keyof NutritionFacts; patterns: RegExp[]; unit?: string }> = [
  { key: 'energy_kcal', patterns: [/energy\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*(kcal|kj)?/i, /calories\s*[:=]?\s*([0-9]+\.?[0-9]*)/i, /énergie\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*(kcal|kj)?/i, /energia\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*(kcal|kj)?/i, /energie\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*(kcal|kj)?/i] },
  { key: 'proteins', patterns: [/protein[s]?\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*g/i, /protéine[s]?\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*g/i, /proteine\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*g/i, /proteína[s]?\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*g/i, /eiweiß\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*g/i] },
  { key: 'carbohydrates', patterns: [/carbohydrate[s]?\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*g/i, /carb[s]?\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*g/i, /glucides\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*g/i, /carboidrati\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*g/i, /hidratos de carbono\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*g/i, /kohlenhydrate\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*g/i] },
  { key: 'sugars', patterns: [/sugar[s]?\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*g/i, /sucre[s]?\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*g/i, /zuccher[i]?\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*g/i, /azúcares?\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*g/i, /zucker\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*g/i] },
  { key: 'fat', patterns: [/fat\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*g/i, /matières? grasses?\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*g/i, /grass[i]?\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*g/i, /grasas?\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*g/i, /fett\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*g/i] },
  { key: 'saturated_fat', patterns: [/saturated\s*fat\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*g/i, /sat\.?\s*fat\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*g/i, /acides? gras? saturés?\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*g/i, /grassi saturi\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*g/i, /grasas? saturadas?\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*g/i, /gesättigte fettsäuren\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*g/i] },
  { key: 'fiber', patterns: [/fiber\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*g/i, /fibre\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*g/i, /fibres?\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*g/i, /fibra\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*g/i, /ballaststoffe\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*g/i] },
  { key: 'sodium', patterns: [/sodium\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*mg/i, /sodium\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*g/i, /natrium\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*mg/i, /sodio\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*mg/i] },
  { key: 'salt', patterns: [/salt\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*g/i, /sel\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*g/i, /sale\s*[:=]?\s*([0-9]+\.?[0-9]*)\s*g/i] },
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

function parseIngredients(text: string, language: string): string | undefined {
  const ingredientHeaders: Record<string, RegExp> = {
    en: /ingredients\s*[:\-]?\s*(.+)/i,
    fr: /ingrédients?\s*[:\-]?\s*(.+)/i,
    it: /ingredienti\s*[:\-]?\s*(.+)/i,
    es: /ingredientes?\s*[:\-]?\s*(.+)/i,
    de: /zutaten\s*[:\-]?\s*(.+)/i,
  };

  const regex = ingredientHeaders[language] || ingredientHeaders.en;
  const ingredientsMatch = text.match(regex);
  if (ingredientsMatch) {
    return ingredientsMatch[1].trim();
  }

  // Try all headers as fallback
  for (const [, headerRegex] of Object.entries(ingredientHeaders)) {
    const match = text.match(headerRegex);
    if (match) return match[1].trim();
  }

  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const candidate = lines.find((line) =>
    /^ingredients?|^ingrédients?|^ingredienti|^ingredientes?|^zutaten/i.test(line)
  );
  return candidate?.replace(/^[^:]*[:\-]?\s*/i, '').trim();
}

function parseServingSize(text: string): string | undefined {
  const patterns = [/serving\s*size\s*[:=]?\s*([^\n]+)/i, /portion\s*[:=]?\s*([^\n]+)/i, /porzione\s*[:=]?\s*([^\n]+)/i, /ración\s*[:=]?\s*([^\n]+)/i, /portion\s*[:=]?\s*([^\n]+)/i];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }
  return undefined;
}

function createConfidence(nutrition: NutritionFacts, ingredients?: string): ImageAnalysisResult['confidence'] {
  const nutritionCount = Object.values(nutrition).filter((value) => value !== undefined).length;
  if (nutritionCount >= 5 && ingredients) return 'High Confidence';
  if (nutritionCount >= 3 || ingredients) return 'Medium Confidence';
  return 'Low Confidence';
}

function buildAnalysisResult(text: string, detectedLang: string): ImageAnalysisResult {
  const nutritionFacts = parseNutrition(text);
  const ingredients = parseIngredients(text, detectedLang);
  const servingSize = parseServingSize(text);
  const nameMatch = text.match(/^(.*?)\s*[-–—]\s*/m);
  const productName = nameMatch ? nameMatch[1].trim() : undefined;

  // Translate ingredients if detected language is not English
  let translatedIngredients: string | undefined;
  let ingredientTags: string[] = [];
  if (ingredients) {
    const rawIngredients = ingredients.split(/[,;]\s*/).map(i => i.trim()).filter(Boolean);
    if (detectedLang !== 'en') {
      const translated = translateIngredients(rawIngredients);
      translatedIngredients = translated.map(t => t.translated).join(', ');
      ingredientTags = translated.map(t => normalizeIngredientTag(t.translated));
    } else {
      translatedIngredients = ingredients;
      ingredientTags = rawIngredients.map(normalizeIngredientTag);
    }
  }

  const product = {
    barcode: 'unknown',
    name: productName || 'Unknown product',
    brand: undefined,
    ingredients: translatedIngredients || ingredients,
    ingredientTags: ingredientTags,
    additives: [],
    labels: [],
    categories: [],
    nutriments: nutritionFacts,
  };

  const score = calculateHealthScore(product as FoodProduct);
  const confidence = createConfidence(nutritionFacts, ingredients);

  const notes: string[] = [];
  if (!ingredients) notes.push('Unable to detect ingredients text clearly.');
  if (!nutritionFacts.energy_kcal && !nutritionFacts.sugars && !nutritionFacts.fat) {
    notes.push('Nutrition values were partially detected; score confidence may be reduced.');
  }
  if (!servingSize) notes.push('Serving size could not be extracted from the label.');
  if (detectedLang !== 'en' && ingredients) {
    notes.push(`Detected language: ${detectedLang.toUpperCase()}. Ingredients were automatically interpreted.`);
  }

  return {
    productName,
    brandName: undefined,
    servingSize,
    nutritionFacts,
    ingredients: translatedIngredients || ingredients,
    extractedText: text,
    healthScore: score.total,
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
    .filter(({ file }) => file instanceof File && file.size > 0);

  if (files.length === 0) {
    return NextResponse.json({ error: 'No files uploaded.' }, { status: 400 });
  }

  // Use all OCR languages for best coverage
  const worker = await createWorker(OCR_LANGUAGES.join('+'));

  try {
    const extractedParts: string[] = [];
    for (const { file } of files) {
      if (!file) continue;
      const buffer = await file.arrayBuffer();
      const { data } = await worker.recognize(Buffer.from(buffer));
      extractedParts.push(data.text || '');
    }

    const extractedText = extractedParts.filter(Boolean).join('\n\n');

    // Detect language from extracted text for ingredient parsing
    const detectedTextLang = detectLanguage(extractedText);
    const result = buildAnalysisResult(extractedText, detectedTextLang);
    return NextResponse.json(result);
  } catch (error) {
    console.error('OCR analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze uploaded images. Please try clearer photos.' }, { status: 500 });
  } finally {
    await worker.terminate();
  }
}
