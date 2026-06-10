import Link from 'next/link';
import { Heart } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const links = {
    Product: [
      { label: 'Search', href: '/search' },
      { label: 'Scan Barcode', href: '/scan' },
      { label: 'Sign Up Free', href: '/signup' },
    ],
    Company: [
      { label: 'About', href: '/about' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
    Resources: [
      { label: 'Contact', href: 'mailto:support@foodscore.app' },
      { label: 'Status', href: '/status' },
      { label: 'Blog', href: '/blog' },
    ],
  };

  return (
    <footer className="border-t border-zinc-100 dark:border-zinc-800 mt-12 sm:mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3 sm:mb-4 group">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs font-syne">F</span>
              </div>
              <span className="font-syne font-bold text-sm sm:text-base text-zinc-900 dark:text-white">FoodScore</span>
            </Link>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-[180px]">
              Know what you eat. Health scores for millions of products.
            </p>
            <p className="text-xs text-zinc-400 mt-3 sm:mt-4 flex items-center gap-1">
              Made with <Heart size={11} className="text-red-400 fill-current" /> for healthier choices
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h3 className="text-[11px] sm:text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 sm:mb-3">{section}</h3>
              <ul className="space-y-1.5 sm:space-y-2">
                {items.map(item => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      target={'external' in item && item.external ? '_blank' : undefined}
                      rel={'external' in item && item.external ? 'noopener noreferrer' : undefined}
                      className="text-xs sm:text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-zinc-400 text-center sm:text-left">© {currentYear} FoodScore. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
