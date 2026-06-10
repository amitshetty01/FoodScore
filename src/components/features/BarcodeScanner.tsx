'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Zap } from 'lucide-react';

export function BarcodeScanner({ onClose }: { onClose?: () => void }) {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'initializing' | 'scanning' | 'found' | 'error'>('initializing');
  const [error, setError] = useState<string>('');
  const [scannedCode, setScannedCode] = useState('');
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const html5QrRef = useRef<any>(null);

  useEffect(() => {
    let scanner: unknown;

    const initScanner = async () => {
      try {
        const { Html5QrcodeScanner } = await import('html5-qrcode');
        scanner = new Html5QrcodeScanner(
          'qr-reader',
          { fps: 10, qrbox: { width: 250, height: 150 }, rememberLastUsedCamera: true },
          false
        );
        html5QrRef.current = scanner;

        (scanner as { render: (success: (code: string) => void, error: (err: unknown) => void) => void }).render(
          (code: string) => {
            setScannedCode(code);
            setStatus('found');
            (scanner as { clear: () => void }).clear();
            setTimeout(() => {
              router.push(`/product/${code}`);
              onClose?.();
            }, 800);
          },
          () => { /* Ignore scan errors */ }
        );

        setStatus('scanning');
      } catch {
        setError('Camera access denied or not available. Please allow camera permissions.');
        setStatus('error');
      }
    };

    initScanner();

    return () => {
      if (html5QrRef.current) {
        html5QrRef.current.clear?.().catch(() => {});
      }
    };
  }, [router, onClose]);

  return (
    <div className="w-full">
      {status === 'error' && (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
            <Camera className="text-red-500" size={28} />
          </div>
          <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
          <p className="text-xs text-zinc-500 mt-2">Try typing the barcode number manually instead.</p>
        </div>
      )}

      {status === 'found' && (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-4">
            <Zap className="text-emerald-500" size={28} />
          </div>
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Barcode detected!</p>
          <p className="text-xs text-zinc-400 font-mono mt-1">{scannedCode}</p>
          <p className="text-xs text-zinc-400 mt-2">Loading product...</p>
        </div>
      )}

      {(status === 'initializing' || status === 'scanning') && (
        <div className="space-y-3">
          <div id="qr-reader" ref={scannerRef} className="w-full rounded-xl overflow-hidden" />
          {status === 'initializing' && (
            <p className="text-center text-sm text-zinc-500">Initializing camera...</p>
          )}
          {status === 'scanning' && (
            <p className="text-center text-sm text-zinc-500">Point camera at a product barcode</p>
          )}
        </div>
      )}
    </div>
  );
}
