import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen pt-24 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-7xl font-syne font-black text-zinc-100 dark:text-zinc-800 mb-4">404</div>
        <h1 className="font-syne font-bold text-2xl text-zinc-900 dark:text-white mb-2">Page not found</h1>
        <p className="text-zinc-500 mb-8">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/" className="h-10 px-6 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-sm font-semibold inline-flex items-center hover:opacity-90 transition-opacity">
          Go home
        </Link>
      </div>
    </div>
  );
}
