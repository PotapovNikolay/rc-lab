/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { getRuntimeSettings } from '@/shared/lib/runtimeConfig';

type ProtectedApiImageProps = {
  url: string;
  alt: string;
  className?: string;
};

export function ProtectedApiImage({ url, alt, className }: ProtectedApiImageProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let localObjectUrl: string | null = null;

    const load = async () => {
      try {
        setLoading(true);
        setError(false);

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${getRuntimeSettings().apiToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Image request failed: ${response.status}`);
        }

        const blob = await response.blob();
        localObjectUrl = URL.createObjectURL(blob);

        if (!cancelled) {
          setObjectUrl(localObjectUrl);
        }
      } catch {
        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
      if (localObjectUrl) {
        URL.revokeObjectURL(localObjectUrl);
      }
    };
  }, [url]);

  if (loading) {
    return (
      <div
        className={className}
        style={{
          background:
            'linear-gradient(135deg, rgba(15,23,42,0.8), rgba(30,41,59,0.8))',
        }}
      />
    );
  }

  if (error || !objectUrl) {
    return (
      <div
        className={className}
        style={{
          background:
            'linear-gradient(135deg, rgba(127,29,29,0.35), rgba(30,41,59,0.8))',
        }}
      />
    );
  }

  return <img src={objectUrl} alt={alt} className={className} />;
}
