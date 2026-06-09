/**
 * Ingredient Intelligence Engine
 * Provides risk assessment and regulatory notes for ingredients
 */

import { CountryCode } from './countryRules';

export type RiskLevel = 'Safe' | 'Low Concern' | 'Moderate Concern' | 'High Concern';

export interface IngredientInfo {
  name: string;
  purpose: string;
  riskLevel: RiskLevel;
  scientificConsensus: string;
  countryNotes: Record<CountryCode, string>;
  regulatory: {
    allowed_in: CountryCode[];
    restricted_in: CountryCode[];
  };
}

// Comprehensive ingredient database
const ingredientDatabase: Record<string, IngredientInfo> = {
  // Sweeteners
  'sugar': {
    name: 'Sugar (Sucrose)',
    purpose: 'Sweetener, flavor enhancer',
    riskLevel: 'Moderate Concern',
    scientificConsensus: 'Excessive consumption linked to obesity, Type 2 diabetes, and dental caries. WHO recommends limiting free sugars to less than 10% of daily energy intake.',
    countryNotes: {
      IN: 'FSSAI does not restrict sugar in foods but recommends limiting added sugars. Dental health warnings apply.',
      US: 'FDA does not set a limit but USDA Dietary Guidelines recommend limiting added sugars to less than 10% of daily calories.',
      CA: 'Health Canada recommends limiting added sugars to less than 25% of daily calories.',
      AU: 'Australian Dietary Guidelines recommend limiting foods high in added sugars.',
    },
    regulatory: {
      allowed_in: ['IN', 'US', 'CA', 'AU'],
      restricted_in: [],
    },
  },

  'high fructose corn syrup': {
    name: 'High Fructose Corn Syrup (HFCS)',
    purpose: 'Sweetener, preservative',
    riskLevel: 'High Concern',
    scientificConsensus: 'Studies suggest metabolic effects differ from sucrose. Associated with increased obesity and metabolic syndrome risk.',
    countryNotes: {
      IN: 'Limited use; FSSAI permits but with usage restrictions in certain categories.',
      US: 'FDA approves but controversial; many consumers avoid due to health concerns.',
      CA: 'Health Canada permits but recommends limiting intake.',
      AU: 'FSANZ permits; increasingly avoided by health-conscious consumers.',
    },
    regulatory: {
      allowed_in: ['IN', 'US', 'CA', 'AU'],
      restricted_in: [],
    },
  },

  'aspartame': {
    name: 'Aspartame',
    purpose: 'Artificial sweetener',
    riskLevel: 'Low Concern',
    scientificConsensus: 'Extensively studied; FDA and EFSA concluded safe at approved levels. However, some individuals may be sensitive.',
    countryNotes: {
      IN: 'FSSAI permits; must be labeled clearly.',
      US: 'FDA approved; safe at recommended levels (ADI: 50 mg/kg/day).',
      CA: 'Health Canada approved; suitable for most populations.',
      AU: 'FSANZ approved (additive 951); phenylketonuric warning required.',
    },
    regulatory: {
      allowed_in: ['IN', 'US', 'CA', 'AU'],
      restricted_in: [],
    },
  },

  'sucralose': {
    name: 'Sucralose',
    purpose: 'Artificial sweetener',
    riskLevel: 'Low Concern',
    scientificConsensus: 'Generally recognized as safe (GRAS). Well-studied; no significant adverse effects at approved doses.',
    countryNotes: {
      IN: 'FSSAI permits; limited studies in Indian population.',
      US: 'FDA approved; considered safe.',
      CA: 'Health Canada approved; deemed safe.',
      AU: 'FSANZ approved (additive 955); considered safe.',
    },
    regulatory: {
      allowed_in: ['IN', 'US', 'CA', 'AU'],
      restricted_in: [],
    },
  },

  'saccharin': {
    name: 'Saccharin',
    purpose: 'Artificial sweetener',
    riskLevel: 'Moderate Concern',
    scientificConsensus: 'Historically controversial; animal studies showed cancer risk at high doses, but human data is less conclusive.',
    countryNotes: {
      IN: 'FSSAI permits but with strict usage limits.',
      US: 'FDA approved; removed from carcinogenic list in 2001.',
      CA: 'Permitted with restrictions; Health Canada monitors.',
      AU: 'FSANZ permits but with usage limits (additive 954).',
    },
    regulatory: {
      allowed_in: ['IN', 'US', 'CA', 'AU'],
      restricted_in: [],
    },
  },

  // Colors
  'tartrazine': {
    name: 'Tartrazine (Yellow 5)',
    purpose: 'Artificial color',
    riskLevel: 'Moderate Concern',
    scientificConsensus: 'May trigger allergic reactions in sensitive individuals, especially those with aspirin sensitivity. Linked to hyperactivity in some children.',
    countryNotes: {
      IN: 'FSSAI permits; labeling required. Commonly used but health-conscious consumers avoid.',
      US: 'FDA approved; must be labeled. Some states consider limiting use.',
      CA: 'Health Canada permits; warning labels in some cases.',
      AU: 'FSANZ permits (additive 110); consumer advocacy against use in children\'s products.',
    },
    regulatory: {
      allowed_in: ['IN', 'US', 'CA', 'AU'],
      restricted_in: [],
    },
  },

  'allura red ac': {
    name: 'Allura Red AC (Red 40)',
    purpose: 'Artificial color',
    riskLevel: 'Moderate Concern',
    scientificConsensus: 'Generally recognized as safe, but some studies suggest links to hyperactivity in children. Under review in multiple countries.',
    countryNotes: {
      IN: 'FSSAI permits with restrictions.',
      US: 'FDA approved; widely used.',
      CA: 'Health Canada permits.',
      AU: 'FSANZ permits (additive 129); banned in some EU countries causes consumer concern.',
    },
    regulatory: {
      allowed_in: ['IN', 'US', 'CA', 'AU'],
      restricted_in: [],
    },
  },

  // Preservatives
  'sodium benzoate': {
    name: 'Sodium Benzoate',
    purpose: 'Preservative, antimicrobial',
    riskLevel: 'Low Concern',
    scientificConsensus: 'Widely used; GRAS status. Small percentage of population may have sensitivity.',
    countryNotes: {
      IN: 'FSSAI permits; commonly used.',
      US: 'FDA approved; safe at allowed levels.',
      CA: 'Health Canada permits.',
      AU: 'FSANZ permits (additive 211); considered safe.',
    },
    regulatory: {
      allowed_in: ['IN', 'US', 'CA', 'AU'],
      restricted_in: [],
    },
  },

  'potassium sorbate': {
    name: 'Potassium Sorbate',
    purpose: 'Preservative, antimicrobial',
    riskLevel: 'Low Concern',
    scientificConsensus: 'Generally recognized as safe. Well-tolerated; some sensitive individuals may react.',
    countryNotes: {
      IN: 'FSSAI permits; widely used.',
      US: 'FDA approved; considered safe.',
      CA: 'Health Canada permits.',
      AU: 'FSANZ permits (additive 202); deemed safe.',
    },
    regulatory: {
      allowed_in: ['IN', 'US', 'CA', 'AU'],
      restricted_in: [],
    },
  },

  'bha': {
    name: 'Butylated Hydroxyanisole (BHA)',
    purpose: 'Antioxidant, preservative',
    riskLevel: 'High Concern',
    scientificConsensus: 'Possible carcinogen (listed by NTP). Animal studies show tumor development. Increasingly restricted.',
    countryNotes: {
      IN: 'FSSAI permits with restrictions; use declining.',
      US: 'FDA permits (GRAS) but under review; pending restriction.',
      CA: 'Permitted but controversial; Health Canada monitoring.',
      AU: 'FSANZ permits but declining use.',
    },
    regulatory: {
      allowed_in: ['IN', 'US', 'CA', 'AU'],
      restricted_in: [],
    },
  },

  'bht': {
    name: 'Butylated Hydroxytoluene (BHT)',
    purpose: 'Antioxidant, preservative',
    riskLevel: 'High Concern',
    scientificConsensus: 'Possible carcinogen (potential reproductive/developmental hazard). Use declining.',
    countryNotes: {
      IN: 'FSSAI permits with restrictions.',
      US: 'FDA permits but under review; may be restricted.',
      CA: 'Permitted but Health Canada monitoring.',
      AU: 'FSANZ permits with usage limits.',
    },
    regulatory: {
      allowed_in: ['IN', 'US', 'CA', 'AU'],
      restricted_in: [],
    },
  },

  // Other additives
  'monosodium glutamate': {
    name: 'Monosodium Glutamate (MSG)',
    purpose: 'Flavor enhancer',
    riskLevel: 'Low Concern',
    scientificConsensus: 'Extensively studied; FDA deems safe. "MSG sensitivity" not conclusively proven in controlled studies.',
    countryNotes: {
      IN: 'FSSAI permits; widely used in Indian cuisine.',
      US: 'FDA recognizes as GRAS; labeling required.',
      CA: 'Health Canada permits; common in food.',
      AU: 'FSANZ permits; well-accepted.',
    },
    regulatory: {
      allowed_in: ['IN', 'US', 'CA', 'AU'],
      restricted_in: [],
    },
  },

  'trans fat': {
    name: 'Trans Fat (Artificial)',
    purpose: 'Texture, shelf-life',
    riskLevel: 'High Concern',
    scientificConsensus: 'Strongly linked to cardiovascular disease, inflammation, and metabolic dysfunction. Should be minimized.',
    countryNotes: {
      IN: 'FSSAI restricts trans fat to 5% of total fat.',
      US: 'FDA banned artificial trans fats effective 2018.',
      CA: 'Health Canada limits trans fat; phase-out underway.',
      AU: 'FSANZ does not allow artificial trans fats in most products.',
    },
    regulatory: {
      allowed_in: ['IN'],
      restricted_in: ['US', 'CA', 'AU'],
    },
  },

  // Natural ingredients with benefits
  'fiber': {
    name: 'Dietary Fiber',
    purpose: 'Nutritional component',
    riskLevel: 'Safe',
    scientificConsensus: 'Essential nutrient. Promotes digestive health, stable blood sugar, and heart health. No known adverse effects at normal levels.',
    countryNotes: {
      IN: 'ICMR recommends 25-40g/day for adults.',
      US: 'USDA recommends 25-38g/day for adults.',
      CA: 'Health Canada recommends 25-38g/day for adults.',
      AU: 'NHMRC recommends 25-30g/day for adults.',
    },
    regulatory: {
      allowed_in: ['IN', 'US', 'CA', 'AU'],
      restricted_in: [],
    },
  },

  'whole grain': {
    name: 'Whole Grain',
    purpose: 'Nutritional component',
    riskLevel: 'Safe',
    scientificConsensus: 'Supported by extensive research. Reduces risk of cardiovascular disease, Type 2 diabetes, and colon cancer.',
    countryNotes: {
      IN: 'ICMR promotes whole grains; part of balanced diet.',
      US: 'USDA recommends half of grains be whole grains.',
      CA: 'Health Canada recommends whole grain products.',
      AU: 'Australian Guidelines promote whole grains.',
    },
    regulatory: {
      allowed_in: ['IN', 'US', 'CA', 'AU'],
      restricted_in: [],
    },
  },

  'omega-3 fatty acid': {
    name: 'Omega-3 Fatty Acid',
    purpose: 'Nutritional component',
    riskLevel: 'Safe',
    scientificConsensus: 'Essential fatty acid with strong cardiovascular and cognitive benefits. Recommended by all major health organizations.',
    countryNotes: {
      IN: 'ICMR recommends inclusion in diet.',
      US: 'USDA recommends fatty fish 2x per week.',
      CA: 'Health Canada recommends omega-3 intake.',
      AU: 'NHMRC promotes omega-3 foods.',
    },
    regulatory: {
      allowed_in: ['IN', 'US', 'CA', 'AU'],
      restricted_in: [],
    },
  },

  'probiotics': {
    name: 'Probiotics',
    purpose: 'Digestive health',
    riskLevel: 'Safe',
    scientificConsensus: 'Emerging evidence supports digestive and immune benefits. Generally safe; ensure strain identification.',
    countryNotes: {
      IN: 'FSSAI permits as food; traditional in Indian diet.',
      US: 'FDA does not regulate as drug; marketed as food.',
      CA: 'Health Canada permits specified strains.',
      AU: 'FSANZ permits approved strains.',
    },
    regulatory: {
      allowed_in: ['IN', 'US', 'CA', 'AU'],
      restricted_in: [],
    },
  },
};

