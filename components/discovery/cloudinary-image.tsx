// components/discovery/cloudinary-image.tsx
'use client';

import { useState, memo } from 'react';
import { ImageOff } from 'lucide-react';

interface CloudinaryImageProps {
  url: string;
  alt?: string | null;
  caption?: string | null;
  type?: string;
  className?: string;
  priority?: boolean;
}

/**
 * Cloudinary Image Component
 * Optimizes images with transformations
 * Shows loading state and error fallback
 */
const CloudinaryImage = memo(({
  url,
  alt,
  caption,
  type = 'IMAGE',
  className = '',
  priority = false,
}: CloudinaryImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Cloudinary optimization transformations
  const optimizeCloudinaryUrl = (originalUrl: string): string => {
    try {
      // Check if it's a Cloudinary URL
      if (!originalUrl.includes('cloudinary.com')) {
        return originalUrl;
      }

      // Add transformations: auto format, quality, responsive width
      const transformations = 'f_auto,q_auto,w_800,c_limit';

      // Insert transformations after /upload/
      return originalUrl.replace(
        /\/upload\//,
        `/upload/${transformations}/`
      );
    } catch (error) {
      console.error('[CloudinaryImage] URL optimization error:', error);
      return originalUrl;
    }
  };

  const optimizedUrl = optimizeCloudinaryUrl(url);

  if (hasError) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-lg bg-muted">
        <div className="text-center">
          <ImageOff className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-xs text-muted-foreground">Image unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`group relative overflow-hidden rounded-lg ${className}`}>
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 animate-pulse bg-muted" />
      )}

      {/* Image */}
      <img
        src={optimizedUrl}
        alt={alt || caption || 'Business image'}
        className={`h-full w-full object-cover transition-all duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } group-hover:scale-105`}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />

      {/* Type Badge */}
      {type === 'LOGO' && (
        <div className="absolute left-2 top-2 rounded bg-accent/90 px-2 py-1 text-xs font-medium text-accent-foreground backdrop-blur-sm">
          LOGO
        </div>
      )}

      {type === 'COVER' && (
        <div className="absolute left-2 top-2 rounded bg-primary/90 px-2 py-1 text-xs font-medium text-primary-foreground backdrop-blur-sm">
          COVER
        </div>
      )}

      {/* Caption */}
      {caption && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
          <p className="text-xs text-white line-clamp-2">{caption}</p>
        </div>
      )}
    </div>
  );
});

CloudinaryImage.displayName = 'CloudinaryImage';

export default CloudinaryImage;
