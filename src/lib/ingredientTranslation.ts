/**
 * Ingredient Translation Engine
 * Detects non-English ingredient names and translates/commonizes them
 * for analysis against the English-based ingredient database.
 */

// Common ingredient mappings from various languages to English
const INGREDIENT_TRANSLATIONS: Record<string, string> = {
  // French
  'sucre': 'sugar',
  'sel': 'salt',
  'farine': 'flour',
  'huile': 'oil',
  'beurre': 'butter',
  'oeufs': 'eggs',
  'oeuf': 'egg',
  'lait': 'milk',
  'crème': 'cream',
  'fromage': 'cheese',
  'yaourt': 'yogurt',
  'eau': 'water',
  'blé': 'wheat',
  'riz': 'rice',
  'maïs': 'corn',
  'amidon': 'starch',
  'glucose': 'glucose',
  'fructose': 'fructose',
  'sirop de maïs': 'corn syrup',
  'sirop de glucose': 'glucose syrup',
  'lécithine': 'lecithin',
  'arôme': 'flavor',
  'arôme naturel': 'natural flavor',
  'colorant': 'color',
  'conservateur': 'preservative',
  'antioxydant': 'antioxidant',
  'émulsifiant': 'emulsifier',
  'stabilisant': 'stabilizer',
  'épaississant': 'thickener',
  'acidifiant': 'acidity regulator',
  'vitamine': 'vitamin',
  'minéraux': 'minerals',
  'protéines': 'protein',
  'protéine': 'protein',
  'fibres': 'fiber',
  'acide citrique': 'citric acid',
  'bicarbonate de sodium': 'sodium bicarbonate',
  'levure': 'yeast',
  'chocolat': 'chocolate',
  'cacao': 'cocoa',
  'vanille': 'vanilla',
  'cannelle': 'cinnamon',
  'noix': 'walnut',
  'amande': 'almond',
  'noisette': 'hazelnut',
  'cacahuète': 'peanut',
  'tournesol': 'sunflower',
  'palme': 'palm',
  'margarine': 'margarine',
  'mayonnaise': 'mayonnaise',
  'moutarde': 'mustard',
  'vinaigre': 'vinegar',
  'tomate': 'tomato',
  'oignon': 'onion',
  'ail': 'garlic',
  'poivre': 'pepper',
  'épices': 'spices',

  // Italian
  'zucchero': 'sugar',
  'farina': 'flour',
  'olio': 'oil',
  'burro': 'butter',
  'uova': 'eggs',
  'uovo': 'egg',
  'panna': 'cream',
  'formaggio': 'cheese',
  'yogurt': 'yogurt',
  'acqua': 'water',
  'grano': 'wheat',
  'amido': 'starch',
  'sciroppo di mais': 'corn syrup',
  'sciroppo di glucosio': 'glucose syrup',
  'lecitina': 'lecithin',
  'aroma': 'flavor',
  'aroma naturale': 'natural flavor',
  'antiossidante': 'antioxidant',
  'emulsionante': 'emulsifier',
  'stabilizzante': 'stabilizer',
  'addensante': 'thickener',
  'vitamina': 'vitamin',
  'proteine': 'protein',
  'fibra': 'fiber',
  'acido citrico': 'citric acid',
  'bicarbonato di sodio': 'sodium bicarbonate',
  'lievito': 'yeast',
  'cioccolato': 'chocolate',
  'vaniglia': 'vanilla',
  'cannella': 'cinnamon',
  'noci': 'walnut',
  'mandorla': 'almond',
  'nocciola': 'hazelnut',
  'arachide': 'peanut',
  'soia': 'soy',
  'girasole': 'sunflower',
  'maionese': 'mayonnaise',
  'senape': 'mustard',
  'aceto': 'vinegar',
  'pomodoro': 'tomato',
  'cipolla': 'onion',
  'aglio': 'garlic',
  'pepe': 'pepper',
  'spezie': 'spices',

  // Spanish
  'azúcar': 'sugar',
  'harina': 'flour',
  'aceite': 'oil',
  'mantequilla': 'butter',
  'huevos': 'eggs',
  'huevo': 'egg',
  'leche': 'milk',
  'crema': 'cream',
  'queso': 'cheese',
  'yogur': 'yogurt',
  'agua': 'water',
  'trigo': 'wheat',
  'arroz': 'rice',
  'maíz': 'corn',
  'almidón': 'starch',
  'jarabe de maíz': 'corn syrup',
  'jarabe de glucosa': 'glucose syrup',
  'sabor': 'flavor',
  'sabor natural': 'natural flavor',
  'estabilizante': 'stabilizer',
  'espesante': 'thickener',
  'proteína': 'protein',
  'ácido cítrico': 'citric acid',
  'levadura': 'yeast',
  'vainilla': 'vanilla',
  'canela': 'cinnamon',
  'nueces': 'walnut',
  'almendra': 'almond',
  'avellana': 'hazelnut',
  'cacahuete': 'peanut',
  'girasol': 'sunflower',
  'mayonesa': 'mayonnaise',
  'mostaza': 'mustard',
  'vinagre': 'vinegar',
  'cebolla': 'onion',
  'ajo': 'garlic',
  'pimienta': 'pepper',
  'especias': 'spices',

  // German
  'zucker': 'sugar',
  'salz': 'salt',
  'mehl': 'flour',
  'öl': 'oil',
  'eier': 'eggs',
  'ei': 'egg',
  'milch': 'milk',
  'sahne': 'cream',
  'käse': 'cheese',
  'joghurt': 'yogurt',
  'wasser': 'water',
  'weizen': 'wheat',
  'reis': 'rice',
  'stärke': 'starch',
  'glukosesirup': 'glucose syrup',
  'lecitin': 'lecithin',
  'natürliches aroma': 'natural flavor',
  'farbstoff': 'color',
  'konservierungsstoff': 'preservative',
  'antioxidationsmittel': 'antioxidant',
  'emulgator': 'emulsifier',
  'stabilisator': 'stabilizer',
  'verdickungsmittel': 'thickener',
  'vitamin': 'vitamin',
  'eiweiß': 'protein',
  'ballaststoffe': 'fiber',
  'zitronensäure': 'citric acid',
  'natron': 'sodium bicarbonate',
  'hefe': 'yeast',
  'schokolade': 'chocolate',
  'kakao': 'cocoa',
  'zimt': 'cinnamon',
  'nüsse': 'nuts',
  'mandel': 'almond',
  'haselnuss': 'hazelnut',
  'erdnuss': 'peanut',
  'sonnenblume': 'sunflower',
  'raps': 'rapeseed',
  'senf': 'mustard',
  'essig': 'vinegar',
  'zwiebel': 'onion',
  'knoblauch': 'garlic',
  'pfeffer': 'pepper',
  'gewürze': 'spices',

  // Same-word-translation across languages (removed duplicates, keeping first occurrence)
  // 'palma' -> 'palm' (it), 'colza' -> 'rapeseed' (it), 'soja' -> 'soy' (es/de)
  'colza': 'rapeseed',
  'palma': 'palm',
  'soja': 'soy',
};

