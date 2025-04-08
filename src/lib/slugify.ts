import slugify from 'slugify';

/**
 * Generiert einen URL-freundlichen Slug aus einem String
 * @param text Der zu konvertierende Text
 * @returns Ein URL-freundlicher Slug
 */
export function createSlug(text: string): string {
  return slugify(text, {
    lower: true,      // Kleinbuchstaben
    strict: true,     // Sonderzeichen entfernen
    locale: 'de'      // Deutsche Umlaute korrekt behandeln
  });
}

/**
 * Prüft, ob ein Slug gültig ist
 * @param slug Der zu prüfende Slug
 * @returns true wenn der Slug gültig ist, sonst false
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug);
}
