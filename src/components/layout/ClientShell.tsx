'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { CountryGate } from '@/components/features/CountryGate';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ToastContainer } from '@/components/ui/Toast';

export function ClientShell({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const hasSelectedCountry = useAppStore((s) => s.hasSelectedCountry);

  useEffect(() => {
    const unsub = useAppStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    if (useAppStore.persist.hasHydrated()) {
      setHydrated(true);
    }
    return () => unsub();
  }, []);

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <span className="text-white font-bold text-sm font-syne">F</span>
        </div>
      </div>
    );
  }

  if (!hasSelectedCountry) {
    return <CountryGate />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 transition-colors flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <ToastContainer />
    </div>
  );
}
