# FashionGPT — Principal Engineer Architectural Review

**Reviewer:** Principal Engineer  
**Date:** June 2026  
**Scope:** Full architecture across all 4 phases (UI, Agents, Database, Services)

---

## Executive Summary

FashionGPT is a **well-structured SPA** with exceptional dependency hygiene (3 runtime deps). The 3-layer architecture (UI → Services/Agents → Database) has clear separation of concerns. However, it shows patterns of an early-stage app **ready for scale but not yet scaled**. The agent layer is production-quality; the UI layer has not yet been connected to it. The single biggest risk is **AI cost exposure** — the Anthropic API key lives in the client bundle, and there are no caching, throttling, or streaming mechanisms.

**Codebase at a glance:**
| Metric | Value |
|---|---|
| Total source files | 51 |
| Total lines | ~4,343 |
| Languages | JS (UI) + TS (infrastructure) |
| Build | 57 modules, 1.6s, zero errors |
| Dependencies | 3 production, 4 dev |
| Connected to UI | Agents ❌, Database ❌, Outfit Generator ❌ |

---

## 1. ⚠️ Future Scaling Issues

### Critical

| Issue | Location | Impact | Why It Matters Now |
|-------|----------|--------|--------------------|
| **No React error boundary** | Entire app | Full crash on render error | A single uncaught error kills the entire experience |
| **No request cancellation** | `useChat`, `useOutfitGenerator` | Stale state updates, wasted AI tokens | Tab switches during AI calls set state on unmounted components |
| **Race condition in `useCapsuleWardrobe`** | `src/hooks/useCapsuleWardrobe.js` | Double-invocation corrupts state | Rapid clicks can trigger parallel `buildCapsule` calls |
| **Duplicated color logic** | `outfit.agent.ts`, `critic.agent.ts`, `utils/outfit.js` | 3 copies of `COLOR_GROUPS` + `computeColorHarmony` | Maintenance burden — fix in one place, breaks in two others |

### Moderate

| Issue | Location | Impact |
|-------|----------|--------|
| **No memoization** | All agents, `utils/outfit.js` | Color harmony scores recomputed on every render; agent scoring re-runs on every call |
| **All hooks instantiated regardless of tab** | `App.jsx` | 5 hooks + their state trees exist even for inactive tabs |
| **No code splitting** | `App.jsx` tab switching | All component code loaded upfront (57 modules in single chunk) |
| **Static product data** | `src/data/products.js` (36 items) | Won't scale to real catalog of hundreds/thousands |
| **CSS in single file** | `src/index.css` | 164 lines manageable now, but breaks under 500+ |
| **State duplicated across JS + TS type systems** | `src/types/index.js` + `src/agents/types.ts` | JS JSDoc types must be kept in sync with TS interfaces manually |

---

## 2. 💰 AI Cost Risks

### Critical

| Risk | Location | Detail |
|------|----------|--------|
| **API key in client bundle** | `src/services/config.js` | `import.meta.env.VITE_ANTHROPIC_API_KEY` is embedded in the built JS. Anyone can extract it and drain your quota. **Fix: backend proxy required.** |
| **No response caching** | `src/services/ai.js` | Same prompt twice = twice the cost. No hash-based dedup. |
| **Full product list injected every AI call** | `useChat.js` line 71-73 | 20 products × full detail string re-sent as context every message. ~2K tokens of context per call just for products. |

### Moderate

| Risk | Location | Detail |
|------|----------|--------|
| **No streaming responses** | `src/services/ai.js` | Full response wait means users feel latency. With streaming, first token arrives in ~500ms instead of 3-8s. |
| **No conversation history trimming** | `useChat.js` | The entire `messages` array grows unbounded. After 10+ exchanges, token cost doubles. |
| **Retries increase cost on failure** | `ai.js` line 40 | 2 retries × exponential backoff means a failing API call costs 3× before falling back to mock. |
| **No per-user rate limiting** | Entire app | Single user can trigger unlimited concurrent API calls. |
| **Abort on tab switch not implemented** | `useChat.js`, `useOutfitGenerator.js` | User switches tab mid-generation → tokens still consumed server-side, result is discarded. |

