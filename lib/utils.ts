import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines class names into a single string.
 * @function cn
 * @param {...(string | undefined)} inputs - The class names to combine.
 * @returns {string} The combined class names.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}