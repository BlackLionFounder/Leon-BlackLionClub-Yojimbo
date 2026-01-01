/*
  # Quests and Multiplier Effects System

  1. New Tables
    - `active_effects`
      - `id` (uuid, primary key)
      - `player_id` (uuid, references players)
      - `effect_type` (text) - type of effect (xp_multiplier, coin_multiplier, etc.)
      - `multiplier` (integer) - multiplier value (1, 2, 3, 4, 5)
      - `activated_at` (timestamptz) - when the effect was activated
      - `expires_at` (timestamptz) - when the effect expires
      - `created_at` (timestamptz)
    
    - `quests`
      - `id` (uuid, primary key)
      - `title` (text) - quest name
      - `description` (text) - quest description
      - `requirements` (jsonb) - quest requirements as JSON
      - `rewards` (jsonb) - quest rewards as JSON
      - `order_index` (integer) - display order
      - `is_active` (boolean) - whether quest is currently available
      - `created_at` (timestamptz)
    
    - `player_quests`
      - `id` (uuid, primary key)
      - `player_id` (uuid, references players)
      - `quest_id` (uuid, references quests)
      - `progress` (integer) - current progress value
      - `completed_at` (timestamptz) - when quest was completed
      - `claimed_at` (timestamptz) - when rewards were claimed
      - `created_at` (timestamptz)
    
    - `player_cards`
      - `id` (uuid, primary key)
      - `player_id` (uuid, references players)
      - `card_type` (text) - type of card (single, double, triple, quadruple, quintuple)
      - `quantity` (integer) - number of cards owned
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Players can read their own active effects
    - Players can insert their own active effects (when using cards)
    - All users can read active quests
    - Players can read and update their own quest progress
    - Players can read and update their own cards

  3. Indexes
    - Index on active_effects for efficient queries by player and expiration
    - Index on player_quests for player progress lookups
    - Index on player_cards for inventory lookups
*/

-- Create active_effects table
CREATE TABLE IF NOT EXISTS active_effects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  effect_type text NOT NULL,
  multiplier integer NOT NULL CHECK (multiplier >= 1 AND multiplier <= 5),
  activated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_active_effects_player_expires 
  ON active_effects(player_id, expires_at DESC, multiplier DESC);

ALTER TABLE active_effects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can view own active effects"
  ON active_effects FOR SELECT
  TO authenticated
  USING (auth.uid() = player_id);

CREATE POLICY "Players can insert own active effects"
  ON active_effects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Players can delete expired effects"
  ON active_effects FOR DELETE
  TO authenticated
  USING (auth.uid() = player_id);

-- Create quests table
CREATE TABLE IF NOT EXISTS quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  requirements jsonb NOT NULL DEFAULT '{}',
  rewards jsonb NOT NULL DEFAULT '{}',
  order_index integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active quests"
  ON quests FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Create player_quests table
CREATE TABLE IF NOT EXISTS player_quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  quest_id uuid NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  progress integer DEFAULT 0,
  completed_at timestamptz,
  claimed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(player_id, quest_id)
);

CREATE INDEX IF NOT EXISTS idx_player_quests_player 
  ON player_quests(player_id, quest_id);

ALTER TABLE player_quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can view own quest progress"
  ON player_quests FOR SELECT
  TO authenticated
  USING (auth.uid() = player_id);

CREATE POLICY "Players can insert own quest progress"
  ON player_quests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Players can update own quest progress"
  ON player_quests FOR UPDATE
  TO authenticated
  USING (auth.uid() = player_id)
  WITH CHECK (auth.uid() = player_id);

-- Create player_cards table
CREATE TABLE IF NOT EXISTS player_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  card_type text NOT NULL CHECK (card_type IN ('single', 'double', 'triple', 'quadruple', 'quintuple')),
  quantity integer DEFAULT 0 CHECK (quantity >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(player_id, card_type)
);

CREATE INDEX IF NOT EXISTS idx_player_cards_player 
  ON player_cards(player_id);

ALTER TABLE player_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can view own cards"
  ON player_cards FOR SELECT
  TO authenticated
  USING (auth.uid() = player_id);

CREATE POLICY "Players can insert own cards"
  ON player_cards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Players can update own cards"
  ON player_cards FOR UPDATE
  TO authenticated
  USING (auth.uid() = player_id)
  WITH CHECK (auth.uid() = player_id);

-- Insert some starter quests
INSERT INTO quests (title, description, requirements, rewards, order_index) VALUES
  ('First Steps', 'Reach level 5', '{"type": "reach_level", "value": 5}', '{"coins": 500, "cards": [{"type": "single", "quantity": 2}]}', 1),
  ('Getting Stronger', 'Reach level 10', '{"type": "reach_level", "value": 10}', '{"coins": 1000, "cards": [{"type": "double", "quantity": 1}]}', 2),
  ('Tap Master', 'Tap 1000 times', '{"type": "total_taps", "value": 1000}', '{"coins": 750, "cards": [{"type": "single", "quantity": 3}]}', 3),
  ('Warrior', 'Win 10 combats', '{"type": "combat_wins", "value": 10}', '{"coins": 1500, "cards": [{"type": "triple", "quantity": 1}]}', 4),
  ('Champion', 'Reach level 25', '{"type": "reach_level", "value": 25}', '{"coins": 5000, "cards": [{"type": "quadruple", "quantity": 1}]}', 5)
ON CONFLICT DO NOTHING;