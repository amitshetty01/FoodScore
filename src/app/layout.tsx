import type { Metadata } from 'next';
import { Inter, Syne } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/layout/Providers';
import { ClientShell } from '@/components/layout/ClientShell';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const syne = Syne({ subsets: ['latin'], variable: '--font-syne', weight: ['400', '500', '600', '700', '800'] });

export const metadata: Metadata = {
  title: {
    default: 'FoodScore — Know What You Eat',
    template: '%s | FoodScore',
  },
  description: 'Search any food product and get an instant health score out of 10, with detailed nutritional breakdown and healthier alternatives.',
  keywords: ['food health score', 'nutrition rating', 'food scanner', 'barcode scanner', 'healthy eating'],
  openGraph: {
    title: 'FoodScore — Know What You Eat',
    description: 'Instant health ratings for any food product.',
    type: 'website',
    url: process.env.NEXT_PUBLIC_APP_URL,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'FoodScore',
              description: 'Food health rating application',
              url: process.env.NEXT_PUBLIC_APP_URL,
              applicationCategory: 'HealthApplication',
            }),
          }}
        />
      </head>
      <body className={`${inter.variable} ${syne.variable} font-sans antialiased`}>
        <Providers>
          <ClientShell>{children}</ClientShell>
        </Providers>
      </body>
    </html>
  );
}
