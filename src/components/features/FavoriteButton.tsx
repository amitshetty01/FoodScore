'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Heart } from 'lucide-react';
import { FoodProduct } from '@/types';
import { useRouter } from 'next/navigation';

interface FavoriteButtonProps {
  product: FoodProduct;
  score: number;
}

export function FavoriteButton({ product, score }: FavoriteButtonProps) {
  const { data: session } = useSession();
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!session) return;
    fetch('/api/user/favorites')
      .then(r => r.json())
      .then(d => {
        const favs = d.favorites || [];
        setIsFav(favs.some((f: { barcode: string }) => f.barcode === product.barcode));
      });
  }, [session, product.barcode]);

  const toggle = async () => {
    if (!session) { router.push('/login'); return; }
    setLoading(true);
    try {
      if (isFav) {
        await fetch('/api/user/favorites', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ barcode: product.barcode }),
        });
        setIsFav(false);
      } else {
        await fetch('/api/user/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ barcode: product.barcode, name: product.name, imageUrl: product.thumbnailUrl, score }),
        });
        setIsFav(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 ${
        isFav
          ? 'bg-red-50 dark:bg-red-900/20 text-red-500'
          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
      } disabled:opacity-50`}
      title={isFav ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart size={18} className={isFav ? 'fill-current' : ''} />
    </button>
  );
}
