'use client';

import { useEffect, useRef, useState } from 'react';
import { ProtectedApiImage } from './ProtectedApiImage';

type LazyThumbnailProps = {
  url: string;
  alt: string;
  className?: string;
};

export function LazyThumbnail({ url, alt, className }: LazyThumbnailProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = rootRef.current;
    if (!node || isVisible) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        root: null,
        rootMargin: '200px',
        threshold: 0.01,
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [isVisible]);

  return (
    <div ref={rootRef} className={className}>
      {isVisible ? (
        <ProtectedApiImage url={url} alt={alt} className={className} />
      ) : (
        <div
          className={className}
          style={{
            background:
              'linear-gradient(135deg, rgba(15,23,42,0.85), rgba(30,41,59,0.85))',
          }}
        />
      )}
    </div>
  );
}
