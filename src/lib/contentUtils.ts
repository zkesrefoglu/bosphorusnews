/**
 * Removes category placeholders from article content before display
 * Placeholders like {Life}, {Economy}, etc. are used for categorization
 * but should not be shown to readers
 */
export const stripCategoryPlaceholders = (content: string): string => {
  // Remove category placeholders like {Life}, {Economy}, {FP & Defense}, etc.
  return content.replace(/\s*\{[^}]+\}\s*$/g, '').trim();
};
