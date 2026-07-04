import React, { useState, useEffect, useRef, useMemo } from 'react';
import { OutfitSkeleton } from './Skeleton.jsx';
import { OCCASIONS } from '../data/occasions.js';
import { ARCHETYPES } from '../data/archetypes.js';

const ICONS = ['👗', '👔', '👠', '👜', '💍', '✨'];

/**
 * REASONING PIPELINE — Shows FashionGPT's "thinking" process in real time.
 * Each stage has a label, an icon, a live detail line, and a duration.
 * This replaces the generic loading spinner with visible intelligence.
 */
const REASONING_STAGES = [
  {
    id: 'occasion',
    icon: '🎯',
    label: 'Analyzing Occasion',
    getDetail: (ctx) => {
      const occ = OCCASIONS.find(o => o.id === ctx.occasion);
      if (!occ) return `Evaluating dress code, formality level, and context…`;
      return `"${occ.label}" — ${occ.vibe}. Formality: ${occ.formality || 'balanced'}. Context: ${occ.context || 'social'}.`;
    },
  },
  {
    id: 'dna',
    icon: '🧬',
    label: 'Matching Style DNA',
    getDetail: (ctx) => {
      const arch = ARCHETYPES.find(a => a.id === ctx.archetype);
      if (!arch) return `No style DNA set — exploring diverse aesthetic options.`;
      const savedCount = ctx.savedCount || 0;
      return `${arch.name} profile · ${arch.desc || 'versatile aesthetic'}. Cross-referencing ${savedCount} saved looks.`;
    },
  },
  {
    id: 'weather',
    icon: '🌤️',
    label: 'Checking Weather Fit',
    getDetail: (ctx) => {
      if (!ctx.weather) return `No active weather data — planning for neutral conditions.`;
      const w = ctx.weather;
      return `${w.temperature}°C ${w.condition || w.description || ''} — ${w.recommendation || 'adjusting layers accordingly'}.`;
    },
  },
  {
    id: 'color',
    icon: '🎨',
    label: 'Comparing Color Harmony',
    getDetail: (ctx) => {
      const palette = ctx.palette || ['navy', 'white', 'tan', 'olive'];
      const pairCount = Math.min(palette.length * 2, 8);
      return `Testing ${pairCount} color pairings against your palette (${palette.slice(0, 3).join(', ')}…). Prioritizing high-contrast neutral combinations.`;
    },
  },
  {
    id: 'formula',
    icon: '👔',
    label: 'Selecting Outfit Formula',
    getDetail: (ctx) => {
      const budget = ctx.budget ? `€${ctx.budget} budget constraint` : 'open budget';
      return `Comparing silhouette × fabric × layering combinations. ${budget}. Optimizing for versatility across 3 variations.`;
    },
  },
  {
    id: 'confidence',
    icon: '⭐',
    label: 'Scoring Confidence',
    getDetail: (ctx) => `Cross-checking occasion fit, color harmony, style coherence, trend alignment, and weather suitability. Computing composite confidence score.`,
  },
];

/**
 * GeneratingAnimation — Real-time reasoning pipeline.
 *
 * When external stage/progress are provided, it syncs to them.
 * When autonomous (no props), it runs internal timers to simulate the pipeline.
 * The detail line updates every ~1.5s within each stage for a "thinking" feel.
 */
