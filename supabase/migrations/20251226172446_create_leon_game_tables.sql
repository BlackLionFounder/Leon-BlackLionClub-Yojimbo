/*
  # Leon & the Black Lion Club: Yojimbo - Game Database Schema

  ## Overview
  Creates the complete database structure for the Leon Telegram Mini App tap-to-earn game.

  ## Tables Created

  ### 1. players
  Core player profile table storing:
  - `id` (uuid, primary key) - Unique player identifier
  - `telegram_id` (text, unique) - Telegram user ID from WebApp
  - `username` (text) - Player display name
  - `level` (integer) - Current level (starts at 1)
  - `current_exp` (numeric) - EXP accumulated in current level
  - `total_exp` (numeric) - Lifetime EXP earned
  - `coins` (numeric) - In-game currency
  - `unspent_ability_points` (integer) - Available points to allocate
  - `total_ability_points_earned` (integer) - Lifetime AP earned (base + referral bonuses)
  - `referral_bonus_points` (integer) - Permanent AP bonus from referrals (max 50)
  - `referral_count` (integer) - Number of successful referrals
  - `rejuvenation_potions` (integer) - Potions earned from 6+ referrals
  - `referred_by` (uuid, foreign key) - ID of player who referred this user
  - `has_allocated_points` (boolean) - Whether player has spent any AP (unlocks Patrol)
  - `last_health_regen` (timestamptz) - Last time health regenerated
  - `last_stamina_regen` (timestamptz) - Last time stamina regenerated
  - `last_energy_regen` (timestamptz) - Last time energy regenerated
  - `created_at` (timestamptz) - Account creation time
  - `updated_at` (timestamptz) - Last update time

  ### 2. player_stats
  Six core stats with current/max values and invested points:
  - `player_id` (uuid, primary key, foreign key)
  - `health_base` (integer) - Base health value (default 10)
  - `health_invested` (integer) - Points invested in health
  - `health_current` (numeric) - Current health points
  - `stamina_base` (integer) - Base stamina value (default 10)
  - `stamina_invested` (integer) - Points invested in stamina
  - `stamina_current` (numeric) - Current stamina points
  - `energy_base` (integer) - Base energy value (default 10)
  - `energy_invested` (integer) - Points invested in energy
  - `energy_current` (numeric) - Current energy points
  - `strength_invested` (integer) - Points invested in strength (default 0)
  - `speed_invested` (integer) - Points invested in speed (default 0)
  - `luck_invested` (integer) - Points invested in luck (default 0)

  ### 3. referrals
  Tracks referral relationships and rewards:
  - `id` (uuid, primary key)
  - `referrer_id` (uuid, foreign key) - Player who sent referral
  - `referred_id` (uuid, foreign key) - Player who was referred
  - `bonus_granted` (boolean) - Whether AP bonus was given
  - `created_at` (timestamptz) - Referral timestamp

  ### 4. combat_encounters
  Logs combat encounters and outcomes:
  - `id` (uuid, primary key)
  - `player_id` (uuid, foreign key)
  - `monster_type` (text) - Type of monster encountered
  - `monster_level` (integer) - Monster level
  - `outcome` (text) - 'victory', 'defeat', 'fled'
  - `exp_gained` (numeric) - EXP reward/penalty
  - `coins_gained` (numeric) - Coin reward
  - `items_gained` (jsonb) - Array of items won
  - `duration_seconds` (integer) - Combat duration
  - `created_at` (timestamptz) - Encounter timestamp

  ### 5. player_inventory
  Stores player items:
  - `id` (uuid, primary key)
  - `player_id` (uuid, foreign key)
  - `item_type` (text) - Item identifier
  - `quantity` (integer) - Number owned
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Players can only read/write their own data
  - Referral checks prevent self-referral and duplicates
  - Authenticated users only

  ## Important Notes
  1. Health regenerates 10 + health_invested per hour
  2. Stamina regenerates 10 + stamina_invested per minute
  3. Energy regenerates 10 + energy_invested per second
  4. First 5 referrals grant +10 AP each (max +50 permanent bonus)
  5. 6+ referrals grant rejuvenation potions instead
  6. Patrol tab locked until has_allocated_points = true
  7. EXP formula: base 10, multiplies by 1.5 per level
*/

-- Create players table
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id text UNIQUE NOT NULL,
  username text NOT NULL,
  level integer DEFAULT 1 NOT NULL,
  current_exp numeric DEFAULT 0 NOT NULL,
  total_exp numeric DEFAULT 0 NOT NULL,
  coins numeric DEFAULT 0 NOT NULL,
  unspent_ability_points integer DEFAULT 0 NOT NULL,
  total_ability_points_earned integer DEFAULT 0 NOT NULL,
  referral_bonus_points integer DEFAULT 0 NOT NULL CHECK (referral_bonus_points <= 50),
  referral_count integer DEFAULT 0 NOT NULL,
  rejuvenation_potions integer DEFAULT 0 NOT NULL,
  referred_by uuid REFERENCES players(id) ON DELETE SET NULL,
  has_allocated_points boolean DEFAULT false NOT NULL,
  last_health_regen timestamptz DEFAULT now() NOT NULL,
  last_stamina_regen timestamptz DEFAULT now() NOT NULL,
  last_energy_regen timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create player_stats table
