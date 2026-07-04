# FashionGPT — Product Analysis & Architecture Proposal

**Author:** Chief Product Officer & Lead AI Architect  
**Date:** June 18, 2026  
**Status:** Analysis complete — awaiting implementation

---

## Executive Summary

After a thorough codebase audit of 51 source files across the full stack (UI, Agent Layer, Services, Database), this document identifies the critical gap between what FashionGPT **could be** and what it **currently is**.

**The single biggest problem:** FashionGPT is architected as a chatbot with fashion features. It should be a personal stylist platform with chat as one input method.

**The opportunity:** The agent layer (Profile → Wardrobe → Outfit → Critic) is fully built and production-quality. The database layer (5 repositories, full SQL schema) is fully built. Neither is connected to the UI. The core product is **invisible to users**.

---

## Part 1: Feature Inventory — What Users Will Do

### 🔁 Will Use Repeatedly (High-Frequency Features)

| Feature | Current State | Frequency Signal |
|---------|--------------|-----------------|
| **Outfit Generation** | Agent pipeline exists, NO UI | User generates looks daily |
| **Style DNA / Quiz** | Basic UI, static archetypes | User retakes as style evolves |
| **Save Outfits** | DB schema exists, NO UI | User builds collection over time |
| **Rate Outfits** | Does not exist anywhere | Feeds personalization engine |
| **Daily Dashboard** | Does not exist | Morning habit anchor |
| **Weather-Aware Styling** | Service exists, NO UI | Daily utility |
| **Trend Radar** | Read-only list | Weekly check-in |

### 🧪 Will Try Once and Abandon (Low Retention Features)

| Feature | Current State | Why Users Abandon |
|---------|--------------|-------------------|
| **Free-Form Chat** | Main interface | No structure, no repeatability, no progress |
| **Capsule Wardrobe Builder** | Static mock, no persistence | Fun once, no ongoing value |
| **Occasion Builder** | Grid of 8 occasions, AI call | No memory of past looks |
| **"Style Pedro Pascal"** | Mock response | Novelty only |

### 🚫 Missing Entirely (Critical Gaps)

| Missing Feature | Impact |
|----------------|--------|
| **Outfit Generation UI** | Core product is invisible |
| **Rating System** | No user signal → no personalization |
| **Save/Favorite** | No collection building |
| **Style Memory** | Every session starts from zero |
| **Feedback Loop** | AI never learns from user |
| **Personalization** | All users get same experience |
| **Home/Dashboard** | No daily reason to open app |
| **Shopping Intelligence** | No product explanations |
| **3-Look Comparison** | Single static outfit |
| **Regeneration** | Can't iterate on looks |

---

## Part 2: UX Flow Analysis — Current vs. Proposed

### Current Flow (Chatbot Paradigm)

```
User asks a question
       ↓
AI responds with text (+ possibly outfit card)
       ↓
Conversation continues (or user leaves)
       ↓
NO MEMORY — next visit starts blank
```

**Problems:**
- User must know what to ask — high friction
- No structured interaction — feels aimless
- No progress tracking — no reason to return
- AI response quality varies wildly
- No way to improve future recommendations

### Proposed Flow (Stylist Platform)

