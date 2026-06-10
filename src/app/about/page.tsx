import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Zap, BarChart2, Search } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About — FoodScore',
  description: 'Learn how FoodScore calculates health scores for food products.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="font-syne font-extrabold text-4xl sm:text-5xl text-zinc-900 dark:text-white mb-4">
            About <span className="gradient-text">FoodScore</span>
          </h1>
          <p className="text-lg text-zinc-500 leading-relaxed max-w-xl mx-auto">
            We believe everyone deserves to know what's really in their food — without needing a nutrition degree.
          </p>
        </div>

        {/* Mission */}
        <div className="glass rounded-3xl p-8 mb-8">
          <h2 className="font-syne font-bold text-2xl text-zinc-900 dark:text-white mb-4">Our Mission</h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
            FoodScore makes nutritional information accessible and actionable. We take the complex world of nutrition labels and translate it into a simple, honest score from 1 to 10.
          </p>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            We aggregate nutritional data from public sources to provide comprehensive health scores and dietary insights.
          </p>
        </div>

        {/* How scoring works */}
        <div className="glass rounded-3xl p-8 mb-8">
          <h2 className="font-syne font-bold text-2xl text-zinc-900 dark:text-white mb-6">How Scoring Works</h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
            Every product starts at 5/10. Our algorithm then adjusts the score based on key nutritional factors per 100g:
          </p>
          <div className="space-y-4">
            {[
              { factor: 'Sugar', impact: 'negative', desc: 'High sugar intake is linked to obesity, type 2 diabetes, and tooth decay. We penalise products with >12g/100g and reward low-sugar options.' },
              { factor: 'Sodium', impact: 'negative', desc: 'Excess sodium raises blood pressure. Products with >600mg/100g receive a score penalty.' },
              { factor: 'Saturated Fat', impact: 'negative', desc: 'High saturated fat increases LDL cholesterol. Products above 5g/100g are penalised.' },
              { factor: 'Protein', impact: 'positive', desc: 'Protein supports muscle, satiety and metabolic health. High-protein foods (≥10g/100g) are rewarded.' },
              { factor: 'Fibre', impact: 'positive', desc: 'Dietary fibre supports digestion and heart health. We reward foods with ≥3g/100g.' },
              { factor: 'Additives', impact: 'negative', desc: 'Certain artificial additives (e.g. artificial colours, nitrites, BHA/BHT) are linked to health concerns and reduce the score.' },
              { factor: 'Processing Level', impact: 'mixed', desc: 'Using the NOVA classification, ultra-processed foods (Group 4) are penalised while unprocessed foods (Group 1) are rewarded.' },
            ].map(item => (
              <div key={item.factor} className="flex gap-4">
                <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                  item.impact === 'positive' ? 'bg-emerald-400' :
                  item.impact === 'negative' ? 'bg-red-400' : 'bg-amber-400'
                }`} style={{ marginTop: '8px' }} />
                <div>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{item.factor}: </span>
                  <span className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grade table */}
        <div className="glass rounded-3xl p-8 mb-8">
          <h2 className="font-syne font-bold text-2xl text-zinc-900 dark:text-white mb-6">Grade Scale</h2>
          <div className="grid grid-cols-5 gap-3">
            {[
              { grade: 'A', range: '8.5–10', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300', desc: 'Excellent' },
              { grade: 'B', range: '7.0–8.4', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300', desc: 'Good' },
              { grade: 'C', range: '5.5–6.9', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300', desc: 'Average' },
              { grade: 'D', range: '4.0–5.4', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300', desc: 'Below Average' },
              { grade: 'E', range: '0–3.9', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300', desc: 'Poor' },
            ].map(g => (
              <div key={g.grade} className={`rounded-2xl p-4 text-center ${g.color}`}>
                <div className="font-syne font-black text-3xl mb-1">{g.grade}</div>
                <div className="text-xs font-semibold">{g.range}</div>
                <div className="text-xs mt-0.5 opacity-80">{g.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="glass rounded-3xl p-8 mb-12">
          <h2 className="font-syne font-bold text-2xl text-zinc-900 dark:text-white mb-6">Features</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {[
              { icon: <Search className="text-emerald-500" size={20} />, title: 'Search 3M+ Products', desc: 'Find any product by name, brand, or barcode.' },
              { icon: <Zap className="text-amber-500" size={20} />, title: 'Instant Scoring', desc: 'Real-time health scores with full breakdowns.' },
              { icon: <BarChart2 className="text-blue-500" size={20} />, title: 'Nutrition Details', desc: 'Full macro and micronutrient breakdown per 100g.' },
              { icon: <Shield className="text-violet-500" size={20} />, title: 'Allergen Alerts', desc: 'Clear allergen and additive information.' },
            ].map(f => (
              <div key={f.title} className="flex gap-3">
                <div className="w-9 h-9 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center shrink-0">{f.icon}</div>
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-white text-sm">{f.title}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/search"
            className="inline-flex items-center gap-2 h-12 px-8 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-2xl hover:opacity-90 transition-opacity shadow-lg shadow-emerald-500/20 text-sm">
            Start Searching →
          </Link>
          <p className="text-xs text-zinc-400 mt-3">Free forever · No account required to search</p>
        </div>
      </div>
    </div>
  );
}
