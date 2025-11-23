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
 * Sanitizes article content for display by also removing email addresses.
 * This prevents reporter or contact emails from appearing in the published text.
 */
export const sanitizeArticleContent = (content: string): string => {
  const withoutPlaceholders = stripCategoryPlaceholders(content);
  // Basic email pattern removal (case-insensitive)
  const withoutEmails = withoutPlaceholders.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "");
  // Collapse multiple spaces that might be left behind
  return withoutEmails.replace(/\s{2,}/g, " ").trim();
};