```
┌──────────────────────────────────────────────────────────┐
│                    DAILY DASHBOARD                        │
│  Today's Look  │  Weather 23°C  │  Saved: 12  │  Score  │
│  ═══════════════════════════════════════════════════════ │
│  [Generate New Look]  [My Closet]  [Style DNA]  [Trends] │
└──────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────┐
│              OUTFIT GENERATION (Step Flow)                │
│                                                          │
│  Step 1: What's the occasion?                             │
│  ○ Summer Wedding    ○ Office Meeting    ○ Date Night    │
│  ○ Weekend Brunch    ○ Festival          ○ Custom...     │
│                                                          │
│  Step 2: What's your budget?                              │
│  [€_____] or [No Limit]                                  │
│                                                          │
│  Step 3: Any style preferences?                           │
│  [Minimal] [Bold] [Romantic] [Professional] [Surprise Me]│
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │  ⚡ GENERATING 3 LOOKS...                        │    │
│  │                                                  │    │
│  │  LOOK A: "The Minimalist Wedding Guest" ⋆⋆⋆⋆    │    │
│  │  [Item 1] [Item 2] [Item 3]                     │    │
│  │  Style: 92 | Occasion: 88 | Weather: 85        │    │
│  │  [Save] [Why This?] [Regenerate]                │    │
│  │                                                  │    │
│  │  LOOK B: "The Romantic Garden Party" ⋆⋆⋆       │    │
│  │  [Item 1] [Item 2] [Item 3]                     │    │
│  │  Style: 85 | Occasion: 90 | Weather: 82        │    │
│  │  [Save] [Why This?] [Regenerate]                │    │
│  │                                                  │    │
│  │  LOOK C: "The Edgy City Mix" ⋆⋆⋆               │    │
│  │  [Item 1] [Item 2] [Item 3]                     │    │
│  │  Style: 78 | Occasion: 82 | Weather: 90        │    │
│  │  [Save] [Why This?] [Regenerate]                │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  ✓ Saved to My Looks  |  ⭐ Rate this session            │
└──────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────┐
│              "WHY THIS OUTFIT" (Critic View)              │
│                                                          │
│  Look A: "The Minimalist Wedding Guest"                  │
│                                                          │
│  Style Score:      92/100  ━━━━━━━━━━━━━━━━━━━━          │
│  Occasion Fit:     88/100  ━━━━━━━━━━━━━━━━━             │
│  Weather Match:    85/100  ━━━━━━━━━━━━━━━               │
│  Color Harmony:    90/100  ━━━━━━━━━━━━━━━━━━━           │
│  Confidence:       89/100  ━━━━━━━━━━━━━━━━━             │
│                                                          │
│  💡 Why This Works:                                      │
│  "The ivory linen blazer pairs with champagne satin      │
│   for a soft, elegant contrast. The block-heel mule      │
│   keeps you comfortable through ceremony to reception."  │
│                                                          │
│  💰 Shopping Intelligence:                               │
│  • Budget pick: €12.99 Ribbed Tank (Pull&Bear)          │
│  • Premium pick: €99 Cashmere Sweater (Massimo Dutti)   │
│  • Trending: Linen Blazer +92% this season               │
└──────────────────────────────────────────────────────────┘
```

---

## Part 3: Proposed Screen Architecture

### Screen 1: Daily Dashboard (Home)
```
┌─────────────────────────────────┐
│  FASHIONGPT                     │
│  Good morning, [Name] ✦         │
│                                 │
│  ┌──────┐ ┌──────┐ ┌──────┐   │
│  │23°C  │ │Wedding│ │Saved │   │
│  │☀️    │ │🎯 Jun │ │12    │   │
│  │Milan │ │ 28th  │ │Looks │   │
│  └──────┘ └──────┘ └──────┘   │
│                                 │
│  "Your Style Score is 86"      │
│  ↑ 3 points this week          │
│                                 │
│  Today's Inspiration            │
│  ┌─────────────────────────┐   │
│  │ Linen Blazer look       │   │
│  │ for today's weather     │   │
│  │ [Generate] [Regenerate] │   │
│  └─────────────────────────┘   │
│                                 │
│  Trending Now                   │
│  Quiet Luxury ↑94%             │
│  Linen Everything ↑91%         │
│                                 │
│  [New Look] [My Closet] [DNA]  │
└─────────────────────────────────┘
```

### Screen 2: Outfit Generator (Multi-Step)
See Part 2 flow above — dedicated screen with:
- Step indicator (1-4)
- Occasion picker
- Budget slider
- Style preference selector
- 3-look comparison grid
- Per-look save/why/regenerate actions
- Critic score breakdown modal

