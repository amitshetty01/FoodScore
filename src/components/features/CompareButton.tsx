'use client';

import React from 'react';
import { BarChart3, Check } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { FoodProduct } from '@/types';
import Link from 'next/link';

interface CompareButtonProps {
  product: FoodProduct;
  score: number;
  grade: string;
  variant?: 'header' | 'sidebar';
}

export const CompareButton: React.FC<CompareButtonProps> = ({ product, score, grade, variant = 'sidebar' }) => {
  const { compareList, addToCompare, addToast } = useAppStore();
  const isInCompare = compareList.some(c => c.barcode === product.barcode);
  const isFull = compareList.length >= 4;

  const handleAdd = () => {
    if (isFull) {
      addToast({ message: 'Compare list is full (max 4 products)', type: 'error' });
      return;
    }
    addToCompare({
      barcode: product.barcode,
      name: product.name,
      brand: product.brand,
      imageUrl: product.thumbnailUrl || product.imageUrl,
      score,
      grade,
    });
    addToast({ message: `${product.name} added to compare`, type: 'success' });
  };

  if (isInCompare) {
    return (
      <Link href="/compare"
        className="inline-flex items-center justify-center gap-2 h-11 px-5 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 transition-colors shadow-sm shadow-emerald-200 dark:shadow-emerald-900/30">
        <Check size={16} /> Compare ({compareList.length})
      </Link>
    );
  }

  if (variant === 'header') {
    return (
      <span className="inline-flex items-center gap-2">
        <button
          onClick={handleAdd}
          disabled={isFull}
          className="inline-flex items-center justify-center gap-2 h-11 px-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 shadow-sm"
        >
          <BarChart3 size={16} /> Add to Compare
        </button>
        {compareList.length > 0 && (
          <Link href="/compare"
            className="inline-flex items-center justify-center gap-1.5 h-11 px-4 glass rounded-xl text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <BarChart3 size={14} /> {compareList.length}
          </Link>
        )}
      </span>
    );
  }

  return (
    <button
      onClick={handleAdd}
      disabled={isFull}
      className="flex items-center justify-center gap-2 h-11 px-4 glass rounded-xl text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors w-full disabled:opacity-40"
    >
      <BarChart3 size={15} /> {isFull ? 'Compare Full (4/4)' : 'Add to Compare'}
    </button>
  );
};
