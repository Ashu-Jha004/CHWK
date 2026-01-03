/**
 * Smart Query Parser
 * Parses natural language search strings into structured data (query + location).
 * Example: "Sushi in New York" -> { query: "Sushi", location: "New York" }
 */

interface ParsedQuery {
  original: string;
  query: string;
  location?: string;
  intent?: string[]; // e.g., ["food", "service"] based on keywords
}

const SEPARATORS = [" in ", " at ", " near ", " around "];
const INTENT_KEYWORDS: Record<string, string[]> = {
  food: ["restaurant", "cafe", "food", "dinner", "lunch", "breakfast", "pizza", "burger"],
  service: ["repair", "salon", "plumber", "electrician", "doctor", "dentist", "gym"],
  shopping: ["store", "shop", "buy", "groceries", "market"],
};

export function parseSmartQuery(input: string): ParsedQuery {
  const cleanInput = input.trim();

  if (!cleanInput) {
    return { original: input, query: "" };
  }

  let query = cleanInput;
  let location: string | undefined;

  // 1. Check for location separators
  // We iterate through separators and try to find the last occurrence to split
  // "Best Pizza in New York in the evening" -> ideally splits at the last "in"?
  // Probably safe to split at last " in " or " near ".

  for (const sep of SEPARATORS) {
    const idx = query.lastIndexOf(sep);
    if (idx !== -1 && idx < query.length - sep.length) {
      // Ensure we don't split if it's at the very start or end (though lastIndexOf handles start)
      const potentialQuery = query.substring(0, idx).trim();
      const potentialLocation = query.substring(idx + sep.length).trim();

      if (potentialLocation.length > 2) { // Minimal location length heuristic
        query = potentialQuery;
        location = potentialLocation;
        break; // Stop after first successful split (prioritize "near", "in" order if we wanted, but loop order matters)
      }
    }
  }

  // 2. Detect Intent (Simple keyword matching)
  const tokens = query.toLowerCase().split(/\s+/);
  const detectedIntents = new Set<string>();

  Object.entries(INTENT_KEYWORDS).forEach(([intent, keywords]) => {
    if (keywords.some(k => tokens.includes(k) || tokens.some(t => t.includes(k)))) {
      detectedIntents.add(intent);
    }
  });

  return {
    original: input,
    query: query,
    location: location,
    intent: Array.from(detectedIntents),
  };
}
