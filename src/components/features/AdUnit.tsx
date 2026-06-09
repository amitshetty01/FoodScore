'use client';
import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface AdUnitProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'leaderboard' | 'banner';
  className?: string;
}

export function AdUnit({ slot, format = 'auto', className = '' }: AdUnitProps) {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  useEffect(() => {
    if (!clientId) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // silently fail during development
    }
  }, [clientId]);

  if (!clientId) {
    return (
      <div className={`flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-400 ${className}`}>
        Advertisement
      </div>
    );
  }

  return (
    <ins
      className={`adsbygoogle block ${className}`}
      data-ad-client={clientId}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}

// Pre-configured ad placements
export function LeaderboardAd() {
  return <AdUnit slot="1234567890" format="leaderboard" className="min-h-[90px] w-full" />;
}

export function RectangleAd() {
  return <AdUnit slot="0987654321" format="rectangle" className="min-h-[250px] w-full" />;
}

export function BannerAd() {
  return <AdUnit slot="1122334455" format="banner" className="min-h-[60px] w-full" />;
}
