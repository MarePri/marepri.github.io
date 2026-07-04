# Resume Bullets — FashionGPT

> Polished descriptions highlighting engineering decisions, architecture, and impact.
> Use these in your resume, portfolio site, or interview talking points.

---

## Lead Description (1–2 sentences for a project entry)

> **FashionGPT** — Deterministic AI stylist with explainable reasoning, built for the Inditex ecosystem. Combines 6 TypeScript rule engines with an optional Claude API integration to generate outfit recommendations that show their full reasoning trace — occasion mapping, color harmony scoring, weather adaptation, and per-dimension confidence — all visible to the user with zero API keys required.

---

## Bullet Points (mix and match for your resume)

### Architecture & Design

- Designed a **dual-mode architecture** (offline rule engine + optional AI proxy) where the full user experience runs deterministically without any API keys — Claude integration is additive, not required
- Built a **6-module deterministic rule engine** (TypeScript) covering style archetypes, occasion-to-formality mapping, weather-based fabric selection, color wheel harmony scoring, outfit generation, and critique — all fully testable without external dependencies
- Implemented a **hash-based SPA with lazy-loaded routes** (94 KB OutfitGenerator chunk via `React.lazy`) using zero router dependencies — 27 components across 5 tabs with context-based state management

### Explainable AI & UX

- Developed a **real-time 6-stage reasoning pipeline UI** that animates through Occasion → DNA → Weather → Color → Formula → Confidence, showing rotating detail text every 1.8s — replaces opaque loading spinners with visible intelligence
- Built an **explainable outfit card** rendering SVG confidence rings, natural-language "why this was chosen" statements, per-dimension score breakdowns (occasion fit, color harmony, style coherence, trend alignment, budget fit), and rejected alternatives with reasons — all client-side, zero API calls
- Created a **CriticScore component** that scores outfits across 6 dimensions with color-coded progress bars, weather-contextualized recommendations, and actionable suggestions — designed to mirror a real styling consultant's feedback format

### Frontend Engineering

- Architected the UI around **vanilla CSS with custom properties** (dark theme, 88 KB CSS bundle) — no UI library, no CSS-in-JS, no runtime styling — keeping the production build at 225 KB main + 95 KB lazy chunk
- Implemented **weather-aware styling** via live OpenWeather API (or built-in Madrid mock) that adjusts fabric recommendations, layering strategy, and color temperature — surfaced inline on both home screen and outfit results
- Built a **capsule wardrobe builder** generating 10-piece cross-brand capsules with total cost calculation and outfit combinatorics — demonstrates complex data transformation in a single React view

### Testing & Quality

- Maintained **34 passing tests** (Vitest + React Testing Library) across hooks, components, and utility modules — clean CI pipeline with TypeScript strict mode and Vite production build as quality gates
- Solved **3 production-blocking merge conflicts** during a cross-branch migration, preserving deliberate feature work (AI status badge, dead-export cleanup) while restoring build integrity
- **Audited and eliminated orphaned code** — removed 6 unused components and hooks, cleaned up 19 missing CSS class definitions, replaced opacity-pulse skeleton animations with gradient-shimmer loading states

### Code Quality & Maintenance

- Refactored a **4200-line CSS monolith** with 14 sectioned rule blocks, responsive breakpoints for 3 viewport ranges, and custom scrollbar styling — organized around feature sections with clear section comments
- Applied **microcopy audit** across the app: softened error states ("Generation Failed" → "Couldn't finish generating"), reworded critique labels ("Needs Work" → "Refinements Suggested"), and added personality to hero CTAs
- Conducted a **full responsive audit** — added breakpoints for <375px (small phones), 421-600px (2-column grids), and 601-768px (tablet landscape) — while maintaining the app's mobile-first 420px core layout
