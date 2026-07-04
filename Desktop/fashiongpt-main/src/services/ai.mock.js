import { generateOfflineOutfit } from '../utils/outfit.js';

/**
 * Track mock AI usage for monitoring.
 * @type {{ chatCalls: number, dnaCalls: number, tokensSaved: number }}
 */
export const mockUsage = {
  chatCalls: 0,
  dnaCalls: 0,
  tokensSaved: 0,
};

const AVG_TOKENS_PER_CHAT = 450;
const AVG_TOKENS_PER_DNA = 300;

/**
 * Generate a mock AI chat response using templates.
 * Used when no API key is available.
 * @param {string} userMessage
 * @returns {string}
 */
export function generateOfflineChatResponse(userMessage) {
  mockUsage.chatCalls++;
  mockUsage.tokensSaved += AVG_TOKENS_PER_CHAT;

  const msg = userMessage.toLowerCase();
  const hasBudget = msg.includes('€') || msg.includes('euro') || msg.includes('under') || msg.includes('budget');

  // Occasion-based responses
  if (msg.includes('wedding')) {
    return 'For a summer wedding, think lightweight fabrics and refined silhouettes. A flowy midi dress in ivory or champagne is timeless — pair it with strappy gold sandals and a structured clutch. Add a linen blazer for the ceremony and you\'re set. The key is balancing elegance with breathability. ✦ Outfit built — see below!';
  }
  if (msg.includes('barcelona') || (msg.includes('city') && msg.includes('break'))) {
    return 'Barcelona calls for effortless chic. Start with wide-leg linen trousers in sand, a ribbed tank in white, and chunky sneakers for all-day walking. Throw on an overshirt for the evening breeze. Cross-body bag keeps your hands free for tapas and photos. ✦ Outfit built — see below!';
  }
  if (msg.includes('pedro pascal')) {
    return 'Pedro Pascal\'s style is relaxed masculinity with a sharp edge — think tailored but not stiff. A structured blazer over a simple tee, wide-leg trousers, and leather boots. The trick is confidence in the silhouette. Go for earthy tones with one statement piece. ✦ Outfit built — see below!';
  }
  if (msg.includes('first date') || msg.includes('date night')) {
    return 'A first date outfit should say "I made an effort without trying too hard." Try a draped dress in a soft neutral — it moves beautifully and feels approachable. Block-heel mules add polish without sacrificing walkability. A small cross-body bag keeps it practical. ✦ Outfit built — see below!';
  }
  if (msg.includes('capsule')) {
    return 'A great capsule is about versatility per piece. I\'d recommend starting with 10 carefully chosen items: 2 tops, 2 bottoms, 1 dress, 1 blazer, 1 knit, 2 shoes (one practical, one elevated), and 1 bag. Stick to a cohesive color story — neutrals with one accent color — so everything mixes effortlessly.';
  }
  if (msg.includes('trending') || msg.includes('summer')) {
    return 'This summer is all about texture play: linen everywhere, crochet details, and the quiet luxury movement continuing strong. Chocolate brown has replaced camel as the go-to neutral. Baggy denim is still dominating, and we\'re seeing a shift toward investment pieces over fast fashion. It\'s a thoughtful season.';
  }
  if (msg.includes('neutral') || msg.includes('neutrals')) {
    return 'A neutral palette is a superpower — it simplifies decision-making and always looks intentional. Build with: cream, sand, chocolate, and slate. Mix textures (linen, knit, leather) to keep it interesting. Add one unexpected element — a gold earring, a sculptural bag — for quiet impact.';
  }
  if (msg.includes('streetwear')) {
    return 'Streetwear is about attitude and silhouette. Go for baggy carpenter jeans, a vintage graphic tee, and an oversized bomber. Chunky sneakers anchor the look. The key is proportion — one loose piece balanced with something fitted. Add a cap or chain for personal flair. ✦ Outfit built — see below!';
  }
  if (msg.includes('festival')) {
    return 'Festival style means practical meets expressive. Start with a crochet mini dress or cut-out bodysuit with flare jeans. Platform boots handle the terrain. A chain shoulder bag keeps valuables safe. Layer a sheer shirt for evening. This is your moment to play with texture and color. ✦ Outfit built — see below!';
  }
  if (msg.includes('office') || msg.includes('professional') || msg.includes('work')) {
    return 'Modern office style is about refined ease. A fluid linen blazer over a silk blouse, paired with tailored wide-leg trousers. A block-heel mule keeps it polished. Structured tote for the essentials. The palette: ecru, navy, and camel — professional but not boring. ✦ Outfit built — see below!';
  }

  // Fallback: generic response
  const budgetNote = hasBudget ? ' I\'ve kept the total within your budget.' : '';
  return `That's a great direction. For your request, I'd recommend building around a hero piece — something that sets the tone — then layering complementary items around it. Focus on fit first, then color harmony${budgetNote}. Aim for one statement element balanced with classic staples. ✦ Outfit built — see below!`;
}

/**
 * Generate mock FashionDNA analysis.
 * @param {import('../types/index.js').Archetype} archetype
 * @returns {Object}
 */
export function generateOfflineDNA(archetype) {
  mockUsage.dnaCalls++;
  mockUsage.tokensSaved += AVG_TOKENS_PER_DNA;

  const profiles = {
    minimalist: { headline: 'You believe less is more — and you\'re right.', missing: 'A sculptural leather belt', trend_match: 'Quiet Luxury', confidence: 88 },
    streetwear: { headline: 'Your style speaks before you do.', missing: 'A standout bomber jacket', trend_match: 'Baggy Denim Revival', confidence: 85 },
    romantic: { headline: 'You dress for the mood, the moment, and the magic.', missing: 'A drapy silk blouse', trend_match: 'Crochet & Knits', confidence: 82 },
    professional: { headline: 'You understand that dressing well is a form of respect.', missing: 'A cashmere wrap', trend_match: 'Tailored Relaxation', confidence: 90 },
  };
  return profiles[archetype.id] || { headline: 'Your style is refined and intentional', missing: 'A statement shoe', trend_match: 'Quiet Luxury', confidence: 82 };
}
