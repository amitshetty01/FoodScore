export interface NutritionFacts {
  energy_kcal?: number;
  proteins?: number;
  carbohydrates?: number;
  sugars?: number;
  fat?: number;
  saturated_fat?: number;
  fiber?: number;
  sodium?: number;
  salt?: number;
}

export interface FoodProduct {
  barcode: string;
  name: string;
  brand?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  ingredients?: string;
  ingredientTags?: string[];
  ingredientAnalysisTags?: string[];
  allergens?: string[];
  additives?: string[];
  labels?: string[];
  categories?: string[];
  nutriments: NutritionFacts;
  nutriScore?: string;
  novaGroup?: number;
  quantity?: string;
  servingSize?: string;
  countries?: string;
}

export interface ScoreBreakdown {
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  points: number;
  explanation: string;
}

export interface HealthScore {
  total: number;
  breakdown: ScoreBreakdown[];
  summary: string;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  strengths: string[];
  weaknesses: string[];
}

export interface ProductWithScore {
  product: FoodProduct;
  score: HealthScore;
}

export interface SearchResult {
  barcode: string;
  name: string;
  brand?: string;
  imageUrl?: string;
  score?: number;
  grade?: string;
}

export type CountryCode = 'IN' | 'US' | 'CA' | 'AU';

export type ConfidenceRating = 'High Confidence' | 'Medium Confidence' | 'Low Confidence';

export interface ImageAnalysisResult {
  productName?: string;
  brandName?: string;
  servingSize?: string;
  nutritionFacts: NutritionFacts;
  ingredients?: string;
  extractedText: string;
  healthScore: number;
  verdict: string;
  confidence: ConfidenceRating;
  topReasons: string[];
  notes: string[];
}

export interface AdminStats {
  totalUsers: number;
  totalSearches: number;
  totalFavorites: number;
  totalCachedProducts: number;
  recentUsers: {
    id: string;
    name: string | null;
    email: string | null;
    createdAt: Date;
    role: string;
  }[];
  topSearches: {
    query: string;
    count: number;
  }[];
}