---

## 3. 🧠 Prompt Engineering Weaknesses

### Critical

| Weakness | Location | Detail |
|----------|----------|--------|
| **System prompt rebuilt on every call** | `useChat.js` line 74 | Full system prompt + product context re-created each message. Should be persistent for the session. |
| **Product context is brute-force concatenation** | `useChat.js` lines 71-77 | `p.name + " by " + p.brand + " (€" + p.price + "..."` — brittle, hard to maintain, no semantic structure. |
| **Outfit detection by keyword substring** | `useChat.js` lines 89-94 | `msg.includes("outfit") || msg.includes("wear") || ...` — false positives on non-outfit queries containing these words. |
| **JSON parsing with string replace** | `useOccasionBuilder.js` line 125 | `text.replace(/```json|```/g, '')` — brittle if model uses ```json with attributes or different formatting. |

### Moderate

| Weakness | Location | Detail |
|----------|----------|--------|
| **No structured output format** | `useChat.js` | Chat prompt produces free text; outfit detection relies on marker string "✦ Outfit built — see below!". |
| **No few-shot examples** | All prompts | No example dialogues to guide response format. |
| **No prompt versioning** | All prompts | System prompt is hard-coded in components. Cannot A/B test or roll back. |
| **No guardrails** | `useChat.js` | No rejection of off-topic queries (math, coding, general Q&A). |
| **No temperature/parameter control** | `callAI()` | `maxTokens` is the only exposed parameter. No temperature, top_p, frequency_penalty. |
| **Inconsistent response format expectation** | Chat = free text, Occasion = JSON, DNA = JSON | Three different output formats across three features. Increases prompt complexity. |

---

## 4. 🔄 State Management Problems

| Problem | Location | Severity |
|---------|----------|----------|
| **No React error boundary** | App root | **High** — any render crash kills app |
| **Race condition: useCapsuleWardrobe** | `useCapsuleWardrobe.js` | **High** — double-click corrupts state |
| **No tab-switch abort** | All async hooks | **High** — stale state updates, wasted tokens |
| **No session persistence** | All hooks | **Medium** — refresh loses chat, outfits, DNA |
| **5 hooks with duplicative patterns** | All hooks | **Medium** — each reimplements loading/error/reset |
| **No useReducer for complex state** | `useChat.js` (messages array) | **Low** — works now, but adding undo/redo requires refactor |
| **All hooks created unconditionally** | `App.jsx` | **Low** — 5 useState calls, negligible cost |

---

## 5. 🎨 UX Bottlenecks

| Bottleneck | Location | Impact |
|------------|----------|--------|
| **No loading skeletons** | All components | Animated dots give no sense of progress or structure |
| **No streaming chat** | `ChatPanel.jsx` | User waits 3-8s for full response with zero feedback |
| **No error recovery** | All hooks | "Something went wrong" with no retry suggestion |
| **No weather UI** | No component | Weather service exists but is not visible to user |
| **Fixed 420px width, no media queries** | `index.css` | Desktop users see narrow centered column |
| **No visual product imagery** | `ProductRecommendations.jsx` | Emoji-only (👗, 👖, 👟) — no actual product images |
| **No onboarding flow** | `App.jsx` | First-time users get no tutorial or explanation |
| **No keyboard shortcuts** | `ChatPanel.jsx` | Enter to send is the only shortcut |
| **No offline/status indicator** | No component | User doesn't know if AI is real or mock mode |
| **No conversation history across sessions** | `useChat.js` | Refresh = empty chat |

---

## 6. 📋 Prioritized Roadmap

### Prioritization Criteria
1. **User value:** Does this directly improve the user's experience?
2. **Engineering complexity:** How much effort to implement correctly?
3. **Competitive advantage:** Does this differentiate FashionGPT?

---

### Version 1 — "Foundation & Reliability" (Now)

**Theme:** Fix the critical bugs, prevent data loss, and make the existing experience production-quality.

| Priority | Feature | User Value | Complexity | Advantage | Rationale |
|----------|---------|------------|------------|-----------|-----------|
| P0 | **React Error Boundary** wrapping `<FashionGPT />` | 🔴 Crash prevention | 🟢 1 file, 20 lines | None | Without this, any render error is a hard crash |
| P0 | **AbortController in all async hooks** on tab switch + unmount | 🔴 Stops wasted tokens | 🟢 Add AbortController, 3 hooks | 🟡 Professional feel | Prevents state-update-on-unmounted-component warnings and saves AI costs |
| P0 | **Fix useCapsuleWardrobe race condition** | 🔴 Prevents corrupt state | 🟢 Add `isMounted` or disable button | None | Basic correctness |
| P0 | **Extract color harmony to shared module** | 🟡 Maintenance | 🟢 `src/utils/colorHarmony.ts`, 80 lines | None | DRY principle — duplicating bug-prone logic is unacceptable |
| P1 | **useMemo on scoring computations** in agents | 🟡 Performance | 🟢 Memoize computed scores | None | Prevents recalculation on re-renders |
| P1 | **Memoize component exports** via `React.memo` | 🟡 Performance | 🟢 Wrap 4-5 pure presentational components | None | Reduces unnecessary re-renders |
| P1 | **LocalStorage persistence** for chat + DNA + capsule | 🟢 Retains state across refresh | 🟢 `usePersistedState` hook, 30 lines | 🟢 User expectation | Users expect conversations to survive refresh |
| P2 | **Loading skeletons** instead of animated dots | 🟢 Shows structure while loading | 🟢 Skeleton components, 40 lines each | 🟡 Polished feel | Huge UX improvement for minimal code |

---

### Version 2 — "Smart & Fast" (Next)

**Theme:** AI cost optimization, chat performance, and prompt engineering maturity.

| Priority | Feature | User Value | Complexity | Advantage | Rationale |
|----------|---------|------------|------------|-----------|-----------|
| P0 | **Backend proxy for API key** (Cloudflare Worker or simple Node server) | 🔴 Security — stops key theft | 🟡 Worker, ~50 lines | 🟢 Only secure way to ship | Without this, V1 is vulnerable. **This is the single most important infrastructure change.** |
| P0 | **AI response caching** by prompt hash | 🟢 Instant repeat results | 🟢 In-memory `Map` + LocalStorage | 🟢 Cost reduction | Same prompt twice = 0 cost second time. Saves 20-40% on AI bills. |
| P0 | **Conversation history trimming** (keep last N messages) | 🔴 Prevents token bloat | 🟢 Trim to `MAX_HISTORY = 20` on send | 🟢 Cost control | 50-message chat costs 10x more than 5-message chat |
| P1 | **Streaming chat responses** via Anthropic streaming API | 🟢 First token in 500ms | 🟡 SSE parser + buffer state | 🟢 Major UX differentiator | Streaming is table-stakes for chat UX |
| P1 | **Prompt versioning system** — extract all prompts to `src/prompts/` | 🟡 A/B testable | 🟢 Move strings to config files | 🟡 Continuous improvement | Enables prompt iteration without code changes |
| P1 | **Structured output format** — switch all AI calls to JSON mode | 🟢 Reliable parsing | 🟡 Unified response schema | 🟢 Deterministic | Eliminates fragile `includes("outfit")` heuristics |
| P1 | **Input sanitization** for AI prompts | 🟢 Safety | 🟢 Strip/escape injection patterns | 🟢 Production requirement | Prevents prompt injection |
| P2 | **Rate limiter** — max 1 concurrent AI call per session | 🟡 Prevents abuse | 🟢 Queue mechanism, 60 lines | 🟢 Cost control | Stops runaway token consumption |

---

### Version 3 — "Platform & Differentiation" (Future)

**Theme:** Scale to production user base, differentiate from competitors, unlock the full agent pipeline.

| Priority | Feature | User Value | Complexity | Advantage | Rationale |
|----------|---------|------------|------------|-----------|-----------|
| P0 | **Connect Outfit Generator to UI** — wire `useOutfitGenerator` to a dedicated tab | 🟢 Full AI pipeline live | 🟢 1 component, ~100 lines | 🟢 Core differentiator | The agent pipeline (Profile→Wardrobe→Weather→Outfit→Critic) is built but invisible. This **is** the product. |
| P0 | **Connect Database persistence** — save outfits, profiles, wardrobe | 🟢 History across devices | 🟡 Wire repos to hooks | 🟢 Data moat | Without persistence, every session starts from zero |
| P1 | **Code splitting by tab** — `React.lazy` + `Suspense` | 🟢 Faster initial load | 🟢 `React.lazy(() => import(...))` | 🟡 Professional | 57-module bundle loads all code upfront |
| P1 | **Dynamic product catalog from DB** — replace static `products.js` with `wardrobe_items` query | 🟢 Real inventory | 🔴 New data pipeline + admin | 🟢 Only way to scale | 36 static products cannot support real use |
| P1 | **Weather UI card** — show temperature + recommendation in ChatPanel | 🟢 Context-aware styling | 🟢 1 component, ~30 lines | 🟢 Unique feature | No competitor shows weather-driven outfit reasoning |
| P1 | **User onboarding flow** — archetype quiz → first outfit → tour | 🟢 First-run delight | 🟡 Multi-step modal | 🟢 Conversion | First impression determines retention |
| P2 | **Routing library** — deep-linkable tabs (`/chat`, `/trends`, `/dna`) | 🟢 Shareable URLs | 🟢 1 dep + config | 🟢 Platform maturity | Enables back button, history, bookmarks |
| P2 | **Web worker for agent processing** — move orchestration off main thread | 🟡 Non-blocking UI | 🔴 Worker + message passing | 🟢 Performance edge | Heavy scoring computations won't freeze UI |
| P2 | **Design system** — CSS modules + token-driven components | 🟢 Consistent UI | 🔴 Refactor all 10 components | 🟢 Foundation for growth | Single CSS file is tech debt |
| P3 | **Real product images** — product catalog with image URLs | 🟢 Visual shopping | 🔴 Image hosting + CDN | 🟢 Retail expectation | Emoji-only is a demo constraint |
| P3 | **A/B testing framework** — prompt variants, scoring weights, UI layouts | 🟡 Data-driven decisions | 🔴 Experiment infra | 🟢 Continuous improvement | Without this, all changes are guesses |

---

## 7. 🔗 Dependency Map: How Features Connect

```
V1 (Foundation)
├── React Error Boundary ───────────────── protect App.jsx
├── AbortController ────────────────────── useChat, useOutfitGenerator, useOccasionBuilder
├── Fix useCapsuleWardrobe race ────────── useCapsuleWardrobe.js
├── Extract colorHarmony ───────────────── outfit.agent, critic.agent, utils/outfit.js
├── useMemo + React.memo ───────────────── scoring functions, components
└── LocalStorage persistence ───────────── all hooks

