'use client';
import { useState } from 'react';
import { BarcodeScanner } from '@/components/features/BarcodeScanner';
import { SearchBar } from '@/components/features/SearchBar';
import { Scan, Keyboard } from 'lucide-react';

export default function ScanPage() {
  const [mode, setMode] = useState<'camera' | 'manual'>('camera');

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-500/20 mx-auto mb-4">
            <Scan className="text-white" size={28} />
          </div>
          <h1 className="font-syne font-extrabold text-3xl text-zinc-900 dark:text-white mb-2">Scan a Product</h1>
          <p className="text-zinc-500">Point your camera at a barcode or enter it manually</p>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2 p-1 glass rounded-xl mb-6">
          <button
            onClick={() => setMode('camera')}
            className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-semibold transition-all ${
              mode === 'camera'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <Scan size={15} /> Camera
          </button>
          <button
            onClick={() => setMode('manual')}
            className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-semibold transition-all ${
              mode === 'manual'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <Keyboard size={15} /> Manual
          </button>
        </div>

        {/* Scanner content */}
        <div className="glass rounded-2xl p-6">
          {mode === 'camera' ? (
            <BarcodeScanner />
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-zinc-500 text-center">Enter the barcode number printed on the product</p>
              <SearchBar placeholder="Enter barcode number..." autoFocus />
              <p className="text-xs text-zinc-400 text-center">Most barcodes are 8-13 digits long (EAN-8, EAN-13, UPC-A)</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