/**
 * Get ingredient information
 */
export function getIngredientInfo(ingredientName: string): IngredientInfo | null {
  const normalized = ingredientName.toLowerCase().trim();
  
  for (const [key, info] of Object.entries(ingredientDatabase)) {
    if (key === normalized || info.name.toLowerCase() === normalized) {
      return info;
    }
  }
  
  return null;
}

/**
 * Classify ingredient by risk level
 */
export function classifyIngredientRisk(ingredientName: string): RiskLevel {
  const info = getIngredientInfo(ingredientName);
  return info?.riskLevel || 'Moderate Concern';
}

/**
 * Get country-specific notes for ingredient
 */
export function getIngredientCountryNotes(ingredientName: string, country: CountryCode): string {
  const info = getIngredientInfo(ingredientName);
  return info?.countryNotes[country] || `No specific regulatory notes for ${ingredientName} in this country.`;
}

/**
 * Check if ingredient is restricted in a country
 */
export function isIngredientRestricted(ingredientName: string, country: CountryCode): boolean {
  const info = getIngredientInfo(ingredientName);
  return info?.regulatory.restricted_in.includes(country) || false;
}

/**
 * Get all ingredients with a specific risk level
 */
export function getIngredientsByRiskLevel(riskLevel: RiskLevel): IngredientInfo[] {
  return Object.values(ingredientDatabase).filter(info => info.riskLevel === riskLevel);
}

