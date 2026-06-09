'use client';

import { useMemo, useRef, useState, type FormEvent } from 'react';
import { Camera, ImagePlus, Loader2, RefreshCcw } from 'lucide-react';
import { ImageAnalysisResult } from '@/types';
import { cn } from '@/lib/utils';

const uploadFields = [
  { name: 'frontImage', label: 'Front package image', description: 'Front of the product packaging.' },
  { name: 'nutritionImage', label: 'Nutrition label image', description: 'Nutrition facts panel or table.' },
  { name: 'ingredientsImage', label: 'Ingredients image', description: 'Ingredients list on the package.' },
] as const;

export function ImageAnalysisUploader() {
  const [images, setImages] = useState<Partial<Record<'frontImage' | 'nutritionImage' | 'ingredientsImage', File>>>(
    {}
  );
  const [loading, setLoading] = useState(false);
  const [progressMessage, setProgressMessage] = useState('Upload photos to begin analysis.');
  const [result, setResult] = useState<ImageAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const canSubmit = !!images.nutritionImage || !!images.ingredientsImage || !!images.frontImage;

  const handleSelect = (field: typeof uploadFields[number]['name']) => {
    inputRefs.current[field]?.click();
  };

  const handleFiles = (field: typeof uploadFields[number]['name'], file?: File) => {
    if (!file) return;
    setImages((prev) => ({ ...prev, [field]: file }));
  };

  const clearImages = () => {
    setImages({});
    setResult(null);
    setError(null);
    setProgressMessage('Upload photos to begin analysis.');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) {
      setError('Please upload at least one image, ideally nutrition label or ingredients.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setProgressMessage('Preparing uploaded images...');

    try {
      const formData = new FormData();
      uploadFields.forEach((field) => {
        const file = images[field.name];
        if (file) formData.append(field.name, file, file.name);
      });

      setProgressMessage('Extracting text from images...');
      const response = await fetch('/api/analyze-images', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || 'Image analysis failed.');
      }

      setProgressMessage('Generating your score and summary...');
      const data: ImageAnalysisResult = await response.json();
      setResult(data);
      setProgressMessage('Analysis complete.');
    } catch (err) {
      setError((err as Error).message || 'Unable to analyze images.');
    } finally {
      setLoading(false);
    }
  };

  const fileList = useMemo(() => {
    return uploadFields.map((field) => {
      const file = images[field.name];
      return {
        ...field,
        fileName: file?.name,
      };
    });
  }, [images]);

  return (
    <div className="space-y-6">
      <div className="glass rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-300">Image-Based Food Analysis</p>
            <h2 className="mt-3 text-2xl font-bold text-zinc-900 dark:text-white">Upload package photos for analysis</h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 max-w-xl">
              Add optional front, nutrition label, and ingredients images. The more detail you upload, the higher the confidence and accuracy.
            </p>
          </div>
          <div className="rounded-3xl bg-emerald-50 dark:bg-emerald-950/30 p-4 text-sm text-emerald-900 dark:text-emerald-200">
            <p className="font-semibold">Confidence guide</p>
            <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-300">Nutrition + ingredients = Medium / High. Ingredients only = Low.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 md:grid-cols-3">
          {fileList.map((item) => (
            <button
              type="button"
              key={item.name}
              onClick={() => handleSelect(item.name)}
              className="group relative flex min-h-[150px] flex-col items-start justify-between rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 text-left transition-all hover:border-emerald-300 dark:hover:border-emerald-500"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-white">
                  <ImagePlus size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-white">{item.label}</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{item.description}</p>
                </div>
              </div>
              <div className="mt-5 text-xs text-zinc-600 dark:text-zinc-400">
                {item.fileName ? item.fileName : 'Click to choose an image'}
              </div>
              <input
                ref={(el) => { inputRefs.current[item.name] = el; }}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) handleFiles(item.name, file);
                }}
              />
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row items-stretch sm:items-center">
          <button
            type="submit"
            disabled={!canSubmit || loading}
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60',
            )}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
            {loading ? 'Analyzing images' : 'Analyze uploaded images'}
          </button>
          <button
            type="button"
            onClick={clearImages}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 transition dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            <RefreshCcw size={16} /> Clear photos
          </button>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
          <p className="font-semibold">Tip:</p>
          <p className="mt-2">If you only upload ingredients and nutrition label images, the analysis can still generate a score, but confidence will be lower.</p>
        </div>
      </form>

      {error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">Analysis status</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{progressMessage}</p>
          </div>
          <span className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
            {loading ? 'Working...' : 'Ready'}
          </span>
        </div>
      </div>

      {result && (
        <div className="space-y-5">
            <div className="rounded-3xl bg-emerald-50 dark:bg-emerald-950/20 p-6 border border-emerald-200 dark:border-emerald-800/50">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-300">Generated Food Score</p>
                <h3 className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">{Math.round((result.healthScore / 100) * 10 * 10) / 10}/10</h3>
                <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{result.verdict}</p>
              </div>
              <div className="rounded-3xl bg-white px-4 py-3 text-sm font-semibold text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100">
                {result.confidence}
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-white p-4 dark:bg-zinc-900/80 dark:border dark:border-zinc-800">
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Product Name</p>
                <p className="mt-2 text-sm text-zinc-900 dark:text-zinc-100">{result.productName || 'Unknown'}</p>
              </div>
              <div className="rounded-3xl bg-white p-4 dark:bg-zinc-900/80 dark:border dark:border-zinc-800">
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Brand</p>
                <p className="mt-2 text-sm text-zinc-900 dark:text-zinc-100">{result.brandName || 'Unknown'}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-3xl border border-zinc-200 bg-white p-5 text-sm dark:border-zinc-800 dark:bg-zinc-900/80">
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">Top reasons</p>
              <ul className="mt-4 space-y-3 text-zinc-600 dark:text-zinc-300">
                {result.topReasons.map((reason, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <span className="text-emerald-600 dark:text-emerald-400">•</span> {reason}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-zinc-200 bg-white p-5 text-sm dark:border-zinc-800 dark:bg-zinc-900/80">
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">Nutrition facts</p>
              <div className="mt-4 space-y-2 text-zinc-600 dark:text-zinc-300">
                <p>Calories: {result.nutritionFacts.energy_kcal ?? 'N/A'} kcal</p>
                <p>Sugars: {result.nutritionFacts.sugars ?? 'N/A'} g</p>
                <p>Sodium: {result.nutritionFacts.sodium ?? 'N/A'} mg</p>
                <p>Saturated fat: {result.nutritionFacts.saturated_fat ?? 'N/A'} g</p>
              </div>
            </div>
            <div className="rounded-3xl border border-zinc-200 bg-white p-5 text-sm dark:border-zinc-800 dark:bg-zinc-900/80">
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">Notes</p>
              <ul className="mt-4 space-y-2 text-zinc-600 dark:text-zinc-300">
                {result.notes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-5 text-sm dark:border-zinc-800 dark:bg-zinc-900/80">
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">Extracted text</p>
            <pre className="mt-4 overflow-x-auto whitespace-pre-wrap text-xs text-zinc-600 dark:text-zinc-300">{result.extractedText}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
