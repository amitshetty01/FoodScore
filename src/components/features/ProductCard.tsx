'use client';
import Link from 'next/link';
import Image from 'next/image';
import { ScoreRing } from './ScoreRing';
import { getGradeColor } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { SearchResult } from '@/types';

export function ProductCard({ product }: { product: SearchResult }) {
  const score = product.score ?? 5;
  const grade = product.grade ?? 'C';
  const selectedCountry = useAppStore((state) => state.selectedCountry);

  return (
    <Link href={`/product/${product.barcode}?country=${selectedCountry}`}
      className="group flex items-center gap-4 p-4 glass rounded-2xl hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 transition-all duration-200 hover:-translate-y-0.5">
      {/* Image */}
      <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 flex items-center justify-center">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={64}
            height={64}
            className="object-contain w-full h-full"
            unoptimized
          />
        ) : (
          <span className="text-2xl">🍽️</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors text-sm">
          {product.name}
        </h3>
        {product.brand && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">{product.brand}</p>
        )}
        <div className="flex items-center gap-2 mt-1.5">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getGradeColor(grade)}`}>
            Grade {grade}
          </span>
        </div>
      </div>

      {/* Score */}
      <div className="shrink-0">
        <ScoreRing score={score} size={56} strokeWidth={6} />
      </div>
    </Link>
  );
}
