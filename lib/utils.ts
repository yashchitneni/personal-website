/**
 * Combines class names into a single string.
 * @function cn
 * @param {...(string | undefined)} inputs - The class names to combine.
 * @returns {string} The combined class names.
 */
export function cn(...inputs: (string | undefined)[]): string {
    return inputs.filter(Boolean).join(' ');
}