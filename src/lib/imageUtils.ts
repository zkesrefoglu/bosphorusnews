/**
 * Add cache-busting timestamp to image URLs to force fresh loads
 * Prevents browser from serving stale cached images
 */
export const bustImageCache = (url: string | null | undefined): string => {
  if (!url) return '';
  
  // If URL already has cache-busting parameter, update it
  // Handle ?t= and &t= separately to preserve the correct separator
  if (url.includes('?t=')) {
    return url.replace(/\?t=\d+/, `?t=${Date.now()}`);
  }
  if (url.includes('&t=')) {
    return url.replace(/&t=\d+/, `&t=${Date.now()}`);
  }
  
  // Add cache-busting parameter
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}t=${Date.now()}`;
};