// List of languages to try for OCR
export const OCR_LANGUAGES = ['eng', 'fra', 'ita', 'spa', 'deu'];

/**
 * Detect the likely language of a text string
 */
export function detectLanguage(text: string): string {
  const lower = text.toLowerCase();
  const scores: Record<string, number> = { en: 0, fr: 0, it: 0, es: 0, de: 0 };

  // French-specific words
  const frWords = ['sucre', 'farine', 'beurre', 'oeufs', 'lait', 'crème', 'fromage', 'yaourt', 'eau', 'blé', 'huile', 'sel', 'lécithine', 'arôme', 'colorant', 'conservateur', 'émulsifiant'];
  frWords.forEach(w => { if (lower.includes(w)) scores.fr += 2; });

  // Italian-specific words
  const itWords = ['zucchero', 'farina', 'burro', 'uova', 'latte', 'panna', 'formaggio', 'yogurt', 'acqua', 'grano', 'olio', 'sale', 'lecitina', 'aroma', 'colorante'];
  itWords.forEach(w => { if (lower.includes(w)) scores.it += 2; });

  // Spanish-specific words
  const esWords = ['azúcar', 'harina', 'mantequilla', 'huevos', 'leche', 'crema', 'queso', 'yogur', 'agua', 'trigo', 'aceite', 'sal', 'lecitina', 'sabor', 'colorante'];
  esWords.forEach(w => { if (lower.includes(w)) scores.es += 2; });

  // German-specific words
  const deWords = ['zucker', 'mehl', 'butter', 'eier', 'milch', 'sahne', 'käse', 'joghurt', 'wasser', 'weizen', 'öl', 'salz', 'lecitin', 'aroma', 'farbstoff'];
  deWords.forEach(w => { if (lower.includes(w)) scores.de += 2; });

  // English-specific words
  const enWords = ['sugar', 'flour', 'butter', 'eggs', 'milk', 'cream', 'cheese', 'yogurt', 'water', 'wheat', 'oil', 'salt', 'lecithin', 'flavor', 'color', 'preservative'];
  enWords.forEach(w => { if (lower.includes(w)) scores.en += 2; });

  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return best[1] > 0 ? best[0] : 'en';
}

/**
 * Get best OCR language code based on detected language
 */
export function getOcrLanguage(detectedLang: string): string {
  const langMap: Record<string, string> = {
    en: 'eng',
    fr: 'fra',
    it: 'ita',
    es: 'spa',
    de: 'deu',
  };
  return langMap[detectedLang] || 'eng';
}

/**
 * Translate a single ingredient name to English if it's in a foreign language
 */
export function translateIngredient(ingredient: string): string {
  const lower = ingredient.toLowerCase().trim();
  const directMatch = INGREDIENT_TRANSLATIONS[lower];
  if (directMatch) return directMatch;

  // Try partial matches for compound ingredients
  for (const [foreign, english] of Object.entries(INGREDIENT_TRANSLATIONS)) {
    if (lower.includes(foreign)) {
      return lower.replace(foreign, english);
    }
  }

  return ingredient;
}

/**
 * Translate an array of ingredients, returning originals with their English translations
 */
export function translateIngredients(ingredients: string[]): { original: string; translated: string }[] {
  return ingredients.map(ing => ({
    original: ing.trim(),
    translated: translateIngredient(ing.trim()),
  }));
}