CREATE TABLE IF NOT EXISTS player_stats (
  player_id uuid PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
  health_base integer DEFAULT 10 NOT NULL,
  health_invested integer DEFAULT 0 NOT NULL,
  health_current numeric DEFAULT 10 NOT NULL,
  stamina_base integer DEFAULT 10 NOT NULL,
  stamina_invested integer DEFAULT 0 NOT NULL,
  stamina_current numeric DEFAULT 10 NOT NULL,
  energy_base integer DEFAULT 10 NOT NULL,
  energy_invested integer DEFAULT 0 NOT NULL,
  energy_current numeric DEFAULT 10 NOT NULL,
  strength_invested integer DEFAULT 0 NOT NULL,
  speed_invested integer DEFAULT 0 NOT NULL,
  luck_invested integer DEFAULT 0 NOT NULL
);

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  referred_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  bonus_granted boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(referrer_id, referred_id),
  CHECK (referrer_id != referred_id)
);

-- Create combat_encounters table
CREATE TABLE IF NOT EXISTS combat_encounters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  monster_type text NOT NULL,
  monster_level integer NOT NULL,
  outcome text NOT NULL CHECK (outcome IN ('victory', 'defeat', 'fled')),
  exp_gained numeric DEFAULT 0 NOT NULL,
  coins_gained numeric DEFAULT 0 NOT NULL,
  items_gained jsonb DEFAULT '[]'::jsonb,
  duration_seconds integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create player_inventory table
CREATE TABLE IF NOT EXISTS player_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  item_type text NOT NULL,
  quantity integer DEFAULT 1 NOT NULL CHECK (quantity >= 0),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(player_id, item_type)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_players_telegram_id ON players(telegram_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_combat_player ON combat_encounters(player_id);
CREATE INDEX IF NOT EXISTS idx_inventory_player ON player_inventory(player_id);

-- Enable Row Level Security
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE combat_encounters ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_inventory ENABLE ROW LEVEL SECURITY;

-- RLS Policies for players table
CREATE POLICY "Players can view own profile"
  ON players FOR SELECT
  TO authenticated
  USING (auth.uid()::text = telegram_id);

CREATE POLICY "Players can insert own profile"
  ON players FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = telegram_id);

CREATE POLICY "Players can update own profile"
  ON players FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = telegram_id)
  WITH CHECK (auth.uid()::text = telegram_id);

-- RLS Policies for player_stats table
CREATE POLICY "Players can view own stats"
  ON player_stats FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM players
      WHERE players.id = player_stats.player_id
      AND players.telegram_id = auth.uid()::text
    )
  );

CREATE POLICY "Players can insert own stats"
  ON player_stats FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM players
      WHERE players.id = player_stats.player_id
      AND players.telegram_id = auth.uid()::text
    )
  );

CREATE POLICY "Players can update own stats"
  ON player_stats FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM players
      WHERE players.id = player_stats.player_id
      AND players.telegram_id = auth.uid()::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM players
      WHERE players.id = player_stats.player_id
      AND players.telegram_id = auth.uid()::text
    )
  );

-- RLS Policies for referrals table
CREATE POLICY "Players can view own referrals"
  ON referrals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM players
      WHERE (players.id = referrals.referrer_id OR players.id = referrals.referred_id)
      AND players.telegram_id = auth.uid()::text
    )
  );

CREATE POLICY "Players can create referrals"
  ON referrals FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM players
      WHERE players.id = referrals.referrer_id
      AND players.telegram_id = auth.uid()::text
    )
  );

-- RLS Policies for combat_encounters table
CREATE POLICY "Players can view own combat history"
  ON combat_encounters FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM players
      WHERE players.id = combat_encounters.player_id
      AND players.telegram_id = auth.uid()::text
    )
  );

CREATE POLICY "Players can insert own combat records"
  ON combat_encounters FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM players
      WHERE players.id = combat_encounters.player_id
      AND players.telegram_id = auth.uid()::text
    )
  );

-- RLS Policies for player_inventory table
CREATE POLICY "Players can view own inventory"
  ON player_inventory FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM players
      WHERE players.id = player_inventory.player_id
      AND players.telegram_id = auth.uid()::text
    )
  );

CREATE POLICY "Players can insert own inventory items"
  ON player_inventory FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM players
      WHERE players.id = player_inventory.player_id
      AND players.telegram_id = auth.uid()::text
    )
  );

CREATE POLICY "Players can update own inventory"
  ON player_inventory FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM players
      WHERE players.id = player_inventory.player_id
      AND players.telegram_id = auth.uid()::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM players
      WHERE players.id = player_inventory.player_id
      AND players.telegram_id = auth.uid()::text
    )
  );

CREATE POLICY "Players can delete own inventory items"
  ON player_inventory FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM players
      WHERE players.id = player_inventory.player_id
      AND players.telegram_id = auth.uid()::text
    )
  );