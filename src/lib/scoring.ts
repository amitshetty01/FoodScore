import { FoodProduct, HealthScore, ScoreBreakdown } from '@/types';

// Harmful additives list (E-numbers)
const HARMFUL_ADDITIVES = [
  'e102', 'e104', 'e110', 'e122', 'e124', 'e129', // Artificial colors
  'e211', 'e212', 'e213', // Benzoate preservatives
  'e249', 'e250', 'e251', 'e252', // Nitrites/nitrates
  'e320', 'e321', // BHA, BHT
  'e621', 'e627', 'e631', // MSG and flavor enhancers
  'e951', 'e952', 'e954', // Artificial sweeteners
];

export function calculateHealthScore(product: FoodProduct): HealthScore {
  const breakdown: ScoreBreakdown[] = [];
  let score = 5; // Start at 5/10

  const n = product.nutriments;

  // --- SUGAR ---
  if (n.sugars !== undefined) {
    if (n.sugars > 22.5) {
      const pts = -2.5;
      score += pts;
      breakdown.push({ factor: 'Sugar', impact: 'negative', points: pts, explanation: `Very high sugar content (${n.sugars.toFixed(1)}g/100g). Excess sugar contributes to obesity, diabetes, and dental issues.` });
    } else if (n.sugars > 12) {
      const pts = -1.5;
      score += pts;
      breakdown.push({ factor: 'Sugar', impact: 'negative', points: pts, explanation: `High sugar content (${n.sugars.toFixed(1)}g/100g). Consider reducing intake of sugary foods.` });
    } else if (n.sugars > 5) {
      const pts = -0.5;
      score += pts;
      breakdown.push({ factor: 'Sugar', impact: 'negative', points: pts, explanation: `Moderate sugar content (${n.sugars.toFixed(1)}g/100g).` });
    } else {
      const pts = 0.5;
      score += pts;
      breakdown.push({ factor: 'Sugar', impact: 'positive', points: pts, explanation: `Low sugar content (${n.sugars.toFixed(1)}g/100g). Good choice for blood sugar management.` });
    }
  }

  // --- SODIUM ---
  const sodium = n.sodium ?? (n.salt ? n.salt / 2.5 : undefined);
  if (sodium !== undefined) {
    if (sodium > 1.5) {
      const pts = -2;
      score += pts;
      breakdown.push({ factor: 'Sodium', impact: 'negative', points: pts, explanation: `Very high sodium content (${(sodium * 1000).toFixed(0)}mg/100g). Excess sodium raises blood pressure and cardiovascular risk.` });
    } else if (sodium > 0.6) {
      const pts = -1;
      score += pts;
      breakdown.push({ factor: 'Sodium', impact: 'negative', points: pts, explanation: `High sodium content (${(sodium * 1000).toFixed(0)}mg/100g). Monitor daily intake.` });
    } else if (sodium < 0.1) {
      const pts = 0.5;
      score += pts;
      breakdown.push({ factor: 'Sodium', impact: 'positive', points: pts, explanation: `Low sodium content (${(sodium * 1000).toFixed(0)}mg/100g). Heart-friendly choice.` });
    }
  }

  // --- SATURATED FAT ---
  if (n.saturated_fat !== undefined) {
    if (n.saturated_fat > 10) {
      const pts = -2;
      score += pts;
      breakdown.push({ factor: 'Saturated Fat', impact: 'negative', points: pts, explanation: `Very high saturated fat (${n.saturated_fat.toFixed(1)}g/100g). Increases LDL cholesterol and heart disease risk.` });
    } else if (n.saturated_fat > 5) {
      const pts = -1;
      score += pts;
      breakdown.push({ factor: 'Saturated Fat', impact: 'negative', points: pts, explanation: `High saturated fat (${n.saturated_fat.toFixed(1)}g/100g). Consume in moderation.` });
    } else if (n.saturated_fat < 1.5) {
      const pts = 0.5;
      score += pts;
      breakdown.push({ factor: 'Saturated Fat', impact: 'positive', points: pts, explanation: `Low saturated fat (${n.saturated_fat.toFixed(1)}g/100g). Good for heart health.` });
    }
  }

  // --- PROTEIN ---
  if (n.proteins !== undefined) {
    if (n.proteins >= 20) {
      const pts = 2;
      score += pts;
      breakdown.push({ factor: 'Protein', impact: 'positive', points: pts, explanation: `Excellent protein content (${n.proteins.toFixed(1)}g/100g). Supports muscle growth and satiety.` });
    } else if (n.proteins >= 10) {
      const pts = 1;
      score += pts;
      breakdown.push({ factor: 'Protein', impact: 'positive', points: pts, explanation: `Good protein content (${n.proteins.toFixed(1)}g/100g). Contributes to daily protein goals.` });
    } else if (n.proteins < 2) {
      const pts = -0.3;
      score += pts;
      breakdown.push({ factor: 'Protein', impact: 'negative', points: pts, explanation: `Low protein content (${n.proteins.toFixed(1)}g/100g).` });
    }
  }

  // --- FIBER ---
  if (n.fiber !== undefined) {
    if (n.fiber >= 6) {
      const pts = 1.5;
      score += pts;
      breakdown.push({ factor: 'Fiber', impact: 'positive', points: pts, explanation: `High fiber content (${n.fiber.toFixed(1)}g/100g). Excellent for digestive health and cholesterol management.` });
    } else if (n.fiber >= 3) {
      const pts = 0.8;
      score += pts;
      breakdown.push({ factor: 'Fiber', impact: 'positive', points: pts, explanation: `Good fiber content (${n.fiber.toFixed(1)}g/100g). Supports gut health.` });
    } else if (n.fiber < 1 && n.fiber >= 0) {
      const pts = -0.3;
      score += pts;
      breakdown.push({ factor: 'Fiber', impact: 'negative', points: pts, explanation: `Very low fiber content (${n.fiber.toFixed(1)}g/100g).` });
    }
  }

  // --- ARTIFICIAL ADDITIVES ---
  if (product.additives && product.additives.length > 0) {
    const harmfulCount = product.additives.filter(a =>
      HARMFUL_ADDITIVES.includes(a.toLowerCase())
    ).length;

    if (harmfulCount > 0) {
      const pts = Math.max(-2, -(harmfulCount * 0.7));
      score += pts;
      breakdown.push({
        factor: 'Artificial Additives',
        impact: 'negative',
        points: pts,
        explanation: `Contains ${harmfulCount} potentially harmful additive(s): ${product.additives.slice(0, 3).join(', ')}. Some artificial additives are linked to hyperactivity and allergic reactions.`,
      });
    } else if (product.additives.length > 5) {
      const pts = -0.5;
      score += pts;
      breakdown.push({ factor: 'Additives', impact: 'negative', points: pts, explanation: `Contains ${product.additives.length} additives. High additive count can indicate heavily processed food.` });
    }
  }

  // --- NOVA GROUP (processing level) ---
  if (product.novaGroup) {
    if (product.novaGroup === 4) {
      const pts = -1;
      score += pts;
      breakdown.push({ factor: 'Processing Level', impact: 'negative', points: pts, explanation: 'Ultra-processed food (NOVA Group 4). Highly processed foods are linked to poor health outcomes.' });
    } else if (product.novaGroup === 1) {
      const pts = 1;
      score += pts;
      breakdown.push({ factor: 'Processing Level', impact: 'positive', points: pts, explanation: 'Unprocessed/minimally processed food (NOVA Group 1). Best choice for overall health.' });
    }
  }

  // --- LABELS BONUS ---
  const goodLabels = ['organic', 'bio', 'fair-trade', 'whole-grain', 'no-artificial-colors', 'no-preservatives'];
  const matchedLabels = (product.labels || []).filter(l =>
    goodLabels.some(gl => l.toLowerCase().includes(gl))
  );
  if (matchedLabels.length > 0) {
    const pts = Math.min(0.5, matchedLabels.length * 0.25);
    score += pts;
    breakdown.push({ factor: 'Quality Labels', impact: 'positive', points: pts, explanation: `Has positive labels: ${matchedLabels.slice(0, 3).join(', ')}.` });
  }

  // Clamp to 1-10
  score = Math.max(1, Math.min(10, score));
  const finalScore = Math.round(score * 10) / 10;

  const strengths = breakdown.filter(b => b.impact === 'positive').map(b => b.factor);
  const weaknesses = breakdown.filter(b => b.impact === 'negative').map(b => b.factor);

  return {
    total: finalScore,
    breakdown,
    summary: getSummary(finalScore, strengths, weaknesses),
    grade: getGrade(finalScore),
    strengths,
    weaknesses,
  };
}

function getGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 8) return 'A';
  if (score >= 6.5) return 'B';
  if (score >= 5) return 'C';
  if (score >= 3.5) return 'D';
  return 'F';
}

function getSummary(score: number, strengths: string[], weaknesses: string[]): string {
  if (score >= 8) {
    return `Excellent nutritional profile! ${strengths.length > 0 ? `This product scores well on ${strengths.join(', ')}.` : ''} A great choice for a balanced diet.`;
  }
  if (score >= 6.5) {
    return `Good nutritional profile with some areas to watch. ${weaknesses.length > 0 ? `Be mindful of ${weaknesses.join(', ')}.` : ''} Suitable for regular consumption in moderation.`;
  }
  if (score >= 5) {
    return `Average nutritional profile. ${weaknesses.length > 0 ? `This product has concerns around ${weaknesses.join(', ')}.` : ''} Consider limiting intake or finding healthier alternatives.`;
  }
  if (score >= 3.5) {
    return `Below average nutritional profile. ${weaknesses.length > 0 ? `Notable concerns include ${weaknesses.join(', ')}.` : ''} Consume sparingly and consider healthier alternatives.`;
  }
  return `Poor nutritional profile. This product has multiple concerning nutritional factors including ${weaknesses.slice(0, 3).join(', ')}. We recommend seeking healthier alternatives.`;
}
