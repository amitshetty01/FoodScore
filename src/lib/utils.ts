import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getScoreColor(score: number): string {
  if (score >= 8) return 'text-emerald-500';
  if (score >= 6.5) return 'text-green-500';
  if (score >= 5) return 'text-yellow-500';
  if (score >= 3.5) return 'text-orange-500';
  return 'text-red-500';
}

export function getScoreBg(score: number): string {
  if (score >= 8) return 'bg-emerald-500';
  if (score >= 6.5) return 'bg-green-500';
  if (score >= 5) return 'bg-yellow-500';
  if (score >= 3.5) return 'bg-orange-500';
  return 'bg-red-500';
}

export function getGradeColor(grade: string): string {
  switch (grade) {
    case 'A': return 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-white';
    case 'B': return 'bg-green-600 text-white dark:bg-green-500 dark:text-white';
    case 'C': return 'bg-yellow-500 text-white dark:bg-yellow-400 dark:text-zinc-900';
    case 'D': return 'bg-orange-500 text-white dark:bg-orange-400 dark:text-white';
    case 'F': return 'bg-red-600 text-white dark:bg-red-500 dark:text-white';
    default: return 'bg-zinc-400 text-white';
  }
}

export function formatNutrient(value?: number, unit = 'g', decimals = 1): string {
  if (value === undefined || value === null) return 'N/A';
  return `${value.toFixed(decimals)}${unit}`;
}

export function getNutriScoreColor(grade?: string): string {
  switch (grade?.toLowerCase()) {
    case 'a': return 'bg-[#038141] text-white';
    case 'b': return 'bg-[#85BB2F] text-white';
    case 'c': return 'bg-[#FECB02] text-zinc-900';
    case 'd': return 'bg-[#EE8100] text-white';
    case 'e': return 'bg-[#E63E11] text-white';
    default: return 'bg-gray-400 text-white';
  }
}

const harmfulIngredientPatterns = [
  /palm|high[- ]fructose|corn[- ]syrup|sugar|salt|monosodium|glutamate|hydrogenated|partially hydrogenated|artificial|preservative|colour|color|flavour|flavor|sweetener|stabilizer|emulsifier|bht|bha|nitrite|sulfite/i,
];
const goodIngredientPatterns = [
  /organic|whole|whole grain|whole wheat|fruit|vegetable|olive oil|almond|nut|seed|yogurt|milk|water|honey|oat|bean|rice|legume|chicken|fish/i,
];

export function normalizeIngredientTag(tag: string): string {
  return tag.replace(/^en:/, '').replace(/-/g, ' ').toLowerCase();
}

export function classifyIngredient(
  ingredient: string,
  ingredientTags?: string[],
  additives?: string[],
  allergens?: string[],
  analysisTags?: string[]
): 'good' | 'harmful' | 'neutral' {
  const normalized = ingredient.toLowerCase();
  const normalizedTags = (ingredientTags || []).map(normalizeIngredientTag);
  const normalizedAnalysisTags = (analysisTags || []).map(normalizeIngredientTag);
  if ((additives || []).some(a => normalized.includes(a.toLowerCase()))) return 'harmful';
  if ((allergens || []).some(a => normalized.includes(a.toLowerCase()))) return 'harmful';
  if (normalizedTags.some(tag => harmfulIngredientPatterns.some(rx => rx.test(tag)))) return 'harmful';
  if (normalizedAnalysisTags.some(tag => harmfulIngredientPatterns.some(rx => rx.test(tag)))) return 'harmful';
  if (normalizedTags.some(tag => goodIngredientPatterns.some(rx => rx.test(tag)))) return 'good';
  if (normalizedAnalysisTags.some(tag => goodIngredientPatterns.some(rx => rx.test(tag)))) return 'good';
  if (harmfulIngredientPatterns.some(rx => rx.test(normalized))) return 'harmful';
  if (goodIngredientPatterns.some(rx => rx.test(normalized))) return 'good';
  return 'neutral';
}

export function getIngredientBadgeClass(status: 'good' | 'harmful' | 'neutral'): string {
  switch (status) {
    case 'good':
      return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800/50';
    case 'harmful':
      return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-100 dark:border-red-800/50';
    default:
      return 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800';
  }
}
