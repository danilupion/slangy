// Helper function to convert to a given separator style
export const toSeparator = (str: string, separator: string) =>
  str
    .replace(/[_\-./:]+/g, ' ') // Convert common separators to spaces
    .replace(/\s+/g, ' ') // Convert multiple spaces to a single space
    .replace(/([\w])\s+([\w])/g, (_, p1, p2) => p1 + separator + p2) // Replace space between words with the desired separator
    .replace(/[\w]([A-Z])/g, (m) => m[0] + separator + m[1]) // Handle camelCasing
    .toLowerCase(); // Convert everything to lowercase

// camelCase
export const toCamelCase = (str: string) =>
  str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase());

// PascalCase
export const toPascalCase = (str: string) => {
  const camel = toCamelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
};

// snake_case
export const toSnakeCase = (str: string) => toSeparator(str, '_');

// kebab-case
export const toKebabCase = (str: string) => toSeparator(str, '-');

// space case
export const toSpaceCase = (str: string) => toSeparator(str, ' ');

// dot.case
export const toDotCase = (str: string) => toSeparator(str, '.');

// slash/case
export const toSlashCase = (str: string) => toSeparator(str, '/');

// Start Case
export const toStartCase = (str: string) =>
  str.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.substring(1).toLowerCase());
