import { HealthScore, NutritionFacts } from '@/types';
import { TrendingUp, TrendingDown, Minus, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatNutrient } from '@/lib/utils';
import { ScoreRing } from './ScoreRing';

interface NutritionPanelProps {
  score: HealthScore;
  nutriments: NutritionFacts;
}

export function NutritionPanel({ score, nutriments }: NutritionPanelProps) {
  const nutrients = [
    { label: 'Energy', value: nutriments.energy_kcal, unit: 'kcal', type: 'neutral' },
    { label: 'Protein', value: nutriments.proteins, unit: 'g', type: 'positive' },
    { label: 'Carbohydrates', value: nutriments.carbohydrates, unit: 'g', type: 'neutral' },
    { label: 'of which Sugars', value: nutriments.sugars, unit: 'g', type: 'negative', indent: true },
    { label: 'Fat', value: nutriments.fat, unit: 'g', type: 'neutral' },
    { label: 'Saturated Fat', value: nutriments.saturated_fat, unit: 'g', type: 'negative', indent: true },
    { label: 'Fiber', value: nutriments.fiber, unit: 'g', type: 'positive' },
    { label: 'Sodium', value: nutriments.sodium, unit: 'g', type: 'negative' },
    { label: 'Salt', value: nutriments.salt, unit: 'g', type: 'negative' },
  ].filter(n => n.value !== undefined);

  return (
    <div className="space-y-6">
      {/* Score overview */}
      <div className="glass rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
        <ScoreRing score={score.total} size={140} strokeWidth={12} grade={score.grade} />
        <div className="flex-1 text-center sm:text-left">
          <h2 className="font-syne font-bold text-xl text-zinc-900 dark:text-white mb-2">Health Score</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{score.summary}</p>
          <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
            {score.strengths.slice(0, 3).map(s => (
              <span key={s} className="inline-flex items-center gap-1 text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded-full">
                <CheckCircle2 size={11} /> {s}
              </span>
            ))}
            {score.weaknesses.slice(0, 3).map(w => (
              <span key={w} className="inline-flex items-center gap-1 text-xs bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-2 py-1 rounded-full">
                <AlertCircle size={11} /> {w}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Score breakdown */}
      <div className="glass rounded-2xl p-6">
        <h3 className="font-syne font-bold text-zinc-900 dark:text-white mb-4">Score Breakdown</h3>
        <div className="space-y-3">
          {score.breakdown.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                item.impact === 'positive' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                item.impact === 'negative' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-zinc-100 dark:bg-zinc-800'
              }`}>
                {item.impact === 'positive' ? <TrendingUp size={12} className="text-emerald-600" /> :
                 item.impact === 'negative' ? <TrendingDown size={12} className="text-red-500" /> :
                 <Minus size={12} className="text-zinc-400" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{item.factor}</span>
                  <span className={`text-xs font-bold ${
                    item.points > 0 ? 'text-emerald-600' : item.points < 0 ? 'text-red-500' : 'text-zinc-400'
                  }`}>
                    {item.points > 0 ? '+' : ''}{item.points.toFixed(1)}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">{item.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nutrition table */}
      <div className="glass rounded-2xl p-6">
        <h3 className="font-syne font-bold text-zinc-900 dark:text-white mb-4">Nutrition Facts <span className="text-sm font-normal text-zinc-400">per 100g</span></h3>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {nutrients.map(n => (
            <div key={n.label} className={`flex justify-between items-center py-2.5 ${n.indent ? 'pl-4' : ''}`}>
              <span className={`text-sm ${n.indent ? 'text-zinc-500 dark:text-zinc-400' : 'text-zinc-700 dark:text-zinc-300 font-medium'}`}>
                {n.label}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {formatNutrient(n.value, n.unit === 'kcal' ? ' kcal' : `g`)}
                </span>
                {n.type !== 'neutral' && n.value !== undefined && (
                  <div className={`w-1.5 h-1.5 rounded-full ${n.type === 'positive' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
