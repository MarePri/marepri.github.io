# FashionGPT — Full Roadmap & TODO

> **Legend:** ✅ Done | 🔜 Next session | 📋 Soon | 🔮 Future

---

## 🔜 NEXT SESSION — Connect the Full AI Pipeline

These are the **highest value, lowest effort** tasks. The code is already written — just needs UI wiring.

### Outfit Generator (the core product)

- [ ] **Add Outfit Generator tab to App.jsx**
  - Import `useOutfitGenerator` from hooks
  - Add a 6th tab (`id: "outfit", icon: "👔", label: "Outfit"`)
  - Create a simple wrapper component that calls the hook and displays the result
  - Reuse existing `OutfitCard` and `Skeleton.OutfitSkeleton`
  - *Time: ~15 min*

- [ ] **Connect weather to UI**
  - Show current weather + temperature in the outfit generator tab
  - Display weather icon + recommendation text
  - *Time: ~30 min*

- [ ] **Update Navbar** to include the new Outfit tab
  - Already uses tab-driven rendering, just add to `TABS` array
  - *Time: 2 min*

---

## 📋 V1 — Foundation & Polish (medium effort)

### Error handling & resilience

- [ ] **Add retry UI feedback** — show "Retry failed, using offline mode" banner
  - Currently silently falls back to mock — user should know
  - *Time: ~30 min*

- [ ] **Add request deduplication** — prevent double-send on rapid clicks
  - Disable buttons while loading (already partially done)
  - Add `isPending` ref to prevent concurrent calls
  - *Time: ~20 min*

### State & persistence

- [ ] **LocalStorage persistence** for chat history, DNA results, capsule wardrobe
  - Create a `usePersistedState(key, initial)` hook
  - Apply to `useChat`, `useFashionDNA`, `useCapsuleWardrobe`
  - *Time: ~45 min*

- [ ] **Session restore on refresh** — reload last used tab + state
  - Save active tab to localStorage
  - On mount, restore from saved state
  - *Time: ~20 min*

### UX polish

- [ ] **Loading skeletons everywhere** — replace all `.thinking-dots` with `Skeleton` components
  - Chat loading → `ChatSkeleton`
  - Outfit generating → `OutfitSkeleton`
  - DNA loading → `DnaSkeleton`
  - *Time: ~20 min*

- [ ] **Add error recovery suggestions**
  - When API fails, show a helpful message ("Check your internet" or "API key not set — running in offline mode")
  - *Time: ~30 min*

- [ ] **Keyboard shortcuts** — Cmd/Ctrl+Enter to send, Esc to cancel
  - *Time: ~15 min*

### AI cost & security

- [ ] **Start the backend proxy** when running dev
  - Add `concurrently` to root package.json: `"dev": "concurrently \"vite\" \"node server/index.js\""`
  - *Time: ~10 min*

---

## 📋 V2 — Smart & Fast (significant effort)

### AI optimization

- [ ] **AI response caching** by prompt hash
  - In-memory `Map` with TTL (5 min)
  - Saves 20-40% on repeated prompts
  - *Time: ~1h*

- [ ] **Conversation history trimming** — keep only last 20 messages
  - Add `MAX_HISTORY = 20` constant
  - Trim array before sending to AI
  - *Time: ~15 min*

- [ ] **Streaming chat responses** via SSE
  - Use Anthropic streaming API
  - Show tokens as they arrive (much better UX)
  - *Time: ~2h*

- [ ] **Input sanitization** — strip/escape prompt injection attempts
  - *Time: ~30 min*

### Prompt engineering

- [ ] **Extract all prompts** to `src/prompts/` config files
  - System prompts, few-shot examples, response format specs
  - Enables versioning and A/B testing
  - *Time: ~45 min*

- [ ] **Switch all AI calls to structured JSON output**
  - Replace fragile `includes("outfit")` with deterministic `type` field
  - Unified response schema across all features
  - *Time: ~1h*

- [ ] **Add guardrails** — reject off-topic queries (math, coding, etc.)
  - *Time: ~30 min*

### Performance

- [ ] **Code splitting by tab** — `React.lazy` + `Suspense`
  - Chat, DNA, Capsule, Occasion, Trends all loaded on demand
  - *Time: ~30 min*

- [ ] **Add `useMemo` for expensive scoring computations**
  - Color harmony, outfit scores recompute on every render
  - *Time: ~20 min*

- [ ] **Web worker for agent processing** — offload heavy orchestration off main thread
  - *Time: ~3h*

---

## 🔮 V3 — Platform & Differentiation (major effort)

### Core product launch

- [ ] **Full Outfit Generator flow in UI**
  - Multi-step: Profile → Occasion → Weather → Outfit → Critique
  - Step indicator + progress bar
  - *Time: ~4h*

- [ ] **User onboarding flow**
  - Archetype quiz → first outfit generation → tour of features
  - *Time: ~4h*

### Database & persistence

- [ ] **Connect all 5 DB repositories to UI**
  - Save outfits, DNA profiles, capsules, favorites
  - Load on session start
  - *Time: ~3h*

- [ ] **Dynamic product catalog** — replace static `products.js` with `wardrobe_items` DB query
  - *Time: ~4h*

- [ ] **User accounts** — login/register via Supabase Auth
  - *Time: ~8h*

### Infrastructure

- [ ] **Deploy backend proxy** to production (Cloudflare Worker or Vercel edge)
  - *Time: ~3h*

- [ ] **Deploy frontend** to Vercel/Netlify
  - *Time: ~2h*

- [ ] **Add analytics** (PostHog or Plausible)
  - Track feature usage, AI costs, error rates
  - *Time: ~2h*

### Features

- [ ] **Weather UI card** in ChatPanel — show temp + recommendation
  - *Time: ~1h*

- [ ] **Real product images** — fetch from Inditex API or static CDN
  - *Time: ~8h*

- [ ] **Routing library** — deep-linkable tabs (`/chat`, `/trends`, `/dna`)
  - *Time: ~2h*

- [ ] **Mobile responsive** — break out of 420px fixed width
  - Media queries for tablet + desktop
  - *Time: ~3h*

- [ ] **Dark/light mode toggle**
  - *Time: ~1h*

### Design system

- [ ] **CSS Modules** — component-scoped styles instead of single `index.css`
  - *Time: ~4h*

- [ ] **Design tokens** — variables for spacing, typography, colors
  - *Time: ~2h*

### Testing

- [ ] **Add Vitest + React Testing Library**
  - Unit tests for agents, services, utils
  - Component tests for key UI
  - *Time: ~6h*

- [ ] **E2E tests** with Playwright
  - *Time: ~4h*

### A/B testing

- [ ] **Prompt variant experiments**
  - Different system prompts, scoring weights
  - Track which generates better outfits
  - *Time: ~6h*

---

## 🏁 Summary by Effort

| Effort | Items | Total time |
|--------|-------|------------|
| 🔜 **Next session** (~45 min) | 3 | Connect outfit generator, weather UI, navbar |
| 📋 **V1** (~5h) | 11 | Persistence, skeletons, error recovery, keyboard shortcuts, proxy auto-start |
| 📋 **V2** (~12h) | 12 | AI caching, streaming, prompt extraction, code splitting, guardrails |
| 🔮 **V3** (~60h) | 16 | DB connect, user accounts, deployment, analytics, design system, testing, A/B |
