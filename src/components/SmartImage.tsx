import { useEffect, useRef, useState, CSSProperties } from 'react';

type SmartImageProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  aspectRatio?: string;
  className?: string;
  loading?: 'eager' | 'lazy';
  sizes?: string;
  fit?: 'cover' | 'contain';
  onClick?: () => void;
};

export function SmartImage({
  src,
  alt,
  width,
  height,
  aspectRatio,
  className = '',
  loading = 'lazy',
  fit = 'cover',
  onClick,
}: SmartImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (imgRef.current?.complete) {
      setLoaded(true);
    }
  }, [src]);

  const containerStyle: CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'var(--brand-leaf)',
    ...(width ? { width: `${width}px` } : {}),
    ...(height ? { height: `${height}px` } : {}),
    ...(aspectRatio ? { aspectRatio } : {}),
  };

  const imgStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: fit,
    opacity: loaded ? 1 : 0,
    transition: 'opacity 250ms ease',
    display: 'block',
  };

  return (
    <div className={`smart-image ${className}`} style={containerStyle} onClick={onClick}>
      {!loaded && !errored && <div className="smart-image-shimmer" />}
      {errored && <div className="smart-image-error" />}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={loading}
        style={imgStyle}
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
        width={width}
        height={height}
      />
    </div>
  );
}