/**
 * Analyze array of ingredients for risk profile
 */
export interface IngredientAnalysisResult {
  totalIngredients: number;
  riskBreakdown: Record<RiskLevel, number>;
  concerningIngredients: string[];
  safeIngredients: string[];
  countryRestrictions: string[];
}

export function analyzeIngredients(
  ingredients: string[],
  country: CountryCode
): IngredientAnalysisResult {
  const riskBreakdown: Record<RiskLevel, number> = {
    'Safe': 0,
    'Low Concern': 0,
    'Moderate Concern': 0,
    'High Concern': 0,
  };
  
  const concerningIngredients: string[] = [];
  const safeIngredients: string[] = [];
  const countryRestrictions: string[] = [];
  
  for (const ingredient of ingredients) {
    const info = getIngredientInfo(ingredient);
    
    if (info) {
      riskBreakdown[info.riskLevel]++;
      
      if (info.riskLevel === 'High Concern' || info.riskLevel === 'Moderate Concern') {
        concerningIngredients.push(ingredient);
      } else if (info.riskLevel === 'Safe') {
        safeIngredients.push(ingredient);
      }
      
      if (isIngredientRestricted(ingredient, country)) {
        countryRestrictions.push(`${ingredient} is restricted in ${country}`);
      }
    } else {
      riskBreakdown['Moderate Concern']++;
    }
  }
  
  return {
    totalIngredients: ingredients.length,
    riskBreakdown,
    concerningIngredients,
    safeIngredients,
    countryRestrictions,
  };
}
