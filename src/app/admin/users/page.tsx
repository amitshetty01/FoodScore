'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Shield, Trash2, ChevronLeft, ChevronRight, Loader2, Search, Crown } from 'lucide-react';

interface AdminUser {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  createdAt: string;
  _count: { favorites: number; searches: number };
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
      router.replace('/');
    }
  }, [session, status, router]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/users?page=${page}`);
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users);
      setTotal(data.total);
      setPages(data.pages);
    }
    setLoading(false);
  }, [page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const toggleRole = async (userId: string, currentRole: string) => {
    setActionLoading(userId);
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role: currentRole === 'ADMIN' ? 'USER' : 'ADMIN' }),
    });
    await fetchUsers();
    setActionLoading(null);
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Delete this user and all their data?')) return;
    setActionLoading(userId);
    await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    await fetchUsers();
    setActionLoading(null);
  };

  const filtered = search
    ? users.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()))
    : users;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center gap-3">
          <button onClick={() => router.push('/admin')}
            className="w-8 h-8 rounded-xl glass flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
            <ChevronLeft size={16} />
          </button>
          <div>
            <h1 className="font-syne font-extrabold text-2xl text-zinc-900 dark:text-white flex items-center gap-2">
              <Shield size={20} className="text-zinc-400" /> User Management
            </h1>
            <p className="text-zinc-500 text-sm">{total} total users</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Filter by name or email..."
            className="w-full h-10 pl-9 pr-4 glass rounded-xl text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 max-w-xs" />
        </div>

        {/* Table */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <th className="text-left px-5 py-3 font-semibold text-zinc-500 text-xs uppercase tracking-wide">User</th>
                  <th className="text-left px-5 py-3 font-semibold text-zinc-500 text-xs uppercase tracking-wide hidden sm:table-cell">Joined</th>
                  <th className="text-center px-5 py-3 font-semibold text-zinc-500 text-xs uppercase tracking-wide hidden md:table-cell">Favorites</th>
                  <th className="text-center px-5 py-3 font-semibold text-zinc-500 text-xs uppercase tracking-wide hidden md:table-cell">Searches</th>
                  <th className="text-center px-5 py-3 font-semibold text-zinc-500 text-xs uppercase tracking-wide">Role</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {loading ? (
                  <tr><td colSpan={6} className="py-12 text-center">
                    <Loader2 size={20} className="animate-spin mx-auto text-zinc-400" />
                  </td></tr>
                ) : filtered.map(u => (
                  <tr key={u.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {u.name?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-zinc-900 dark:text-white">{u.name || '—'}</p>
                          <p className="text-xs text-zinc-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-zinc-500 hidden sm:table-cell">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-center text-zinc-600 dark:text-zinc-400 hidden md:table-cell">
                      {u._count.favorites}
                    </td>
                    <td className="px-5 py-3 text-center text-zinc-600 dark:text-zinc-400 hidden md:table-cell">
                      {u._count.searches}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        u.role === 'ADMIN'
                          ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                      }`}>{u.role}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => toggleRole(u.id, u.role)}
                          disabled={!!actionLoading}
                          title={u.role === 'ADMIN' ? 'Demote to User' : 'Promote to Admin'}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all disabled:opacity-50">
                          {actionLoading === u.id ? <Loader2 size={14} className="animate-spin" /> : <Crown size={14} />}
                        </button>
                        <button onClick={() => deleteUser(u.id)}
                          disabled={!!actionLoading}
                          title="Delete user"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-50">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-100 dark:border-zinc-800">
              <span className="text-xs text-zinc-400">Page {page} of {pages}</span>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-8 h-8 rounded-lg glass flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white disabled:opacity-40 transition-all">
                  <ChevronLeft size={14} />
                </button>
                <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                  className="w-8 h-8 rounded-lg glass flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white disabled:opacity-40 transition-all">
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