export default function GeneratingAnimation({
  progress: externalProgress,
  stage: externalStage,
  context = {},
}) {
  const [iconIndex, setIconIndex] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [detailIndex, setDetailIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const detailsRef = useRef([]);
  const intervalRef = useRef(null);

  // Derived display values
  const displayStage = externalStage !== undefined && externalStage >= 0
    ? Math.min(externalStage, REASONING_STAGES.length - 1)
    : stageIndex;
  const displayProgress = externalProgress !== undefined
    ? Math.min(externalProgress, 100)
    : progress;

  const currentStage = REASONING_STAGES[displayStage];
  const hasExternalTiming = externalStage !== undefined || externalProgress !== undefined;

  // Generate detail text variations for the current stage (rotating details)
  const stageDetails = useMemo(() => {
    // Generate 3-4 variations of detail text for each stage to create a "thinking" illusion
    const s = REASONING_STAGES[displayStage];
    const variants = [s.getDetail(context)];

    // Add contextual variants
    if (s.id === 'occasion') {
      variants.push('Checking formality gradient: casual → smart casual → semi-formal…');
      variants.push('Mapping occasion to garment archetypes and acceptable silhouettes.');
    }
    if (s.id === 'dna') {
      variants.push('Filtering by previously loved colors, brands, and categories.');
      variants.push('Weighting style signals by confidence (recent saves weighted higher).');
    }
    if (s.id === 'color') {
      const palette = context.palette || ['navy', 'white', 'tan'];
      variants.push(`Evaluating contrast ratios between ${palette[0]}, ${palette[1]}, and accent options…`);
      variants.push('Checking season-appropriate color temperature (warm vs cool tones).');
    }
    if (s.id === 'formula') {
      variants.push('Considering 3-piece vs 4-piece outfit structures. Prioritizing versatility.');
      variants.push('Checking item compatibility: texture mixing and proportion balance.');
    }
    if (s.id === 'confidence') {
      variants.push('Running each candidate through the 5-dimension scoring matrix…');
      variants.push('Comparing against rejection thresholds. Selecting top 3 candidates.');
    }

    // Pad to at least 3 variations for smooth cycling
    while (variants.length < 3) {
      variants.push('Processing…');
    }
    return variants;
  }, [displayStage, context]);

  useEffect(() => {
    detailsRef.current = stageDetails;
    setDetailIndex(0);
  }, [stageDetails]);

  // Icon cycles always
  useEffect(() => {
    const iconInterval = setInterval(() => {
      setIconIndex(prev => (prev + 1) % ICONS.length);
    }, 600);
    return () => clearInterval(iconInterval);
  }, []);

  // Detail text rotates every 1.8s for a "thinking" feel
  useEffect(() => {
    const detailInterval = setInterval(() => {
      setDetailIndex(prev => (prev + 1) % detailsRef.current.length);
    }, 1800);
    return () => clearInterval(detailInterval);
  }, []);

  // Internal stage progression only when no external props
  useEffect(() => {
    if (!hasExternalTiming) {
      const stageStart = Date.now();
      const stageInterval = setInterval(() => {
        const elapsed = Date.now() - stageStart;
        const nextStage = Math.min(Math.floor(elapsed / 2800), REASONING_STAGES.length - 1);
        setStageIndex(nextStage);
      }, 500);

      // Progress bar
      const progInterval = setInterval(() => {
        const elapsed = Date.now() - stageStart;
        const raw = Math.min(elapsed / 12000, 1);
        const eased = raw < 0.5 ? 4 * raw * raw * raw : 1 - Math.pow(-2 * raw + 2, 3) / 2;
        setProgress(Math.min(eased * 100, 99));
      }, 200);

      return () => {
        clearInterval(stageInterval);
        clearInterval(progInterval);
      };
    }
  }, [hasExternalTiming]);

  const detailText = stageDetails[detailIndex % stageDetails.length];

  return (
    <div className="section-pad outfit-gen">
      <div className="og-generating">
        {/* Animated icon */}
        <div className="og-gen-icon">{ICONS[iconIndex]}</div>
        <div className="og-generating-title">FashionGPT is reasoning</div>

        {/* Reasoning stage pipeline */}
        <div className="og-gen-stages">
          {REASONING_STAGES.map((stage, i) => (
            <div
              key={stage.id}
              className={`og-gen-stage ${
                i < displayStage ? 'done' : i === displayStage ? 'active' : 'pending'
              }`}
            >
              <div className="og-gen-stage-dot">
                {i < displayStage ? '✓' : stage.icon}
              </div>
              <div className="og-gen-stage-label">{stage.label}</div>
            </div>
          ))}
        </div>

        {/* Live detail text — changes every 1.8s within each stage */}
        <div className="og-gen-detail">
          <span className="og-gen-detail-icon">{currentStage.icon}</span>
          <span className="og-gen-detail-text">{detailText}</span>
        </div>

        {/* Progress bar */}
        <div className="og-gen-bar-track">
          <div
            className="og-gen-bar-fill"
            style={{ width: `${Math.round(displayProgress)}%` }}
          />
        </div>

        {/* Stage timing hint */}
        <div className="og-gen-status">
          Step {displayStage + 1} of {REASONING_STAGES.length} · {Math.round(displayProgress)}%
        </div>

        {/* Skeletons */}
        <div className="og-generating-looks">
          <OutfitSkeleton />
          <OutfitSkeleton />
          <OutfitSkeleton />
        </div>
      </div>
    </div>
  );
}
