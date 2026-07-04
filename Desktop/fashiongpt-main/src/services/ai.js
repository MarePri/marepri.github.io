import { isOfflineMode, RETRY_CONFIG, API_PROXY_URL } from './config.js';
import { generateOfflineChatResponse, generateOfflineDNA } from './ai.mock.js';

/**
 * Validate AI response contains expected content.
 * @param {any} data - Parsed response
 * @param {string} expectedType - 'text' | 'json'
 * @returns {{ valid: boolean, error?: string }}
 */
function validateResponse(data, expectedType) {
  if (!data) return { valid: false, error: 'Empty response' };
  if (expectedType === 'text') {
    if (typeof data !== 'string') return { valid: false, error: 'Expected string response' };
    if (data.length < 10) return { valid: false, error: 'Response too short' };
    return { valid: true };
  }
  if (expectedType === 'json') {
    if (typeof data !== 'object' || Array.isArray(data)) return { valid: false, error: 'Expected JSON object' };
    return { valid: true };
  }
  return { valid: true };
}

/**
 * Call the backend proxy AI endpoint with retry logic and fallback.
 * @param {string} systemPrompt
 * @param {string} userMessage
 * @param {number} [maxTokens=900]
 * @param {AbortSignal} [signal] - Optional AbortSignal to cancel the request
 * @returns {Promise<string>}
 */
export async function callAI(systemPrompt, userMessage, maxTokens = 900, signal = undefined) {
  if (isOfflineMode()) {
    return generateOfflineChatResponse(userMessage);
  }

  let lastError;

  // Retry loop with exponential backoff
  for (let attempt = 0; attempt <= RETRY_CONFIG.MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      const delay = RETRY_CONFIG.BASE_DELAY_MS * Math.pow(2, attempt - 1);
      console.info(`AI retry ${attempt}/${RETRY_CONFIG.MAX_RETRIES} after ${delay}ms`);
      await new Promise(r => setTimeout(r, delay));
    }

    try {
      const fetchOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt, userMessage, maxTokens }),
      };
      if (signal) {
        fetchOptions.signal = signal;
      }
      const response = await fetch(`${API_PROXY_URL}/api/chat`, fetchOptions);

      if (!response.ok) {
        const errText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HTTP ${response.status}: ${errText}`);
      }

      const data = await response.json();
      const text = data.text || data.content || '';

      // Validate response
      const validation = validateResponse(text, 'text');
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.error}`);
      }

      // Track usage if available
      if (data.usage) {
        console.info(`AI tokens — input: ${data.usage.input_tokens || '?'}, output: ${data.usage.output_tokens || '?'}`);
      }

      return text;
    } catch (err) {
      lastError = err;
      console.warn(`AI call attempt ${attempt + 1} failed:`, err.message);
    }
  }

  // All retries exhausted — fallback to offline
  console.warn('AI call failed after all retries, falling back to offline mode:', lastError);
  return generateOfflineChatResponse(userMessage);
}

/**
 * Parse and validate JSON from AI response.
 * @param {string} text - Raw AI response text
 * @returns {Object|null} Parsed object or null
 */
export function parseAIJSON(text) {
  if (!text) return null;
  try {
    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    const validation = validateResponse(parsed, 'json');
    if (!validation.valid) {
      console.warn('AI JSON validation failed:', validation.error);
      return null;
    }
    return parsed;
  } catch (err) {
    console.warn('AI JSON parse failed:', err);
    return null;
  }
}

/**
 * Generate a fashion DNA analysis with response validation.
 * @param {import('../types/index.js').Archetype} archetype
 * @param {AbortSignal} [signal] - Optional AbortSignal to cancel the request
 * @returns {Promise<Object>}
 */
export async function getFashionDNA(archetype, signal = undefined) {
  if (isOfflineMode()) {
    return generateOfflineDNA(archetype);
  }

  try {
    const system = `You are FashionGPT. Return ONLY valid JSON, no markdown.
    Format: {"headline":"[punchy 1-liner about their style]","missing":"[1 key item they should add]","trend_match":"[current trend that fits their DNA]","confidence":85}`;
    const text = await callAI(system, `Fashion archetype: ${archetype.name}. ${archetype.desc}. Give a personal style assessment.`, undefined, signal);
    const parsed = parseAIJSON(text);
    if (parsed && parsed.headline && parsed.missing && parsed.trend_match) {
      return parsed;
    }
    console.warn('DNA response missing expected fields, using offline fallback');
    return generateOfflineDNA(archetype);
  } catch {
    return generateOfflineDNA(archetype);
  }
}
