'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useAppStore } from '@/lib/store';

interface FavoriteItem {
  id: string;
  barcode: string;
  name: string;
  imageUrl?: string | null;
  score: number;
  createdAt: string;
}

export function useFavorites() {
  const { data: session } = useSession();
  const { addToast } = useAppStore();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFavorites = useCallback(async () => {
    if (!session?.user) return;
    setLoading(true);
    try {
      const res = await fetch('/api/user/favorites');
      if (res.ok) {
        const data = await res.json();
        setFavorites(data.favorites || []);
      }
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => { fetchFavorites(); }, [fetchFavorites]);

  const isFavorite = useCallback(
    (barcode: string) => favorites.some((f) => f.barcode === barcode),
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (barcode: string, name: string, imageUrl?: string, score?: number) => {
      if (!session?.user) return false;

      const wasFav = isFavorite(barcode);
      // Optimistic update
      if (wasFav) {
        setFavorites((prev) => prev.filter((f) => f.barcode !== barcode));
      } else {
        setFavorites((prev) => [
          ...prev,
          { id: 'temp', barcode, name, imageUrl, score: score ?? 5, createdAt: new Date().toISOString() },
        ]);
      }

      try {
        const res = await fetch('/api/user/favorites', {
          method: wasFav ? 'DELETE' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ barcode, name, imageUrl, score }),
        });

        if (!res.ok) throw new Error();

        addToast({
          message: wasFav ? 'Removed from favorites' : 'Added to favorites!',
          type: wasFav ? 'info' : 'success',
        });

        // Refresh to get real IDs
        await fetchFavorites();
        return true;
      } catch {
        // Revert optimistic update
        await fetchFavorites();
        addToast({ message: 'Something went wrong', type: 'error' });
        return false;
      }
    },
    [session, isFavorite, fetchFavorites, addToast]
  );

  return { favorites, loading, isFavorite, toggleFavorite, refetch: fetchFavorites };
}
