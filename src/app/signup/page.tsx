'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) { setError(data.error || 'Signup failed'); setLoading(false); return; }

      await signIn('credentials', { email: form.email, password: form.password, redirect: false });
      router.push('/dashboard');
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold font-syne">F</span>
            </div>
          </Link>
          <h1 className="font-syne font-extrabold text-3xl text-zinc-900 dark:text-white">Create account</h1>
          <p className="text-zinc-500 mt-1">Start tracking your nutrition for free</p>
        </div>

        <div className="glass rounded-3xl p-8 shadow-xl shadow-black/5">
          <button
            onClick={async () => {
              setGoogleLoading(true);
              setError('');
              try {
                const result = await signIn('google', { redirect: false, callbackUrl: '/dashboard' });
                if (result?.error) {
                  if (result.error === 'OAuthSignin' || result.error === 'OAuthCallback') {
                    setError('Google Sign-In is not configured. Please contact support.');
                  } else if (result.error === 'AccessDenied') {
                    setError('Access denied. You may already have an account with this email.');
                  } else {
                    setError('Google sign-in failed. Please try again.');
                  }
                } else if (result?.url) {
                  window.location.href = result.url;
                } else {
                  setError('An unexpected error occurred. Please try again.');
                }
              } catch {
                setError('An unexpected error occurred. Please try again.');
              } finally {
                setGoogleLoading(false);
              }
            }}
            disabled={googleLoading || loading}
            className="w-full h-11 glass border border-zinc-200 dark:border-zinc-700 rounded-xl flex items-center justify-center gap-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors mb-6"
          >
            {googleLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            {googleLoading ? 'Signing in...' : 'Continue with Google'}
          </button>

          <div className="flex items-center gap-3 mb-6">
            <hr className="flex-1 border-zinc-200 dark:border-zinc-700" />
            <span className="text-xs text-zinc-400 font-medium">or</span>
            <hr className="flex-1 border-zinc-200 dark:border-zinc-700" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-3">{error}</div>
            )}

            {[
              { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Jane Doe' },
              { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
              { key: 'password', label: 'Password', type: 'password', placeholder: 'Min. 8 characters' },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">{field.label}</label>
                <input
                  type={field.type}
                  value={form[field.key as keyof typeof form]}
                  onChange={set(field.key)}
                  required
                  minLength={field.key === 'password' ? 8 : undefined}
                  className="w-full h-11 px-4 glass rounded-xl text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder={field.placeholder}
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              Create account
            </button>

            <p className="text-xs text-zinc-400 text-center">
              By signing up, you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>

          <p className="text-center text-sm text-zinc-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
