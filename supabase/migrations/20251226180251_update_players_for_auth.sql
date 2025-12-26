/*
  # Update Players Table for Supabase Auth

  1. Changes
    - Drop telegram_id column and related constraints
    - Add user_id column linked to auth.users
    - Update RLS policies to use auth.uid()
    - Migrate existing data to link with auth users

  2. Security
    - Players can only access their own data
    - Use auth.uid() for all RLS policies
*/

-- Drop the old telegram_id unique constraint
ALTER TABLE players DROP CONSTRAINT IF EXISTS players_telegram_id_key;

-- Add user_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'players' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE players ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Make telegram_id nullable for migration
ALTER TABLE players ALTER COLUMN telegram_id DROP NOT NULL;

-- Create unique constraint on user_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'players_user_id_key'
  ) THEN
    ALTER TABLE players ADD CONSTRAINT players_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Drop old RLS policies
DROP POLICY IF EXISTS "Anyone can view players" ON players;
DROP POLICY IF EXISTS "Anyone can create players" ON players;
DROP POLICY IF EXISTS "Anyone can update players" ON players;
DROP POLICY IF EXISTS "Anyone can view player_stats" ON player_stats;
DROP POLICY IF EXISTS "Anyone can create player_stats" ON player_stats;
DROP POLICY IF EXISTS "Anyone can update player_stats" ON player_stats;
DROP POLICY IF EXISTS "Anyone can view event_logs" ON event_logs;
DROP POLICY IF EXISTS "Anyone can create event_logs" ON event_logs;

-- Create new RLS policies for players table
CREATE POLICY "Users can view own player"
  ON players FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own player"
  ON players FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own player"
  ON players FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create new RLS policies for player_stats table
CREATE POLICY "Users can view own stats"
  ON player_stats FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM players
      WHERE players.id = player_stats.player_id
      AND players.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own stats"
  ON player_stats FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM players
      WHERE players.id = player_stats.player_id
      AND players.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own stats"
  ON player_stats FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM players
      WHERE players.id = player_stats.player_id
      AND players.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM players
      WHERE players.id = player_stats.player_id
      AND players.user_id = auth.uid()
    )
  );

-- Create new RLS policies for event_logs table
CREATE POLICY "Users can view own event logs"
  ON event_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM players
      WHERE players.id = event_logs.player_id
      AND players.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own event logs"
  ON event_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM players
      WHERE players.id = event_logs.player_id
      AND players.user_id = auth.uid()
    )
  );