### Screen 3: Style DNA (Interactive Profile)
```
┌─────────────────────────────────┐
│  YOUR STYLE DNA                 │
│                                 │
│  ┌──────────────────────────┐  │
│  │    🧬 MODERN MINIMALIST   │  │
│  │    Your core archetype    │  │
│  └──────────────────────────┘  │
│                                 │
│  Strengths                      │
│  ✓ Color coordination           │
│  ✓ Investment pieces            │
│                                 │
│  Growth Areas                   │
│  ○ Occasion dressing            │
│  ○ Accessorizing                │
│                                 │
│  Your Palette                   │
│  ● Black  ● White  ● Beige     │
│  ● Navy   ● Camel              │
│                                 │
│  Recommended Formulas           │
│  • Blazer + Tee + Trousers     │
│  • Midi Dress + Mules + Tote   │
│                                 │
│  [Update DNA Quiz]              │
└─────────────────────────────────┘
```

### Screen 4: My Saved Looks (Collection)
```
┌─────────────────────────────────┐
│  MY LOOKS                       │
│  ┌──── ──── ──── ──── ───┐    │
│  │ [Filter by occasion]    │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌──────────────────────────┐  │
│  │ Wedding Guest · Jun 15  │  │
│  │ 4 items · €215          │  │
│  │ ★★★★☆                   │  │
│  │ [Wear Again] [Remove]   │  │
│  └──────────────────────────┘  │
│  ┌──────────────────────────┐  │
│  │ Date Night · Jun 12      │  │
│  │ 3 items · €98            │  │
│  │ ★★★★★                    │  │
│  │ [Wear Again] [Remove]    │  │
│  └──────────────────────────┘  │
└─────────────────────────────────┘
```

### Screen 5: Shopping Intelligence (Coming Soon)
```
┌─────────────────────────────────┐
│  SHOP THE LOOK                  │
│                                 │
│  "Summer Wedding Guest"        │
│                                 │
│  Fluid Linen Blazer · €89.95   │
│  💡 Core piece — anchors look  │
│  💰 Budget: Ribbed Tank €25.95 │
│  💎 Premium: Cashmere €99      │
│  📈 Trending: +92% this season │
│  🔄 Alternative: Cord Shirt    │
│                                 │
│  High-Waist Trousers · €49.95  │
│  💡 Neutral base — versatile   │
│  ...                            │
└─────────────────────────────────┘
```

---

## Part 4: Component Architecture

### New Component Tree

```
App.jsx
├── ErrorBoundary (exists)
├── DailyDashboard ★ NEW
│   ├── WeatherWidget ★ NEW
│   ├── UpcomingOccasion ★ NEW
│   ├── StyleScoreCard ★ NEW (trending score over time)
│   ├── SavedLookPreview ★ NEW
│   └── TodayInspiration ★ NEW
├── OutfitGenerator ★ NEW (replaces occasion builder)
│   ├── StepIndicator ★ NEW
│   ├── OccasionPicker ★ NEW (enhanced from Dashboard)
│   ├── BudgetSlider ★ NEW
│   ├── StylePreferenceSelector ★ NEW
│   ├── LookComparisonGrid ★ NEW
│   │   └── OutfitCard (exists, enhanced)
│   │       ├── ProductRecommendations (exists, enhanced)
│   │       ├── CriticScoreBreakdown ★ NEW
│   │       ├── SaveButton ★ NEW
│   │       ├── RatingStars ★ NEW
│   │       └── RegenerateButton ★ NEW
│   └── SessionRatingModal ★ NEW
├── StyleDNA (redesign)
│   ├── ArchetypeQuiz (redesign)
│   ├── StyleProfileCard ★ NEW
│   ├── StrengthWeaknessChart ★ NEW
│   ├── PaletteDisplay (extracted from FashionDNA)
│   ├── BrandAffinityList ★ NEW
│   └── OutfitFormulaList ★ NEW
├── MySavedLooks ★ NEW
│   ├── LookCard ★ NEW
│   ├── FilterBar ★ NEW
│   └── LookDetailModal ★ NEW
├── ShoppingIntelligence ★ NEW
│   ├── ProductCardEnhanced ★ NEW
│   ├── BudgetAlternatives ★ NEW
│   ├── TrendingIndicator ★ NEW
│   └── WhyThisRecommendation ★ NEW
├── TrendsRadar (exists, minor updates)
├── CapsuleWardrobe (exists, connect to agent pipeline)
├── ChatPanel (demoted — optional input method)
│   └── useChat (demoted — not primary flow)
├── Sidebar (update — new nav structure)
└── Header (exists)
```

