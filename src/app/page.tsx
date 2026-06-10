import { SearchBar } from '@/components/features/SearchBar';
import { Scan, TrendingUp, ShieldCheck, Zap } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const features = [
    { icon: <Zap className="text-amber-500" size={20} />, title: 'Instant Scores', desc: 'Get a health score from 1-10 based on nutritional content and ingredients.' },
    { icon: <Scan className="text-blue-500" size={20} />, title: 'Barcode Scanner', desc: 'Scan any barcode with your camera to instantly look up a product.' },
    { icon: <ShieldCheck className="text-emerald-500" size={20} />, title: 'Transparent Ratings', desc: 'See exactly why a product scored what it did with a full breakdown.' },
    { icon: <TrendingUp className="text-violet-500" size={20} />, title: 'Healthier Alternatives', desc: 'Discover better options for every product you scan.' },
  ];

  const popularSearches = ['Coca Cola', 'Greek Yogurt', 'Almonds', 'Oat Milk', 'Protein Bar', 'Olive Oil'];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-400/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-teal-400/10 rounded-full blur-2xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Comprehensive Food Database
          </div>

          <h1 className="font-syne font-extrabold text-5xl sm:text-6xl lg:text-7xl text-zinc-900 dark:text-white leading-[1.05] mb-6">
            Know exactly{' '}
            <span className="gradient-text">what you eat</span>
          </h1>

          <p className="text-lg sm:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Search any food product and get an instant health score from 1 to 10, with detailed nutritional analysis and healthier alternatives.
          </p>

          <div className="flex justify-center mb-6">
            <SearchBar size="large" />
          </div>

          {/* Popular searches */}
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="text-xs text-zinc-400 self-center">Try:</span>
            {popularSearches.map(s => (
              <Link key={s} href={`/search?q=${encodeURIComponent(s)}`}
                className="text-xs font-medium px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white transition-all">
                {s}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Scan CTA */}
      <section className="px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          <Link href="/scan" className="flex items-center justify-between glass rounded-2xl p-5 group hover:shadow-lg transition-all hover:-translate-y-0.5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Scan className="text-white" size={22} />
              </div>
              <div>
                <h3 className="font-syne font-bold text-zinc-900 dark:text-white">Scan a Barcode</h3>
                <p className="text-sm text-zinc-500">Use your camera to scan any product instantly</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
              <span className="text-zinc-400 group-hover:text-emerald-500 transition-colors text-lg leading-none">→</span>
            </div>
          </Link>
        </div>
      </section>

      {/* Features grid */}
      <section className="px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-syne font-bold text-2xl text-zinc-900 dark:text-white mb-6 text-center">
            Why FoodScore?
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((f, i) => (
              <div key={i} className="glass rounded-2xl p-5 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center mb-3">
                  {f.icon}
                </div>
                <h3 className="font-syne font-bold text-zinc-900 dark:text-white mb-1">{f.title}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ad placeholder */}
      <section className="px-4 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-2xl p-4 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-700">
            Advertisement space — Google AdSense
          </div>
        </div>
      </section>
    </div>
  );
}
