export interface ParsedSmartQuery {
  original: string;
  query: string;
  location?: string;
  extractedFromQuery: boolean;
}

/**
 * Smartly extracts location from a search query string.
 * Patterns: "Keyword in Location", "Keyword near Location", "Keyword at Location"
 */
export function smartParseQuery(input: string): ParsedSmartQuery {
  const cleanInput = input.trim();

  // Regex to find " in ", " near ", " at " (case insensitive)
  // We look for the last occurrence to handle "Coffee in Shop in Brooklyn" correctly
  // Capturing group 1: Everything before the separator
  // Capturing group 2: The separator (ignored)
  // Capturing group 3: Everything after the separator (The Location)
  const locationPattern = /^(.*)\s+(in|near|at)\s+(.*)$/i;

  const match = cleanInput.match(locationPattern);

  if (match) {
    const rawQuery = match[1].trim();
    const rawLocation = match[3].trim();

    // Basic heuristic to avoid false positives (e.g., "Drive in theater")
    // If the location part is very short (less than 3 chars), it might not be a location
    // Exception: "UK", "NY" (2 chars state/country codes)
    if (rawLocation.length >= 2 && rawQuery.length > 0) {
        return {
            original: cleanInput,
            query: rawQuery,
            location: rawLocation,
            extractedFromQuery: true
        };
    }
  }

  // Fallback: Return original query with no location extracted
  return {
    original: cleanInput,
    query: cleanInput,
    location: undefined,
    extractedFromQuery: false
  };
}
