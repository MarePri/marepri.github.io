import { useState, useCallback, lazy, Suspense } from "react";

// ─── Data (small, kept synchronous) ──────────────────────────────────────────
import { OCCASIONS } from "./data/occasions.js";
import { TRENDS } from "./data/trends.js";
import { ARCHETYPES } from "./data/archetypes.js";
import { PROMPTS } from "./data/prompts.js";

// ─── Hooks (always needed, synchronous) ─────────────────────────────────────
import useMemory from "./hooks/useMemory.js";
import useFashionDNA from "./hooks/useFashionDNA.js";
import useCapsuleWardrobe from "./hooks/useCapsuleWardrobe.js";
import useKeyboardShortcuts from "./hooks/useKeyboardShortcuts.js";

// ─── Core UI Components (static — always visible) ───────────────────────────
import Header from "./components/Header.jsx";
import Sidebar from "./components/Sidebar.jsx";
import HomeScreen from "./components/HomeScreen.jsx";
import SplashScreen from "./components/SplashScreen.jsx";
import ShortcutsHelp from "./components/ShortcutsHelp.jsx";
import { SavedOutfitsProvider } from "./hooks/SavedOutfitsContext.jsx";
import { StyleMemoryProvider } from "./hooks/StyleMemoryContext.jsx";

// ─── New Container Components ────────────────────────────────────────────────
import Wardrobe from "./components/Wardrobe.jsx";
import Profile from "./components/Profile.jsx";

// ─── Components (lazy — code-split) ──────────────────────────────────────────
const OutfitGenerator = lazy(() => import("./components/OutfitGenerator.jsx"));
const Discovery = lazy(() => import("./components/Discovery.jsx"));
const TrendsRadar = lazy(() => import("./components/TrendsRadar.jsx"));

// ─── TABS — 5 core destinations ──────────────────────────────────────────────
// "Create" is the hero. Every other tab exists to support outfit generation.
const TABS = [
  { id: "home",    icon: "🏠", label: "Home" },
  { id: "create",  icon: "✨", label: "Create" },
  { id: "wardrobe",icon: "👔", label: "Wardrobe" },
  { id: "discover",icon: "🌟", label: "Discover" },
  { id: "profile", icon: "👤", label: "Profile" },
];

// ─── Loading Skeleton ────────────────────────────────────────────────────────
function TabFallback() {
  return (
    <div className="section-pad">
      <div className="section-title" style={{ opacity: 0.3 }}>Loading…</div>
      <div className="og-skeleton">
        <div className="skeleton-line" />
        <div className="skeleton-line" />
        <div className="skeleton-block" />
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function FashionGPT() {
  const memory = useMemory();

  // First visit → Home. Returning → Create (the hero journey).
  const defaultTab = memory.data.lastTab || (memory.data.lastVisit ? 'create' : 'home');
  const [tab, setTab] = useState(defaultTab);
  const [tryLookNonce, setTryLookNonce] = useState(0);
  const [showSplash, setShowSplash] = useState(true);

  // Persist tab changes to memory
  const handleTabChange = useCallback((nextTab) => {
    setTab(nextTab);
    memory.save({ lastTab: nextTab });
  }, [memory]);

  // Keyboard shortcuts (global navigation)
  const { showHelp, setShowHelp } = useKeyboardShortcuts({
    onNavigate: handleTabChange,
  });

  const dna = useFashionDNA();
  const capsule = useCapsuleWardrobe();

  return (
    <div className="app">
      {/* Splash Screen — first-visit intro */}
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

      {/* Keyboard shortcuts help overlay */}
      {showHelp && <ShortcutsHelp onClose={() => setShowHelp(false)} />}

      <div className="navbar">
        <Header />
        <Sidebar tabs={TABS} activeTab={tab} onTabChange={handleTabChange} />
        <button
          className="nav-shortcuts-btn"
          onClick={() => setShowHelp(true)}
          title="Keyboard shortcuts (?)"
        >
          ⌘?
        </button>
      </div>

      <StyleMemoryProvider>
      <SavedOutfitsProvider>
      <Suspense fallback={<TabFallback />}>
        {/* ── HOME — Streamlined landing ── */}
        {tab === "home" && (
          <HomeScreen
            memory={memory}
            onNavigate={handleTabChange}
          />
        )}

        {/* ── CREATE — Outfit Generator (the hero) ── */}
        {tab === "create" && (
          <OutfitGenerator key={`og-${tryLookNonce}`} memory={memory} />
        )}

        {/* ── WARDROBE — Saved Looks + Capsule + Memory ── */}
        {tab === "wardrobe" && (
          <Wardrobe
            onNavigate={handleTabChange}
            capsuleResult={capsule.capsuleResult}
            capsuleLoading={capsule.capsuleLoading}
            buildCapsule={capsule.buildCapsule}
            onResetCapsule={capsule.reset}
          />
        )}

        {/* ── DISCOVER — Inspiration: Archetypes + Trends ── */}
        {tab === "discover" && (
          <div className="section-pad discover-tab">
            {/* Style Discovery */}
            <Discovery
              onTryLook={(archId) => {
                memory.save({ lastTab: 'create', lastInputs: { ...(memory.data.lastInputs || {}), archetype: archId } });
                setTryLookNonce(c => c + 1);
                handleTabChange('create');
              }}
            />

            <div className="discover-divider">
              <span className="discover-divider-label">Trending Now</span>
            </div>

            {/* Trend Radar */}
            <TrendsRadar
              trends={TRENDS}
              onTryTrend={(trendName) => {
                memory.save({ lastTab: 'create', lastInputs: { ...(memory.data.lastInputs || {}), trend: trendName } });
                handleTabChange('create');
              }}
            />
          </div>
        )}

        {/* ── PROFILE — Style DNA + Evolution ── */}
        {tab === "profile" && (
          <Profile
            archetypes={ARCHETYPES}
            selectedArchetype={dna.selectedArchetype}
            dnaResult={dna.dnaResult}
            dnaLoading={dna.dnaLoading}
            buildFashionDNA={dna.buildFashionDNA}
            onResetDNA={dna.reset}
          />
        )}
      </Suspense>
      </SavedOutfitsProvider>
      </StyleMemoryProvider>
    </div>
  );
}
