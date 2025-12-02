/**
 * Generate URLs for sharing articles
 * 
 * Social media crawlers don't execute JavaScript, so they can't see 
 * dynamically set meta tags in SPAs. We use the og-image edge function
 * which returns proper HTML with meta tags and redirects users to the article.
 */

const SUPABASE_PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;

/**
 * Get the URL to share on social media platforms
 * Uses edge function for proper OG tags
 */
export const getShareUrl = (slug: string): string => {
  return `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/og-image?slug=${encodeURIComponent(slug)}`;
};

/**
 * Get the direct article URL (for copy-to-clipboard, canonical links)
 */
export const getArticleUrl = (slug: string): string => {
  return `${window.location.origin}/article/${slug}`;
};
