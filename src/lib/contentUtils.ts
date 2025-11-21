/**
 * Removes category placeholders from article content before display
 * Placeholders like {Life}, {Economy}, etc. are used for categorization
 * but should not be shown to readers
 */
export const stripCategoryPlaceholders = (content: string): string => {
  // Remove category placeholders like {Life}, {Economy}, {FP & Defense}, etc.
  return content.replace(/\s*\{[^}]+\}\s*$/g, '').trim();
};

/**
 * Formats category names for display
 * Converts 'Türkiye' to 'TÜRKİYE' for display purposes
 */
export const formatCategoryDisplay = (category: string): string => {
  if (category === 'Türkiye') {
    return 'TÜRKİYE';
  }
  return category;
};