### Data Flow Architecture

```
┌─────────────────────────────────────────────────────┐
│                    UI LAYER                          │
│                                                      │
│  DailyDashboard ← useStyleMemory ★NEW               │
│  OutfitGenerator ← useOutfitGenerator (exists)      │
│  StyleDNA ← useFashionDNA (exists, enhanced)        │
│  MySavedLooks ← useSavedOutfits ★NEW                │
│  ShoppingIntel ← useShoppingIntelligence ★NEW        │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│                  SERVICE LAYER                       │
│                                                      │
│  outfitGenerator.ts (exists)                        │
│  styleMemory.ts ★NEW (feedback aggregator)           │
│  shoppingIntelligence.ts ★NEW                        │
│  weather.ts (exists)                                 │
│  ai.js (exists, needs refactor)                      │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│                  AGENT LAYER                         │
│                                                      │
│  ProfileAgent (exists, enhanced memory)             │
│  WardrobeAgent (exists)                             │
│  OutfitAgent (exists, enhanced for 3-look gen)      │
│  CriticAgent (exists, enhanced scoring)             │
│  MemoryAgent ★NEW (style memory integration)         │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│                  DATA LAYER                          │
│                                                      │
│  DB Repositories (5 exist, UNCONNECTED)             │
│  LocalStorage (session persistence)                  │
│  Products (static, needs dynamic path)              │
└─────────────────────────────────────────────────────┘
```

---

## Part 5: Agent Architecture — Enhanced

### Current Agent Pipeline (works, invisible)

```
ProfileAgent → WardrobeAgent → OutfitAgent → CriticAgent
```

### Proposed Agent Pipeline

```
                     ┌──────────────┐
                     │  MemoryAgent  │ ★ NEW
                     │  (user history)│
                     └──────┬───────┘
                            │
                     ┌──────▼───────┐
                     │ ProfileAgent  │
                     │ (enhanced)    │
                     └──────┬───────┘
                            │
                     ┌──────▼───────┐
                     │ WardrobeAgent │
                     └──────┬───────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
       ┌──────▼──────┐ ┌───▼────┐ ┌───▼────┐
       │OutfitAgent A│ │Outfit B│ │Outfit C│ ★ 3 variants
       └──────┬──────┘ └───┬────┘ └───┬────┘
              │             │          │
       ┌──────▼─────────────▼──────────▼─────┐
       │         CriticAgent                  │
       │  (scores all 3, ranks them)         │
       └──────┬──────────────────────────────┘
              │
       ┌──────▼──────┐
       │ ShoppingIntel│ ★ NEW
       │  (explain,   │
       │   alternatives│
       └──────────────┘
```

### MemoryAgent (New) — Data Schema

```typescript
interface StyleMemory {
  userId: string;
  likedOutfits: OutfitRef[];     // Saved + high-rated
  dislikedOutfits: OutfitRef[];  // Low-rated or rejected
  favoriteColors: string[];      // Aggregated from saved looks
  favoriteStyles: string[];      // Aggregated style tags
  favoriteBrands: BrandAffinity[];
  recentOccasions: string[];     // Last 10 occasions
  styleScoreHistory: number[];   // Weekly scores
  preferredCategories: string[]; // Most-used categories
}
```

### CriticAgent — Enhanced Scoring

```typescript
interface CriticScore {
  styleScore: number;       // 0-100: Does it match user's style DNA?
  occasionScore: number;    // 0-100: Appropriate for the occasion?
  weatherScore: number;     // 0-100: Suitable for current weather?
  colorHarmony: number;     // 0-100: Colors work together?
  confidence: number;       // 0-100: Overall system confidence
  reasoning: string;        // Human-readable explanation
  alternatives: string[];   // Suggested improvements
}
```

---

## Part 6: Feature Prioritization by User Value

