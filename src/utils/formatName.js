/**
 * Converts a name to title case (first letter of each word capitalized)
 * @param {string} name - The name to format
 * @returns {string} - The formatted name
 */
export const formatName = (name) => {
  if (!name || typeof name !== 'string') {
    return '';
  }

  return name
    .toLowerCase()
    .trim()
    .split(/\s+/) // Split on one or more whitespace characters
    .filter((word) => word.length > 0) // Remove empty strings
    .map((word) => {
      // Handle words with hyphens or apostrophes
      if (word.includes('-') || word.includes("'")) {
        return word
          .split(/(['-])/)
          .map((part) => {
            // Don't capitalize separators (-, ')
            if (part === '-' || part === "'") return part;
            // Capitalize first letter of each part
            if (part.length > 0) {
              return part.charAt(0).toUpperCase() + part.slice(1);
            }
            return part;
          })
          .join('');
      }

      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};
