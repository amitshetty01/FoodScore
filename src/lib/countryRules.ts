/**
 * Country Rules Database
 * Centralized nutrition guidelines for supported countries
 * Based on official regulatory bodies
 */

export type CountryCode = 'IN' | 'US' | 'CA' | 'AU';

export interface NutritionGuidelines {
  country: CountryCode;
  countryName: string;
  references: string[];
  
  // Daily recommended values (per day for adults)
  daily: {
    calories: number;
    protein_min_g: number;
    carbohydrates_g: number;
    fat_max_g: number;
    saturated_fat_max_g: number;
    fiber_min_g: number;
    sugar_max_g: number;
    sodium_max_mg: number;
    potassium_min_mg: number;
  };
  
  // Per serving considerations
  serving: {
    sugar_max_g: number;
    sodium_max_mg: number;
    saturated_fat_max_g: number;
  };
  
  // Child-specific guidelines (5-12 years)
  childGuidelines: {
    calories: number;
    sugar_max_g: number;
    sodium_max_mg: number;
    protein_min_g: number;
  };
  
  // Risk thresholds for artificial additives
  artificialAdditives: {
    colors: string[];
    sweeteners: string[];
    preservatives: string[];
  };
  
  // Fortification standards (what should be fortified)
  fortificationStandards: string[];
}

// INDIA - Based on FSSAI and ICMR guidelines
// India has stricter sugar limits due to high diabetes prevalence (ICMR 2022).
// Higher fiber recommended to align with traditional plant-rich diets.
export const indiaGuidelines: NutritionGuidelines = {
  country: 'IN',
  countryName: 'India',
  references: ['FSSAI (Food Safety and Standards Authority of India)', 'ICMR (Indian Council of Medical Research)', 'RDA India'],
  
  daily: {
    calories: 2000,
    protein_min_g: 50,
    carbohydrates_g: 300,
    fat_max_g: 67,
    saturated_fat_max_g: 20,
    fiber_min_g: 35,
    sugar_max_g: 40,
    sodium_max_mg: 2300,
    potassium_min_mg: 3500,
  },
  
  serving: {
    sugar_max_g: 5,
    sodium_max_mg: 200,
    saturated_fat_max_g: 2.0,
  },
  
  childGuidelines: {
    calories: 1400,
    sugar_max_g: 20,
    sodium_max_mg: 1000,
    protein_min_g: 20,
  },
  
  artificialAdditives: {
    colors: ['tartrazine', 'sunset yellow', 'allura red', 'cochineal red'],
    sweeteners: ['saccharin', 'aspartame'],
    preservatives: ['benzoate', 'sorbate'],
  },
  
  fortificationStandards: ['iron', 'iodine', 'vitamin B12', 'folic acid'],
};

// USA - Based on FDA/USDA and Dietary Guidelines for Americans
export const usaGuidelines: NutritionGuidelines = {
  country: 'US',
  countryName: 'United States',
  references: ['FDA', 'USDA', 'Dietary Guidelines for Americans 2020-2025', 'DRI'],
  
  daily: {
    calories: 2000,
    protein_min_g: 50,
    carbohydrates_g: 275,
    fat_max_g: 78,
    saturated_fat_max_g: 22,
    fiber_min_g: 28,
    sugar_max_g: 50,
    sodium_max_mg: 2300,
    potassium_min_mg: 3400,
  },
  
  serving: {
    sugar_max_g: 4,
    sodium_max_mg: 140,
    saturated_fat_max_g: 1.5,
  },
  
  childGuidelines: {
    calories: 1600,
    sugar_max_g: 25,
    sodium_max_mg: 1500,
    protein_min_g: 24,
  },
  
  artificialAdditives: {
    colors: ['red 40', 'yellow 5', 'yellow 6', 'blue 1'],
    sweeteners: ['acesulfame K', 'aspartame', 'sucralose', 'saccharin'],
    preservatives: ['BHA', 'BHT', 'TBHQ'],
  },
  
  fortificationStandards: ['vitamin D', 'calcium', 'iron', 'folic acid'],
};

