/**
 * Slug Generation Utilities
 * Functions for creating URL-safe slugs from business names and other content
 */

/**
 * Generate a URL-safe slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Replace spaces and special characters with hyphens
    .replace(/[\s\W-]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Limit length to 50 characters for database compatibility
    .substring(0, 50)
    // Remove trailing hyphen if truncation created one
    .replace(/-+$/, '');
}

/**
 * Generate a business-specific slug with fallback options
 */
export function generateBusinessSlug(businessName: string, suburb?: string): string {
  const baseSlug = generateSlug(businessName);
  
  // If we have a suburb, consider it for uniqueness
  if (suburb && baseSlug.length < 30) {
    const suburbSlug = generateSlug(suburb);
    return `${baseSlug}-${suburbSlug}`;
  }
  
  return baseSlug;
}

/**
 * Create a slug from multiple parts
 */
export function createCompoundSlug(...parts: string[]): string {
  return parts
    .filter(Boolean)
    .map(part => generateSlug(part))
    .join('-')
    .substring(0, 50)
    .replace(/-+$/, '');
}

/**
 * Validate if a string is a valid slug
 */
export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9-]+$/;
  return (
    slugRegex.test(slug) &&
    !slug.startsWith('-') &&
    !slug.endsWith('-') &&
    !slug.includes('--') &&
    slug.length > 0 &&
    slug.length <= 50
  );
}

/**
 * Sanitize a slug to ensure it meets requirements
 */
export function sanitizeSlug(slug: string): string {
  return generateSlug(slug);
}

export default { generateSlug, generateBusinessSlug, createCompoundSlug, isValidSlug, sanitizeSlug };