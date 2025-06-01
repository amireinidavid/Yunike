/**
 * Utility functions for working with ImageKit transformed URLs
 */

// Interface for image transformation parameters
export interface ImageTransforms {
  height?: number;
  width?: number;
  quality?: number;
  format?: 'auto' | 'webp' | 'jpg' | 'png';
  focus?: 'center' | 'top' | 'left' | 'bottom' | 'right';
  crop?: 'maintain_ratio' | 'force';
}

/**
 * Generate a transformed URL for an ImageKit image
 * @param imageUrl Original ImageKit URL
 * @param transforms Transformations to apply
 * @returns Transformed image URL
 */
export function getTransformedUrl(imageUrl: string, transforms: ImageTransforms): string {
  // Return original URL if no transforms or not an ImageKit URL
  if (!transforms || !imageUrl || !imageUrl.includes('ik.imagekit.io')) {
    return imageUrl;
  }

  // Parse existing URL parameters
  const [baseUrl, existingParams] = imageUrl.split('?');
  const params = new URLSearchParams(existingParams || '');
  
  // Build transformation parameter string
  const transformParams = [];
  
  if (transforms.height) {
    transformParams.push(`h-${transforms.height}`);
  }
  
  if (transforms.width) {
    transformParams.push(`w-${transforms.width}`);
  }
  
  if (transforms.quality) {
    transformParams.push(`q-${transforms.quality}`);
  }
  
  if (transforms.format) {
    transformParams.push(`f-${transforms.format}`);
  }
  
  if (transforms.focus) {
    transformParams.push(`fo-${transforms.focus}`);
  }
  
  if (transforms.crop) {
    transformParams.push(`c-${transforms.crop}`);
  }
  
  // If we already have tr parameter, update it, otherwise add it
  if (transformParams.length > 0) {
    params.set('tr', transformParams.join(','));
  }
  
  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Common preset transforms for easy use
 */
export const imagePresets = {
  /**
   * Thumbnail for profile images (square)
   */
  profileThumbnail: (imageUrl: string): string => 
    getTransformedUrl(imageUrl, { width: 150, height: 150, crop: 'maintain_ratio' }),
    
  /**
   * Small avatar for profile images
   */
  profileAvatar: (imageUrl: string): string => 
    getTransformedUrl(imageUrl, { width: 50, height: 50, crop: 'maintain_ratio' }),
    
  /**
   * Banner image for profile headers
   */
  profileBanner: (imageUrl: string): string => 
    getTransformedUrl(imageUrl, { width: 1200, height: 300, crop: 'maintain_ratio' }),
    
  /**
   * Cover image for profile pages
   */
  profileCover: (imageUrl: string): string => 
    getTransformedUrl(imageUrl, { width: 1920, height: 480, crop: 'maintain_ratio' }),
    
  /**
   * Product thumbnail for listings
   */
  productThumbnail: (imageUrl: string): string => 
    getTransformedUrl(imageUrl, { width: 300, height: 300, crop: 'maintain_ratio' }),
    
  /**
   * Product image for detail pages
   */
  productDetail: (imageUrl: string): string => 
    getTransformedUrl(imageUrl, { width: 800, height: 800, crop: 'maintain_ratio' }),
    
  /**
   * Responsive image set using srcSet format
   * Returns an array of URLs for different sizes
   */
  responsiveImage: (imageUrl: string, sizes: number[] = [320, 640, 1024, 1600]): string[] => {
    return sizes.map(size => getTransformedUrl(imageUrl, { width: size }));
  },
  
  /**
   * WebP format optimized for web
   */
  webpOptimized: (imageUrl: string, quality: number = 85): string => 
    getTransformedUrl(imageUrl, { format: 'webp', quality }),
}; 