// CANADA - Based on Health Canada guidelines
// Health Canada's sodium reduction strategy targets 2000mg/day.
// Stricter free sugar limit (20% of calories ≈ 40g) and saturated fat <10% energy.
export const canadaGuidelines: NutritionGuidelines = {
  country: 'CA',
  countryName: 'Canada',
  references: ['Health Canada', 'Canada Food Guide', 'Nutrition Labeling Rules'],
  
  daily: {
    calories: 2000,
    protein_min_g: 50,
    carbohydrates_g: 300,
    fat_max_g: 65,
    saturated_fat_max_g: 20,
    fiber_min_g: 28,
    sugar_max_g: 40,
    sodium_max_mg: 2000,
    potassium_min_mg: 3400,
  },
  
  serving: {
    sugar_max_g: 4,
    sodium_max_mg: 100,
    saturated_fat_max_g: 1.5,
  },
  
  childGuidelines: {
    calories: 1500,
    sugar_max_g: 20,
    sodium_max_mg: 1100,
    protein_min_g: 20,
  },
  
  artificialAdditives: {
    colors: ['allura red AC', 'tartrazine', 'sunset yellow'],
    sweeteners: ['acesulfame potassium', 'aspartame', 'sucralose'],
    preservatives: ['sodium benzoate', 'potassium sorbate'],
  },
  
  fortificationStandards: ['vitamin D', 'calcium', 'iron'],
};

// AUSTRALIA - Based on FSANZ and Australian Dietary Guidelines
// NHMRC recommends lower sodium (2000mg) and slightly higher saturated fat allowance.
// Fiber recommendation aligns with 25g adequate intake.
export const australiaGuidelines: NutritionGuidelines = {
  country: 'AU',
  countryName: 'Australia',
  references: ['FSANZ (Food Standards Australia and New Zealand)', 'Australian Dietary Guidelines'],
  
  daily: {
    calories: 2000,
    protein_min_g: 50,
    carbohydrates_g: 310,
    fat_max_g: 70,
    saturated_fat_max_g: 24,
    fiber_min_g: 25,
    sugar_max_g: 50,
    sodium_max_mg: 2000,
    potassium_min_mg: 3800,
  },
  
  serving: {
    sugar_max_g: 6,
    sodium_max_mg: 150,
    saturated_fat_max_g: 2.5,
  },
  
  childGuidelines: {
    calories: 1400,
    sugar_max_g: 25,
    sodium_max_mg: 900,
    protein_min_g: 19,
  },
  
  artificialAdditives: {
    colors: ['102', '104', '110', '122', '123', '124'],
    sweeteners: ['950', '951', '952', '954'],
    preservatives: ['200', '201', '202', '203'],
  },
  
  fortificationStandards: ['iron', 'iodine'],
};

// Country lookup map
const guidelinesByCountry: Record<CountryCode, NutritionGuidelines> = {
  IN: indiaGuidelines,
  US: usaGuidelines,
  CA: canadaGuidelines,
  AU: australiaGuidelines,
};

/**
 * Get guidelines for a specific country
 */
export function getCountryGuidelines(country: CountryCode): NutritionGuidelines {
  const guidelines = guidelinesByCountry[country];
  if (!guidelines) {
    throw new Error(`Unsupported country code: ${country}`);
  }
  return guidelines;
}

/**
 * Get all supported countries
 */
export function getSupportedCountries(): CountryCode[] {
  return Object.keys(guidelinesByCountry) as CountryCode[];
}

/**
 * Get country display name
 */
export function getCountryName(country: CountryCode): string {
  return getCountryGuidelines(country).countryName;
}

/**
 * Calculate daily intake contribution percentage
 */
export function calculateDailyIntakeContribution(
  country: CountryCode,
  nutrientValue: number,
  nutrientType: keyof NutritionGuidelines['daily']
): number {
  const guidelines = getCountryGuidelines(country);
  const dailyLimit = guidelines.daily[nutrientType];
  
  if (nutrientType.includes('min')) {
    // For minimum values, calculate as achieved percentage
    return (nutrientValue / dailyLimit) * 100;
  }
  
  // For maximum values, calculate as percentage of limit
  return (nutrientValue / dailyLimit) * 100;
}

/**
 * Check if nutrient value exceeds country-specific limit
 */
export function exceedsLimit(
  country: CountryCode,
  value: number,
  limitType: 'sugar' | 'sodium' | 'saturated_fat'
): boolean {
  const guidelines = getCountryGuidelines(country);
  const limit = guidelines.daily[`${limitType}_max_g` as keyof typeof guidelines.daily] ||
               guidelines.daily[`${limitType}_max_mg` as keyof typeof guidelines.daily];
  return value > (limit as number);
}
