/**
 * Extract budget amount from user text.
 * Supports formats: "€100", "100 euro", "under 150", "budget 200", "$100"
 * @param {string} text
 * @returns {number|null} Budget in EUR, or null if no budget mentioned
 */
export function extractBudget(text) {
  if (!text) return null;
  const lower = text.toLowerCase();

  // Match: "€100", "100€", "$100", "100$"
  const symbolMatch = lower.match(/[€$£](\d+)/) || lower.match(/(\d+)[€$£]/);
  if (symbolMatch) return parseFloat(symbolMatch[1]);

  // Match: "100 euro", "100 euros"
  const euroMatch = lower.match(/(\d+)\s*euros?/);
  if (euroMatch) return parseFloat(euroMatch[1]);

  // Match: "under 150", "budget 200", "max 300", "spend 250"
  const budgetMatch = lower.match(/(?:under|budget|max|spend|limit|less than|up to)\s+(\d+)/);
  if (budgetMatch) return parseFloat(budgetMatch[1]);

  return null;
}