V2 (Smart & Fast)
├── Backend proxy ──────────────────────── ai.js → new service
├── AI response cache ──────────────────── ai.js (callAI)
├── History trimming ───────────────────── useChat.js
├── Streaming ──────────────────────────── ai.js + ChatPanel.jsx
├── Prompt versioning ──────────────────── src/prompts/*.ts
├── Structured outputs ─────────────────── all prompts
├── Input sanitization ─────────────────── all user-facing hooks
└── Rate limiter ───────────────────────── ai.js

V3 (Platform)
├── Connect OutfitGenerator to UI ──────── new component + App.jsx tab
├── Connect Database ───────────────────── wire repositories → hooks
├── Code splitting ─────────────────────── App.jsx
├── Dynamic catalog ────────────────────── db/wardrobe_items → UI
├── Weather UI ─────────────────────────── new component
├── Onboarding ─────────────────────────── new flow
├── Routing ────────────────────────────── React Router
├── Web worker ─────────────────────────── agent orchestration
├── Design system ──────────────────────── CSS overhaul
├── Product images ─────────────────────── data layer
└── A/B testing ────────────────────────── experimentation infra
```

---

## 8. 🎯 Recommendations (Immediate Actions)

### This Week (V1 P0)
1. **Add a React Error Boundary** — 20 lines, prevents total crashes. Wrap `<FashionGPT />` in `<ErrorBoundary>`.
2. **Extract color harmony** from 3 files into `src/utils/colorHarmony.ts` — 80 lines, eliminates a known maintenance trap.
3. **Add AbortController to `callAI`** — pass signal through, abort on hook cleanup.

### This Month (V1 P1–P2)
4. **Add LocalStorage persistence** — create a `usePersistedState(key, initial)` hook. Apply to chat, DNA, and capsule.
5. **Add loading skeletons** — replace the `thinking-dots` with skeleton placeholders that match the final layout.
6. **Memoize agent scoring** — wrap `computeOutfitScores`, `computeColorHarmony`, `critiqueOutfit` in `useMemo` where called from React.

### This Quarter (V2 P0)
7. **Deploy a backend proxy** for the Anthropic API key. A Cloudflare Worker or Vercel edge function is sufficient. This is **non-negotiable** before any production launch.
8. **Add AI response caching** — hash the system + user prompt, store in a Map. TTL 5 minutes.

### This Half (V3 P0)
9. **Connect the Outfit Generator** — build a dedicated tab that calls `useOutfitGenerator`. This is the product's core differentiator and it's currently invisible.
10. **Connect the Database** — wire DB persistence so outfits, profiles, and saved items survive sessions.

---

## 9. 📊 Risk Matrix

| Risk | Likelihood | Impact | Priority | Mitigation |
|------|------------|--------|----------|------------|
| API key theft from client bundle | **High** | **Critical** (cost + abuse) | **P0 V2** | Backend proxy |
| React rendering crash | **Medium** | **High** (blank screen) | **P0 V1** | Error boundary |
| AI token cost explosion | **Medium** | **High** (surprise bill) | **P0 V2** | Cache + rate limit + trim |
| Stale state on unmounted component | **High** | **Medium** (warnings + bugs) | **P0 V1** | AbortController |
| Duplicated color logic diverges | **Medium** | **Medium** (wrong scores) | **P0 V1** | Shared module |
| No session persistence | **High** | **Medium** (lost work) | **P1 V1** | LocalStorage |
| Concurrent AI calls overload | **Low** | **Medium** (timeouts) | **P2 V2** | Rate limiter |

---

## 10. ✅ What's Already Strong

Before focusing on what to fix, it's worth noting what's **genuinely well-engineered**:

1. **Layer isolation** — UI never imports agents or DB directly. The service layer (outfitGenerator.ts) is the sole bridge.
2. **Dependency footprint** — 3 runtime deps is exceptional for a modern SPA.
3. **Agent architecture** — typed I/O contracts, no agent-to-agent calls, graceful degradation. Production-quality pattern.
4. **Null-safe DB client** — returns `null` when Supabase is unconfigured; all repos guard with `if (!client) return`. No errors in offline mode.
5. **Consistent repository pattern** — all 5 DB repos follow identical findById/create/update/remove signatures.
6. **Checks and balances** — OutfitAgent scores the outfit; CriticAgent independently critiques it. The orchestrator returns both.
7. **Offline-first culture** — AI mock responses, mock weather, null DB client. The app never errors due to missing credentials.
8. **Build hygiene** — `tsc --noEmit` clean, `vite build` 57 modules in 1.6s. No warnings.
