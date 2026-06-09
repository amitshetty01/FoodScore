import Link from 'next/link';
import { ImagePlus, SearchX, Scan } from 'lucide-react';

export default function ProductNotFound() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-3xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-6">
          <SearchX size={36} className="text-zinc-400" />
        </div>
        <h1 className="font-syne font-extrabold text-3xl text-zinc-900 dark:text-white mb-3">
          Product Not Found
        </h1>
        <p className="text-zinc-500 leading-relaxed mb-8">
          We couldn&apos;t find this product in the Open Food Facts database. It may not have been added yet, or the barcode may be incorrect.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/search"
            className="h-11 px-6 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2">
            Search Products
          </Link>
          <Link href="/upload"
            className="h-11 px-6 glass rounded-xl text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2">
            <ImagePlus size={15} /> Upload Images
          </Link>
          <Link href="/scan"
            className="h-11 px-6 glass rounded-xl text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2">
            <Scan size={15} /> Scan Again
          </Link>
        </div>
        <p className="text-xs text-zinc-400 mt-6">
          Want to add this product?{' '}
          <a href="https://world.openfoodfacts.org/cgi/product.pl" target="_blank" rel="noopener noreferrer"
            className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
            Contribute to Open Food Facts →
          </a>
        </p>
      </div>
    </div>
  );
}
