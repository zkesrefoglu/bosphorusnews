import DOMPurify from 'dompurify';

/**
 * Removes category placeholders from article content before display
 * Placeholders like {Life}, {Economy}, etc. are used for categorization
 * but should not be shown to readers
 */
export const stripCategoryPlaceholders = (content: string): string => {
  // Remove category placeholders like {Life}, {Economy}, {FP & Defense}, etc.
  return content.replace(/\s*\{[^}]+\}\s*$/g, "").trim();
};

/**
 * Sanitizes article content for display by removing email addresses,
 * normalizing whitespace, and sanitizing HTML to prevent XSS attacks.
 * This prevents reporter or contact emails from appearing in the published text.
 */
export const sanitizeArticleContent = (content: string): string => {
  const withoutPlaceholders = stripCategoryPlaceholders(content);
  // Basic email pattern removal (case-insensitive)
  const withoutEmails = withoutPlaceholders.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "");
  // Collapse multiple spaces and non-breaking spaces in HTML
  const normalized = withoutEmails
    .replace(/&nbsp;/g, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/>\s+</g, "><");
  // Sanitize HTML to prevent XSS attacks
  return DOMPurify.sanitize(normalized.trim());
};
