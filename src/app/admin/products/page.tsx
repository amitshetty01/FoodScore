'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Database, ChevronLeft, ChevronRight, Loader2, ExternalLink, Trash2 } from 'lucide-react';

interface CachedProduct {
  id: string;
  barcode: string;
  score: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  data: { name?: string; brand?: string };
}

export default function AdminProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<CachedProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') router.replace('/');
  }, [session, status, router]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/products?page=${page}`);
    if (res.ok) {
      const data = await res.json();
      setProducts(data.products);
      setTotal(data.total);
      setPages(data.pages);
    }
    setLoading(false);
  }, [page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const deleteProduct = async (id: string) => {
    if (!confirm('Remove this product from cache?')) return;
    await fetch(`/api/admin/products`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchProducts();
  };

  const getScoreColor = (s: number) => s >= 7 ? 'text-emerald-500' : s >= 5 ? 'text-amber-500' : 'text-red-500';

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center gap-3">
          <button onClick={() => router.push('/admin')}
            className="w-8 h-8 rounded-xl glass flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
            <ChevronLeft size={16} />
          </button>
          <div>
            <h1 className="font-syne font-extrabold text-2xl text-zinc-900 dark:text-white flex items-center gap-2">
              <Database size={20} className="text-zinc-400" /> Cached Products
            </h1>
            <p className="text-zinc-500 text-sm">{total} products in cache</p>
          </div>
        </div>

        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  {['Product', 'Barcode', 'Score', 'Views', 'Cached', ''].map(h => (
                    <th key={h} className="text-left px-5 py-3 font-semibold text-zinc-500 text-xs uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {loading ? (
                  <tr><td colSpan={6} className="py-12 text-center">
                    <Loader2 size={20} className="animate-spin mx-auto text-zinc-400" />
                  </td></tr>
                ) : products.map(p => (
                  <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-5 py-3">
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-white truncate max-w-[200px]">
                          {p.data.name || 'Unknown'}
                        </p>
                        {p.data.brand && <p className="text-xs text-zinc-400">{p.data.brand}</p>}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-mono text-xs text-zinc-500">{p.barcode}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`font-bold ${getScoreColor(p.score)}`}>{p.score.toFixed(1)}</span>
                    </td>
                    <td className="px-5 py-3 text-zinc-500">{p.viewCount}</td>
                    <td className="px-5 py-3 text-zinc-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <Link href={`/product/${p.barcode}`} target="_blank"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all">
                          <ExternalLink size={14} />
                        </Link>
                        <button onClick={() => deleteProduct(p.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-100 dark:border-zinc-800">
              <span className="text-xs text-zinc-400">Page {page} of {pages}</span>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-8 h-8 rounded-lg glass flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white disabled:opacity-40">
                  <ChevronLeft size={14} />
                </button>
                <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                  className="w-8 h-8 rounded-lg glass flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white disabled:opacity-40">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
