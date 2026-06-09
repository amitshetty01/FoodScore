'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen pt-24 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle size={28} className="text-red-500" />
        </div>
        <h1 className="font-syne font-extrabold text-2xl text-zinc-900 dark:text-white mb-2">Something went wrong</h1>
        <p className="text-zinc-500 text-sm mb-8 leading-relaxed">
          An unexpected error occurred. This has been logged and we&apos;ll look into it.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="h-10 px-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <RefreshCw size={14} /> Try again
          </button>
          <Link href="/" className="h-10 px-5 glass rounded-xl text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center">
            Go home
          </Link>
        </div>
        {error.digest && (
          <p className="text-xs font-mono text-zinc-300 dark:text-zinc-600 mt-6">Error ID: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
