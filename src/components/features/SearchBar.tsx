'use client';
import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  defaultValue?: string;
  size?: 'default' | 'large';
  autoFocus?: boolean;
  placeholder?: string;
  onSearch?: (query: string) => void;
}

export function SearchBar({ defaultValue = '', size = 'default', autoFocus, placeholder, onSearch }: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    if (onSearch) {
      onSearch(q);
      return;
    }

    if (/^\d{8,14}$/.test(q)) {
      router.push(`/product/${q}`);
      return;
    }

    router.push(`/search?q=${encodeURIComponent(q)}`);
  }, [query, onSearch, router]);

  return (
    <form onSubmit={handleSubmit} className={cn('relative w-full', size === 'large' && 'max-w-2xl')}>
      <div className={cn(
        'relative flex items-center glass rounded-2xl shadow-lg shadow-black/5 ring-1 ring-black/5 dark:ring-white/10 focus-within:ring-2 focus-within:ring-emerald-500/50 transition-all duration-200',
        size === 'large' ? 'h-16' : 'h-12'
      )}>
        <Search className={cn('absolute left-4 text-zinc-400 shrink-0', size === 'large' ? 'w-5 h-5' : 'w-4 h-4')} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={placeholder || (size === 'large' ? 'Search products or scan a barcode...' : 'Search food products...')}
          autoFocus={autoFocus}
          className={cn(
            'w-full bg-transparent pl-12 pr-24 font-sans text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none',
            size === 'large' ? 'text-lg pr-32' : 'text-sm'
          )}
        />
        {query && (
          <button type="button" onClick={() => { setQuery(''); inputRef.current?.focus(); }}
            className="absolute right-[4.5rem] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
            <X size={16} />
          </button>
        )}
        <button
          type="submit"
          disabled={!query.trim()}
          className={cn(
            'absolute right-2 font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20',
            size === 'large' ? 'h-11 px-5 text-sm' : 'h-8 px-4 text-xs'
          )}
        >
          Search
        </button>
      </div>
    </form>
  );
}
