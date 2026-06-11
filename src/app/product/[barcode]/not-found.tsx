import Link from 'next/link';
import { SearchX, Scan, ImagePlus, Search, HelpCircle } from 'lucide-react';

export default function ProductNotFound() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
      <div className="text-center max-w-lg">
        <div className="w-20 h-20 rounded-3xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-6 border border-amber-200 dark:border-amber-800">
          <SearchX size={36} className="text-amber-500" />
        </div>
        <h1 className="font-syne font-extrabold text-3xl text-zinc-900 dark:text-white mb-3">
          Product Not Found
        </h1>
        <p className="text-zinc-500 leading-relaxed mb-2">
          We couldn&apos;t find this product in our database. It may not have been added to Open Food Facts yet, or the barcode may be incorrect.
        </p>
        <p className="text-sm text-zinc-400 mb-8">
          You can help by uploading product images for analysis, or try one of these options:
        </p>

        {/* Options */}
        <div className="grid gap-3 mb-8 text-left">
          <Link href="/search"
            className="flex items-center gap-4 p-4 glass rounded-2xl hover:shadow-md transition-all group">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
              <Search size={18} className="text-emerald-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-zinc-900 dark:text-white text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Search by Name</p>
              <p className="text-xs text-zinc-500">Try searching for the product by name or brand instead.</p>
            </div>
            <span className="text-zinc-400 group-hover:text-emerald-500 transition-colors text-lg">→</span>
          </Link>

          <Link href="/scan"
            className="flex items-center gap-4 p-4 glass rounded-2xl hover:shadow-md transition-all group">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
              <Scan size={18} className="text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-zinc-900 dark:text-white text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Scan Again</p>
              <p className="text-xs text-zinc-500">The barcode may have been scanned incorrectly. Try again.</p>
            </div>
            <span className="text-zinc-400 group-hover:text-emerald-500 transition-colors text-lg">→</span>
          </Link>

          <Link href="/upload"
            className="flex items-center gap-4 p-4 glass rounded-2xl hover:shadow-md transition-all group">
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center shrink-0">
              <ImagePlus size={18} className="text-violet-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-zinc-900 dark:text-white text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Upload for Analysis</p>
              <p className="text-xs text-zinc-500">Upload photos of the nutrition label and ingredients for AI analysis.</p>
            </div>
            <span className="text-zinc-400 group-hover:text-emerald-500 transition-colors text-lg">→</span>
          </Link>

          <a href={`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent('')}&search_simple=1&action=process`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 glass rounded-2xl hover:shadow-md transition-all group">
            <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center shrink-0">
              <HelpCircle size={18} className="text-zinc-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-zinc-900 dark:text-white text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Search Open Food Facts</p>
              <p className="text-xs text-zinc-500">Search the public Open Food Facts database directly.</p>
            </div>
            <span className="text-zinc-400 group-hover:text-emerald-500 transition-colors text-lg">↗</span>
          </a>
        </div>

        <p className="text-xs text-zinc-400">
          Barcode not recognized? Try scanning the product in good lighting and holding the camera steady.
        </p>
      </div>
    </div>
  );
}
