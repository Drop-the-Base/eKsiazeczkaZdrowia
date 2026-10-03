import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

/** QR as an SVG data URL (allowed by the doctor app's CSP `img-src data:`). */
export function useQrImage(text: string | undefined): { src?: string; error?: string } {
  const [result, setResult] = useState<{ src?: string; error?: string }>({});
  useEffect(() => {
    if (!text) return setResult({});
    let cancelled = false;
    QRCode.toString(text, { type: 'svg', margin: 1, errorCorrectionLevel: 'M' })
      .then((svg) => {
        if (!cancelled)
          setResult({ src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}` });
      })
      .catch(() => {
        if (!cancelled) setResult({ error: 'Nie udało się wygenerować kodu QR' });
      });
    return () => {
      cancelled = true;
    };
  }, [text]);
  return result;
}
