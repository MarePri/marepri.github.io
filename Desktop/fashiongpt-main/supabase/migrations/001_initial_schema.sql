-- ───────────────────────────────────────────────────────────────────────────────
-- FashionGPT Supabase Schema
-- Migration: 001_initial_schema
-- Tables: users, style_profiles, wardrobe_items, outfits, saved_outfits
-- ───────────────────────────────────────────────────────────────────────────────

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. EXTENSIONS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. USERS
-- Core user table. In production this should be linked to Supabase Auth.
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url  TEXT,
  auth_user_id TEXT UNIQUE,          -- Supabase Auth user ID (nullable for dev)
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_auth ON users (auth_user_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. STYLE PROFILES
-- One profile per user. Stores archetype, palette, brand affinities.
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS style_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  archetype_id    TEXT NOT NULL,                     -- e.g. "minimalist", "streetwear"
  archetype_name  TEXT NOT NULL,                     -- e.g. "Modern Minimalist"
  palette         JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of color strings
  brand_affinities JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{brand, score, reason}]
  style_tags      JSONB NOT NULL DEFAULT '[]'::jsonb,  -- Array of style tag strings
  confidence      INTEGER NOT NULL DEFAULT 55 CHECK (confidence >= 0 AND confidence <= 100),
  preferences     JSONB,                              -- Free-form user preferences
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)                                    -- One profile per user
);

CREATE INDEX idx_style_profiles_user ON style_profiles (user_id);
CREATE INDEX idx_style_profiles_archetype ON style_profiles (archetype_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. WARDROBE ITEMS
-- Products a user owns or has added to their virtual wardrobe.
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS wardrobe_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id  INTEGER,                               -- References PRODUCTS data ID (nullable for custom items)
  brand       TEXT NOT NULL,
  name        TEXT NOT NULL,
  category    TEXT NOT NULL,                          -- Tops, Bottoms, Dresses, Shoes, etc.
  color       TEXT,
  price       NUMERIC(10, 2) NOT NULL DEFAULT 0,
  image_url   TEXT,
  metadata    JSONB DEFAULT '{}'::jsonb,              -- Extra fields (fit, style tags, trend, etc.)
  notes       TEXT,
  is_owned    BOOLEAN NOT NULL DEFAULT true,          -- Owned vs wishlist
  added_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_wardrobe_user ON wardrobe_items (user_id);
CREATE INDEX idx_wardrobe_category ON wardrobe_items (category);
CREATE INDEX idx_wardrobe_brand ON wardrobe_items (brand);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. OUTFITS
-- Generated or manually composed outfits with scores and critique data.
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS outfits (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,  -- Nullable for anonymous sessions
  name        TEXT,
  occasion    TEXT,
  budget      NUMERIC(10, 2),
  style_goal  TEXT,
  items       JSONB NOT NULL DEFAULT '[]'::jsonb,             -- Array of OutfitItem
  scores      JSONB,                                          -- OutfitScores {Style, Trend, Versatility, ColorHarmony}
  rationale   TEXT,
  critique    JSONB,                                          -- CriticAgentOutput
  approved    BOOLEAN NOT NULL DEFAULT false,
  source      TEXT DEFAULT 'agent',                            -- 'agent', 'manual', 'ai'
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_outfits_user ON outfits (user_id);
CREATE INDEX idx_outfits_occasion ON outfits (occasion);
CREATE INDEX idx_outfits_approved ON outfits (approved);
CREATE INDEX idx_outfits_created ON outfits (created_at DESC);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. SAVED OUTFITS
-- User bookmarks. Links users to outfits they want to keep.
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS saved_outfits (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  outfit_id   UUID NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
  notes       TEXT,
  saved_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, outfit_id)                             -- No duplicate saves
);

CREATE INDEX idx_saved_outfits_user ON saved_outfits (user_id);
CREATE INDEX idx_saved_outfits_outfit ON saved_outfits (outfit_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 7. ROW LEVEL SECURITY
-- Basic RLS policies. In production, these would check auth.uid().
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE style_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wardrobe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_outfits ENABLE ROW LEVEL SECURITY;

-- Users: can only see/update their own record
CREATE POLICY "users_own" ON users
  USING (id = auth.uid() OR auth.uid() IS NULL);

-- Style profiles: user owns their profile
CREATE POLICY "style_profiles_own" ON style_profiles
  USING (user_id = auth.uid() OR auth.uid() IS NULL);

-- Wardrobe items: user owns their items
CREATE POLICY "wardrobe_items_own" ON wardrobe_items
  USING (user_id = auth.uid() OR auth.uid() IS NULL);

-- Outfits: user owns their outfits (or public if no user)
CREATE POLICY "outfits_own" ON outfits
  USING (user_id = auth.uid() OR auth.uid() IS NULL);

-- Saved outfits: user owns their saves
CREATE POLICY "saved_outfits_own" ON saved_outfits
  USING (user_id = auth.uid() OR auth.uid() IS NULL);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 8. AUTO-UPDATE TRIGGER FOR updated_at
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_style_profiles_updated_at
  BEFORE UPDATE ON style_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_wardrobe_items_updated_at
  BEFORE UPDATE ON wardrobe_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_outfits_updated_at
  BEFORE UPDATE ON outfits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
