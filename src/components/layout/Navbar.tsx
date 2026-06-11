'use client';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Scan, Search, Heart, LayoutDashboard, LogOut, ChevronDown, Shield, Menu, X, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { CountryCode } from '@/types';

const countryFlags: Record<CountryCode, string> = {
  IN: '🇮🇳', US: '🇺🇸', CA: '🇨🇦', AU: '🇦🇺',
};
const countryNames: Record<CountryCode, string> = {
  IN: 'India', US: 'USA', CA: 'Canada', AU: 'Australia',
};

export function Navbar() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const countryRef = useRef<HTMLDivElement>(null);
  const selectedCountry = useAppStore((s) => s.selectedCountry);
  const setSelectedCountry = useAppStore((s) => s.setSelectedCountry);
  const hasSelectedCountry = useAppStore((s) => s.hasSelectedCountry);
  const setHasSelectedCountry = useAppStore((s) => s.setHasSelectedCountry);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) {
        setCountryOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    setMounted(true);
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const isAdmin = (session?.user as { role?: string })?.role === 'ADMIN';

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled ? 'glass shadow-sm' : 'bg-transparent'
    )}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
            <span className="text-white font-bold text-sm font-syne">F</span>
          </div>
          <span className="font-syne font-bold text-lg text-zinc-900 dark:text-white">
            Food<span className="gradient-text">Score</span>
          </span>
        </Link>

        {/* Center nav */}
        <div className="hidden md:flex items-center gap-1">
          <NavLink href="/search" icon={<Search size={15} />}>Search</NavLink>
          <NavLink href="/scan" icon={<Scan size={15} />}>Scan</NavLink>
          <NavLink href="/compare" icon={<BarChart3 size={15} />}>Compare</NavLink>
          {session && <NavLink href="/dashboard" icon={<Heart size={15} />}>Favorites</NavLink>}
          {isAdmin && <NavLink href="/admin" icon={<Shield size={15} />}>Admin</NavLink>}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="flex md:hidden w-8 h-8 rounded-xl items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
            aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileNavOpen ? <X size={17} /> : <Menu size={17} />}
          </button>

          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          )}

          {/* Country switcher */}
          <div className="relative" ref={countryRef}>
            <button
              onClick={() => { setCountryOpen(!countryOpen); if (!hasSelectedCountry) { setHasSelectedCountry(true); } }}
              className="h-8 sm:h-9 px-2 rounded-xl flex items-center gap-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all border border-zinc-200 dark:border-zinc-700 relative"
              title={`Country: ${countryNames[selectedCountry]}`}
            >
              {!hasSelectedCountry && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
              <span className="text-base leading-none">{countryFlags[selectedCountry]}</span>
              <span className="hidden sm:inline text-xs">{countryNames[selectedCountry]}</span>
            </button>
            {countryOpen && (
              <div className="absolute right-0 top-10 sm:top-12 w-44 glass rounded-2xl shadow-xl p-1 z-50 border border-zinc-200 dark:border-zinc-700">
                {(['IN', 'US', 'CA', 'AU'] as CountryCode[]).map((code) => (
                  <button
                    key={code}
                    onClick={() => { setSelectedCountry(code); setCountryOpen(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${
                      selectedCountry === code
                        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 font-semibold'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <span className="text-base">{countryFlags[code]}</span>
                    <span className="flex-1 text-left">{countryNames[code]}</span>
                    {selectedCountry === code && <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {session ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-1.5 h-8 sm:h-9 px-2 sm:px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all text-xs sm:text-sm font-medium"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {session.user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="hidden sm:block text-zinc-700 dark:text-zinc-300 max-w-[80px] truncate">{session.user?.name?.split(' ')[0]}</span>
                <ChevronDown size={13} className="text-zinc-400 shrink-0" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-10 sm:top-12 w-48 glass rounded-2xl shadow-xl p-1 z-50">
                  <Link href="/dashboard" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                    <LayoutDashboard size={14} /> Dashboard
                  </Link>
                  <Link href="/compare" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                    <BarChart3 size={14} /> Compare
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                      <Shield size={14} /> Admin Panel
                    </Link>
                  )}
                  <hr className="my-1 border-zinc-200 dark:border-zinc-700" />
                  <button onClick={() => { signOut(); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link href="/login" className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center">
                Sign in
              </Link>
              <Link href="/signup" className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm font-semibold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl hover:opacity-90 transition-opacity flex items-center whitespace-nowrap">
                Get started
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile navigation panel */}
      {mobileNavOpen && (
        <div className="md:hidden glass border-t border-zinc-200 dark:border-zinc-700">
          <div className="px-4 py-3 space-y-1">
            <MobileNavLink href="/search" icon={<Search size={15} />} onClick={() => setMobileNavOpen(false)}>Search</MobileNavLink>
            <MobileNavLink href="/scan" icon={<Scan size={15} />} onClick={() => setMobileNavOpen(false)}>Scan</MobileNavLink>
            <MobileNavLink href="/compare" icon={<BarChart3 size={15} />} onClick={() => setMobileNavOpen(false)}>Compare</MobileNavLink>
            {session && <MobileNavLink href="/dashboard" icon={<Heart size={15} />} onClick={() => setMobileNavOpen(false)}>Favorites</MobileNavLink>}
            {isAdmin && <MobileNavLink href="/admin" icon={<Shield size={15} />} onClick={() => setMobileNavOpen(false)}>Admin</MobileNavLink>}
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all">
      {icon}{children}
    </Link>
  );
}

function MobileNavLink({ href, icon, children, onClick }: { href: string; icon: React.ReactNode; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all">
      <span className="text-zinc-400 dark:text-zinc-500">{icon}</span>
      {children}
    </Link>
  );
}
