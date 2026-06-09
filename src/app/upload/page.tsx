import { ImageAnalysisUploader } from '@/components/features/ImageAnalysisUploader';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Upload Images — FoodScore',
  description: 'Upload package images to extract nutrition details and get a food health score.',
};

export default function UploadPage() {
  return (
    <main className="min-h-screen pt-24 pb-16 px-4">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10">
          <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-white">Upload product images</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              If the product is not found in Open Food Facts, upload package photos. We’ll use OCR to extract nutrition and ingredient information, then generate a score and confidence tier.
            </p>
          </div>
        </div>

        <ImageAnalysisUploader />
      </div>
    </main>
  );
}
