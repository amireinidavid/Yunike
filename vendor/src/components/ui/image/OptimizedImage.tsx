'use client';

import React from 'react';
import Image from 'next/image';
import { getTransformedUrl, imagePresets, ImageTransforms } from '@/utils/image-transforms';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  preset?: keyof typeof imagePresets;
  transforms?: ImageTransforms;
  fill?: boolean;
  priority?: boolean;
  loading?: 'eager' | 'lazy';
  sizes?: string;
  quality?: number;
  fallbackSrc?: string;
}

/**
 * A wrapper around Next.js Image component that automatically applies
 * ImageKit transformations for optimized image delivery
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  preset,
  transforms,
  fill = false,
  priority = false,
  loading,
  sizes,
  quality,
  fallbackSrc = '/images/placeholder.png',
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = React.useState<string>(() => {
    // Apply preset if specified
    if (preset && src) {
      const result = imagePresets[preset](src);
      // Check if the result is an array (for responsiveImage preset) and use the first item if so
      return Array.isArray(result) ? result[0] : result;
    }
    // Apply custom transforms if specified
    if (transforms && src) {
      return getTransformedUrl(src, transforms);
    }
    // Fallback to original
    return src || fallbackSrc;
  });
  
  // Error handler to set fallback image
  const handleError = () => {
    setImgSrc(fallbackSrc);
  };

  // Generate responsive sizes if needed
  const responsiveSizes = React.useMemo(() => {
    if (!src || !src.includes('ik.imagekit.io')) return null;
    
    const breakpoints = [640, 768, 1024, 1280, 1536]; // Tailwind default breakpoints
    const sizesArray = breakpoints.map(bp => {
      const transformedSrc = getTransformedUrl(src, { width: bp, quality: quality || 75 });
      return `${transformedSrc} ${bp}w`;
    });
    
    return sizesArray.join(', ');
  }, [src, quality]);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      priority={priority}
      loading={loading}
      className={className}
      sizes={sizes}
      quality={quality}
      onError={handleError}
      // Added srcSet for responsive images if using ImageKit URLs
      {...(responsiveSizes ? { srcSet: responsiveSizes } : {})}
    />
  );
}

// Additional components for common use cases
export function ProfileAvatar({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={50}
      height={50}
      className={`rounded-full ${className || ''}`}
      preset="profileAvatar"
    />
  );
}

export function ProfileImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={150}
      height={150}
      className={`rounded-full ${className || ''}`}
      preset="profileThumbnail"
    />
  );
}

export function CoverImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={`w-full object-cover ${className || ''}`}
      preset="profileCover"
      fill
    />
  );
}

export default OptimizedImage;