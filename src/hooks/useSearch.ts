'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { SearchResult } from '@/types';

interface UseSearchOptions {
  debounceMs?: number;
  minLength?: number;
}

export function useSearch(options: UseSearchOptions = {}) {
  const { debounceMs = 400, minLength = 2 } = options;
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback(async (q: string, page = 1) => {
    if (q.length < minLength) { setResults([]); return; }

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/products?q=${encodeURIComponent(q)}&page=${page}`,
        { signal: abortRef.current.signal }
      );
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setResults(data.results || []);
      setTotal(data.count || 0);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setError('Search failed. Please try again.');
        setResults([]);
      }
    } finally {
      setLoading(false);
    }
  }, [minLength]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(() => search(query), debounceMs);
    return () => clearTimeout(timer);
  }, [query, debounceMs, search]);

  return { query, setQuery, results, loading, error, total, search };
}