### Tier 1 (Foundation — Week 1-2) — Core Product Launch

| # | Feature | Effort | User Value | Retention Impact |
|---|---------|--------|------------|-----------------|
| 1 | **Outfit Generator UI** — wire `useOutfitGenerator` to dedicated tab | 2h | 🔴 Critical | Makes core product visible |
| 2 | **3-Look Generation** — modify OutfitAgent to produce 3 variants | 4h | 🔴 Critical | Comparison drives engagement |
| 3 | **Save Outfits** — LocalStorage + UI button | 2h | 🔴 Critical | Collection = return reason |
| 4 | **Critic Score Display** — show scores with why explanation | 3h | 🔴 Critical | Trust + education |
| 5 | **Weather Integration UI** — show weather context in generation | 1h | 🔴 Critical | Daily utility hook |
| 6 | **Rating System** — ⭐⭐⭐⭐⭐ on saved looks | 2h | 🟡 High | Feeds personalization |

**Result after Tier 1:** FashionGPT generates 3 looks with scores, weather context, save/rate. **MVP of the personal stylist product.**

### Tier 2 (Personalization — Week 3-4)

| # | Feature | Effort | User Value | Retention Impact |
|---|---------|--------|------------|-----------------|
| 7 | **Style Memory** — track liked/disliked, favorite colors/styles/brands | 6h | 🔴 Critical | Zero personalization → full personalization |
| 8 | **Memory-Enhanced Generation** — feed memory into OutfitAgent | 4h | 🔴 Critical | "Improves over time" |
| 9 | **Style DNA Redesign** — strengths, weaknesses, formulas, brands | 4h | 🟡 High | Self-discovery |
| 10 | **My Saved Looks screen** — filter, sort, review | 3h | 🟡 High | Collection management |

**Result after Tier 2:** The product remembers users. Every generation improves. Style DNA becomes a living profile.

### Tier 3 (Habit — Week 5-6)

| # | Feature | Effort | User Value | Retention Impact |
|---|---------|--------|------------|-----------------|
| 11 | **Daily Dashboard** — weather, today's look, saved count, score | 6h | 🔴 Critical | Morning habit anchor |
| 12 | **Style Score Over Time** — chart of improvement | 3h | 🟡 High | Progression = stickiness |
| 13 | **Shopping Intelligence** — explanations, alternatives, budget/premium | 8h | 🟡 High | Smart purchasing |
| 14 | **Occasion Calendar** — upcoming events | 4h | 🟢 Medium | Anticipation = engagement |
| 15 | **Notifications** — weather change → outfit suggestion | 3h | 🟢 Medium | Re-engagement |

**Result after Tier 3:** FashionGPT becomes a daily habit. Users check it in the morning for outfit inspiration.

### Tier 4 (Platform — Week 7-8)

| # | Feature | Effort | User Value | Retention Impact |
|---|---------|--------|------------|-----------------|
| 16 | **Database persistence** — connect 5 repos | 4h | 🔴 Critical | Cross-device sync |
| 17 | **User accounts** — Supabase Auth | 8h | 🟡 High | Personalization identity |
| 18 | **Backend proxy deployment** — security | 3h | 🟢 Security | Production readiness |
| 19 | **Dynamic product catalog** — from DB | 6h | 🟡 High | Scale to real inventory |
| 20 | **Multi-brand shopping cart** | 6h | 🟢 Medium | Commerce |

---

## Part 7: Critical Product Rules (Non-Negotiable)

### Rule 1: No Chatbot-First Design
- Chat is an **input method**, not the product
- The product is a structured stylist platform
- ChatPanel becomes optional, not primary

### Rule 2: Every Interaction Has a Purpose
- Every screen moves user toward: better outfits, stronger style identity, smarter purchases
- No dead-end features (looking at you, Capsule Wardrobe)

### Rule 3: Feedback Loop on Everything
- Rate every outfit → feeds Style Memory
- Save/favorite → trains the model
- Reject/regenerate → negative signal

### Rule 4: Explain Everything
- Every recommendation has a "Why This Works"
- Every score is broken down
- Every product has an explanation

