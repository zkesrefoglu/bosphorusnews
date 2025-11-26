/**
 * Add cache-busting timestamp to image URLs to force fresh loads
 * Prevents browser from serving stale cached images
 */
export const bustImageCache = (url: string | null | undefined): string => {
  if (!url) return '';
  
  // If URL already has cache-busting parameter, update it
  if (url.includes('?t=') || url.includes('&t=')) {
    return url.replace(/[?&]t=\d+/, `${url.includes('?') ? '&' : '?'}t=${Date.now()}`);
  }
  
  // Add cache-busting parameter
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}t=${Date.now()}`;
};
