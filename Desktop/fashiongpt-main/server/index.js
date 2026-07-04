// ─── FashionGPT Backend Proxy ─────────────────────────────────────────────────
// Express server that proxies AI requests to Anthropic.
// The API key lives here (ANTHROPIC_API_KEY in .env) — never in the client.
//
// Routes:
//   POST /api/chat    → Anthropic /v1/messages (chat)
//   POST /api/outfit  → Anthropic /v1/messages (outfit generation)
//   POST /api/dna     → Anthropic /v1/messages (fashion DNA)
//
// Start: npm run dev   (or: node --watch index.js)

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

// ─── Middleware ──────────────────────────────────────────────────────────────

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} → ${res.statusCode} (${ms}ms)`);
  });
  next();
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Forward a request to the Anthropic API.
 * @param {string} systemPrompt
 * @param {string} userMessage
 * @param {number} maxTokens
 * @returns {Promise<{content: string, usage: object|null}>}
 */
async function callAnthropic(systemPrompt, userMessage, maxTokens) {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured on the server');
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: maxTokens || 900,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Anthropic HTTP ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const content = data.content?.[0]?.text || '';
  const usage = data.usage || null;

  return { content, usage };
}

// ─── Routes ──────────────────────────────────────────────────────────────────

/**
 * POST /api/chat — Chat with the AI stylist.
 * Body: { systemPrompt: string, userMessage: string, maxTokens?: number }
 */
app.post('/api/chat', async (req, res) => {
  try {
    const { systemPrompt, userMessage, maxTokens } = req.body;
    if (!userMessage) {
      return res.status(400).json({ error: 'userMessage is required' });
    }
    const result = await callAnthropic(systemPrompt || '', userMessage, maxTokens);
    res.json(result);
  } catch (err) {
    console.error(`[POST /api/chat] Error:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/outfit — Generate an outfit recommendation.
 * Body: { systemPrompt: string, userMessage: string, maxTokens?: number }
 */
app.post('/api/outfit', async (req, res) => {
  try {
    const { systemPrompt, userMessage, maxTokens } = req.body;
    if (!userMessage) {
      return res.status(400).json({ error: 'userMessage is required' });
    }
    const result = await callAnthropic(systemPrompt || '', userMessage, maxTokens);
    res.json(result);
  } catch (err) {
    console.error(`[POST /api/outfit] Error:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/dna — Generate a fashion DNA analysis.
 * Body: { systemPrompt: string, userMessage: string, maxTokens?: number }
 */
app.post('/api/dna', async (req, res) => {
  try {
    const { systemPrompt, userMessage, maxTokens } = req.body;
    if (!userMessage) {
      return res.status(400).json({ error: 'userMessage is required' });
    }
    const result = await callAnthropic(systemPrompt || '', userMessage, maxTokens);
    res.json(result);
  } catch (err) {
    console.error(`[POST /api/dna] Error:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Health Check ────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', keyConfigured: !!ANTHROPIC_API_KEY });
});

// ─── Start Server ────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`FashionGPT backend proxy running on http://localhost:${PORT}`);
  if (!ANTHROPIC_API_KEY) {
    console.warn('⚠ ANTHROPIC_API_KEY is not set. Set it in server/.env or as an environment variable.');
  }
});
