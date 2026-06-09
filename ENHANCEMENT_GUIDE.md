# FoodScore Enhancement - Architecture & Integration Guide

## Overview

The FoodScore system has been upgraded with country-aware analysis, advanced scoring algorithms, and comprehensive ingredient intelligence. This guide explains the architecture and how to integrate these systems into your existing app.

## New Architecture Layers

### 1. Country Rules Engine (`src/lib/countryRules.ts`)

**Purpose**: Centralized nutrition guidelines for 4 countries (India, USA, Canada, Australia)

**Key Exports**:
```typescript
// Get guidelines for a country
const guidelines = getCountryGuidelines('US');
guidelines.daily.sugar_max_g // 50
guidelines.childGuidelines.sugar_max_g // 25

// Calculate daily intake percentage
const sugarPercentage = calculateDailyIntakeContribution('US', 12, 'sugar_max_g');
// Returns: 24% of daily limit

// Check if exceeds limit
const exceedsLimit = exceedsLimit('US', 2400, 'sodium');
```

**Why**: Different countries have different nutrition standards. This engine ensures recommendations are localized.

---

### 2. Ingredient Intelligence Engine (`src/lib/ingredientIntelligence.ts`)

**Purpose**: Risk assessment and regulatory analysis for individual ingredients

**Key Exports**:
```typescript
// Get ingredient info
const info = getIngredientInfo('aspartame');
// Returns: {
//   name: 'Aspartame',
//   riskLevel: 'Low Concern',
//   scientificConsensus: '...',
//   countryNotes: { US: '...', IN: '...', CA: '...', AU: '...' },
//   regulatory: { allowed_in: ['US', 'CA', ...], restricted_in: [] }
// }

// Analyze multiple ingredients
const analysis = analyzeIngredients(['sugar', 'aspartame', 'tartrazine'], 'US');
// Returns: {
//   totalIngredients: 3,
//   riskBreakdown: { Safe: 0, 'Low Concern': 1, 'Moderate Concern': 1, 'High Concern': 1 },
//   concerningIngredients: ['tartrazine'],
//   safeIngredients: ['aspartame'],
//   countryRestrictions: []
// }

// Get country-specific notes
const notes = getIngredientCountryNotes('tartrazine', 'AU');
// Returns: "FSANZ permits (additive 110); consumer advocacy against use in children's products."

// Check restrictions
const restricted = isIngredientRestricted('trans fat', 'US');
// Returns: true
```

**Why**: Not all ingredients are equal. This system provides scientific context and regulatory clarity per country.

---

### 3. Enhanced Scoring Engine (`src/lib/enhancedScoring.ts`)

**Purpose**: Country-aware 0-100 scoring with specialized health metrics

**Key Exports**:
```typescript
import { calculateEnhancedHealthScore } from '@/lib/enhancedScoring';

const score = calculateEnhancedHealthScore(product, 'US');
// Returns: {
//   score: 72, // 0-100
//   verdict: 'Good Choice',
//   breakdown: {
//     nutrition: 28,
//     ingredients: 18,
//     processing: 12,
//     positiveFactors: 14
//   },
//   topReasons: [
//     { title: 'Adequate Protein', description: '...', impact: 'positive', score: 8 },
//     { title: 'High Sugar Content', description: '...', impact: 'negative', score: -12 }
//   ],
//   childSuitability: 'Good',
//   weightLossFriendliness: 'Excellent',
//   diabetesFriendliness: 'Good',
//   bloodPressureFriendliness: 'Excellent',
//   dailyIntakeContribution: {
//     sugar: 24,        // % of daily limit
//     sodium: 18,
//     saturatedFat: 20,
//     protein: 85,
//     fiber: 40
//   },
//   dataConfidence: 'High Confidence',
//   summary: 'Offers good protein and decent fiber. However, high sugar content. Best consumed occasionally.',
//   country: 'US'
// }
```

**Score Breakdown (0-100)**:
- Nutrition: 0-40 points
- Ingredients: 0-30 points
- Processing: 0-15 points
- Positive Factors: 0-15 points

---

## Integration Steps

### Step 1: Add Country Selection to UI

Add a context/state for selected country:

```typescript
// src/lib/store.ts (or create new file)
import { create } from 'zustand';
import { CountryCode } from '@/types';

interface AppStore {
  selectedCountry: CountryCode;
  setSelectedCountry: (country: CountryCode) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  selectedCountry: 'US',
  setSelectedCountry: (country) => set({ selectedCountry: country }),
}));
```

### Step 2: Create Country Selector Component