### Rule 5: Progress Over Time
- Style Score grows as user rates more
- Style Memory deepens with usage
- Recommendations improve visibly

---

## Part 8: What to Keep vs. What to Replace

### ✅ Keep (Refactor, Don't Rewrite)

| Component | Reason |
|-----------|--------|
| Agent pipeline (4 agents) | Production quality, typed, testable |
| Orchestrator | Clean coordination, error handling |
| `useOutfitGenerator` hook | Ready to wire — just needs UI |
| `outfitGenerator.ts` service | Full flow coordinator — excellent |
| DB repositories (5) | Complete CRUD, null-safe |
| DB SQL schema | Well-designed, has RLS |
| Weather service | Real + mock fallback |
| Error Boundary | Already in place |
| Skeleton components | Ready for use |
| Product data (36 items) | Good starting catalog |

### 🔄 Redesign (Keep Core, Change UX)

| Component | What to Change |
|-----------|---------------|
| `App.jsx` | Tab structure → new nav, dashboard as home |
| `ChatPanel.jsx` | Demote from primary to secondary |
| `Dashboard.jsx` | Replace with OutfitGenerator |
| `FashionDNA.jsx` | Add strengths/weaknesses/formulas |
| `OutfitCard.jsx` | Add critic scores, save, rate, regenerate |
| `Sidebar.jsx` | New navigation structure |

### 🗑️ Deprecate or Replace

| Component | Reason |
|-----------|--------|
| `useOccasionBuilder.js` | Replaced by `useOutfitGenerator` |
| `useCapsuleWardrobe.js` | Fun demo, no retention value |
| Current chat-first prompt flow | Use structured inputs instead |

---

## Part 9: Implementation Phasing

### Phase 1 (Week 1): The Outfit Experience
- [ ] Create `/dashboard` home screen
- [ ] Build OutfitGenerator component with multi-step flow
- [ ] Modify OutfitAgent to produce 3 looks
- [ ] Show critic scores with explanations
- [ ] Add save/rate/regenerate to OutfitCard
- [ ] Wire `useOutfitGenerator` to UI

### Phase 2 (Week 2): Personalization
- [ ] Build MemoryAgent
- [ ] Create Style Memory service
- [ ] Feed memory into outfit generation
- [ ] Build "My Saved Looks" screen
- [ ] Enhance Style DNA with strengths/weaknesses

### Phase 3 (Week 3): Habit & Stickiness
- [ ] Daily Dashboard with weather + today's look
- [ ] Style Score history chart
- [ ] Shopping Intelligence
- [ ] Occasion calendar

### Phase 4 (Week 4): Platform
- [ ] Connect Supabase persistence
- [ ] User accounts
- [ ] Deploy backend proxy
- [ ] Dynamic product catalog

---

## Part 10: Metrics to Track

| Metric | Current | Target | What It Measures |
|--------|---------|--------|-----------------|
| DAU (Daily Active Users) | N/A | >40% weekly | Habit formation |
| Outfits Generated/Week | 0 | >5/user | Core feature usage |
| Save Rate | 0 | >40% | Quality signal |
| Rating Submission Rate | 0 | >60% | Feedback loop health |
| Style Score Growth | 0 | +5/week | Personalization improvement |
| Return Rate Day 7 | N/A | >50% | Retention |
| Dashboard Opens/Week | N/A | >7 | Habit anchor |

---

## Conclusion

FashionGPT has a **world-class agent architecture** that is completely invisible to users. The engineering team has built a rocket engine but no cockpit. The transformation from chatbot to personal stylist requires:

1. **Make the engine visible** — wire the agent pipeline to a structured UI
2. **Add feedback loops** — rating, saving, rejection signals
3. **Add memory** — personalization that improves over time
4. **Add a daily reason to open the app** — dashboard + weather + today's look

The codebase is healthy. The architecture is sound. The product vision is clear. What's missing is the **UX that makes the magic feel like magic**.

**FashionGPT is not a chatbot. FashionGPT is a personal stylist. Start building it like one.**