```typescript
// src/components/features/CountrySelector.tsx
'use client';
import { getSupportedCountries, getCountryName } from '@/lib/countryRules';
import { useAppStore } from '@/lib/store';

export function CountrySelector() {
  const { selectedCountry, setSelectedCountry } = useAppStore();
  const countries = getSupportedCountries();

  return (
    <div className="flex gap-2">
      {countries.map((country) => (
        <button
          key={country}
          onClick={() => setSelectedCountry(country)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedCountry === country
              ? 'bg-emerald-600 text-white'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white hover:bg-zinc-200'
          }`}
        >
          {getCountryName(country)}
        </button>
      ))}
    </div>
  );
}
```

### Step 3: Update Product Page to Use Enhanced Scoring

```typescript
// src/app/product/[barcode]/page.tsx
import { calculateEnhancedHealthScore } from '@/lib/enhancedScoring';
import { useAppStore } from '@/lib/store';

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductByBarcode(params.barcode);
  if (!product) notFound();

  // Get selected country (in real app, pass from client or use header)
  const selectedCountry = 'US'; // In real app: from user selection

  const enhancedScore = calculateEnhancedHealthScore(product, selectedCountry);

  return (
    <div>
      {/* Display new score */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">
              {enhancedScore.score}/100
            </h2>
            <p className="text-lg font-semibold text-emerald-600">
              {enhancedScore.verdict}
            </p>
          </div>
        </div>

        {/* Data Confidence */}
        <p className="text-sm text-zinc-500">
          Confidence: {enhancedScore.dataConfidence}
        </p>
      </div>

      {/* Top 3 Reasons */}
      <div className="glass rounded-2xl p-6 mt-6">
        <h3 className="font-bold mb-4">Why This Score?</h3>
        <div className="space-y-3">
          {enhancedScore.topReasons.map((reason, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg ${
                reason.impact === 'positive'
                  ? 'bg-emerald-50 dark:bg-emerald-900/20'
                  : 'bg-red-50 dark:bg-red-900/20'
              }`}
            >
              <p className="font-semibold text-sm">{reason.title}</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                {reason.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Intake Contribution */}
      <div className="glass rounded-2xl p-6 mt-6">
        <h3 className="font-bold mb-4">Daily Intake Contribution</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-zinc-500">Sugar</p>
            <p className="text-lg font-bold">
              {enhancedScore.dailyIntakeContribution.sugar.toFixed(0)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Sodium</p>
            <p className="text-lg font-bold">
              {enhancedScore.dailyIntakeContribution.sodium.toFixed(0)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Saturated Fat</p>
            <p className="text-lg font-bold">
              {enhancedScore.dailyIntakeContribution.saturatedFat.toFixed(0)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Protein</p>
            <p className="text-lg font-bold">
              {enhancedScore.dailyIntakeContribution.protein.toFixed(0)}%
            </p>
          </div>
        </div>
      </div>

      {/* Specialized Health Scores */}
      <div className="glass rounded-2xl p-6 mt-6">
        <h3 className="font-bold mb-4">Specialized Health Scores</h3>
        <div className="grid grid-cols-2 gap-4">
          <HealthScoreCard
            label="For Children"
            score={enhancedScore.childSuitability}
          />
          <HealthScoreCard
            label="Weight Loss"
            score={enhancedScore.weightLossFriendliness}
          />
          <HealthScoreCard
            label="Diabetes"
            score={enhancedScore.diabetesFriendliness}
          />
          <HealthScoreCard
            label="Blood Pressure"
            score={enhancedScore.bloodPressureFriendliness}
          />
        </div>
      </div>

      {/* AI Summary */}
      <div className="glass rounded-2xl p-6 mt-6">
        <h3 className="font-bold mb-2">Summary</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {enhancedScore.summary}
        </p>
      </div>

      {/* Score Breakdown */}
      <div className="glass rounded-2xl p-6 mt-6">
        <h3 className="font-bold mb-4">Score Breakdown</h3>
        <div className="space-y-3">
          <ScoreBar
            label="Nutrition"
            score={enhancedScore.breakdown.nutrition}
            max={enhancedScore.maxScores.nutrition}
          />
          <ScoreBar
            label="Ingredients"
            score={enhancedScore.breakdown.ingredients}
            max={enhancedScore.maxScores.ingredients}
          />
          <ScoreBar
            label="Processing"
            score={enhancedScore.breakdown.processing}
            max={enhancedScore.maxScores.processing}
          />
          <ScoreBar
            label="Positive Factors"
            score={enhancedScore.breakdown.positiveFactors}
            max={enhancedScore.maxScores.positiveFactors}
          />
        </div>
      </div>
    </div>
  );
}
```

### Step 4: Ingredient Analysis Section

```typescript
// Display ingredient intelligence
<div className="glass rounded-2xl p-6">
  <h3 className="font-bold mb-4">Ingredient Analysis</h3>
  {product.ingredients && (
    <div className="space-y-3">
      {product.ingredients.split(/[,;•]/).map((ingredient) => {
        const info = getIngredientInfo(ingredient);
        return (
          <div key={ingredient} className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800">
            <p className="font-semibold text-sm">{ingredient}</p>
            {info && (
              <>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                  Risk: {info.riskLevel}
                </p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  {info.countryNotes[selectedCountry]}
                </p>
              </>
            )}
          </div>
        );
      })}
    </div>
  )}
</div>
```

---

## Country Guidelines Reference

### India (IN)
- **Authority**: FSSAI, ICMR
- **Daily Sugar Limit**: 50g
- **Daily Sodium Limit**: 2300mg
- **Key Focus**: Fortification standards, child-specific guidelines

### USA (US)
- **Authority**: FDA, USDA, Dietary Guidelines
- **Daily Sugar Limit**: 50g
- **Daily Sodium Limit**: 2300mg
- **Key Focus**: Artificial additives, nutrition labeling

### Canada (CA)
- **Authority**: Health Canada
- **Daily Sugar Limit**: 50g
- **Daily Sodium Limit**: 2300mg
- **Key Focus**: Food safety, nutrition standards

### Australia (AU)
- **Authority**: FSANZ, NHMRC
- **Daily Sugar Limit**: 50g
- **Daily Sodium Limit**: 2000mg (stricter)
- **Key Focus**: Additive numbering system, labeling

---

## Extending the System

### Adding a New Country

1. **Update `countryRules.ts`**:
```typescript
export const newCountryGuidelines: NutritionGuidelines = {
  country: 'XX',
  countryName: 'Country Name',
  references: ['Reference 1', 'Reference 2'],
  daily: { /* guidelines */ },
  // ... rest of structure
};

// Add to guidelinesByCountry map
const guidelinesByCountry: Record<CountryCode, NutritionGuidelines> = {
  // ... existing
  XX: newCountryGuidelines,
};

// Update CountryCode type in types/index.ts
export type CountryCode = 'IN' | 'US' | 'CA' | 'AU' | 'XX';
```

2. **Update ingredient database in `ingredientIntelligence.ts`**:
```typescript
countryNotes: {
  IN: '...',
  US: '...',
  CA: '...',
  AU: '...',
  XX: '...new country notes...',  // Add this
},
regulatory: {
  allowed_in: ['IN', 'US', 'CA', 'AU', 'XX'],  // Add here
  restricted_in: [],
},
```

### Adding Specialized Health Metrics

1. Create new calculation function in `enhancedScoring.ts`
2. Add to `EnhancedHealthScore` interface
3. Call in `calculateEnhancedHealthScore()`
4. Display in product page UI

---

## API Usage Examples

### Client Component
```typescript
'use client';
import { useAppStore } from '@/lib/store';
import { calculateEnhancedHealthScore } from '@/lib/enhancedScoring';
import { FoodProduct } from '@/types';

export function ProductAnalysis({ product }: { product: FoodProduct }) {
  const selectedCountry = useAppStore((state) => state.selectedCountry);
  const score = calculateEnhancedHealthScore(product, selectedCountry);

  return (
    <div>
      <h2>Score: {score.score}/100</h2>
      <p>Verdict: {score.verdict}</p>
      <p>Summary: {score.summary}</p>
    </div>
  );
}
```

---

## Files Modified/Created

### Created:
- `src/lib/countryRules.ts` - Country nutrition guidelines
- `src/lib/ingredientIntelligence.ts` - Ingredient risk assessment
- `src/lib/enhancedScoring.ts` - Enhanced scoring engine

### Modified:
- `src/types/index.ts` - Added CountryCode type

### To Create:
- `src/components/features/CountrySelector.tsx` - Country selection UI
- Update `src/app/product/[barcode]/page.tsx` - Display new metrics

---

## Next Steps

1. Create country selector component
2. Add country selection to Navbar
3. Update product page to use enhanced scoring
4. Create ingredient intelligence UI components
5. Add specialized health score displays
6. Test with various products across countries
7. Gather user feedback on new metrics

This architecture is designed for easy expansion—new countries can be added without modifying the scoring logic.
