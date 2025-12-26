/*
  # Enable Public Access for Game Demo

  ## Changes
  - Updates RLS policies to allow public (anon) access
  - Allows anyone to create and manage game data
  - Appropriate for demo/testing environment

  ## Security Notes
  - This is suitable for a game demo where users don't need strict isolation
  - Each player is identified by their telegram_id
  - RLS is still enabled for future auth implementation
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can view all players" ON players;
DROP POLICY IF EXISTS "Authenticated users can insert players" ON players;
DROP POLICY IF EXISTS "Authenticated users can update all players" ON players;

DROP POLICY IF EXISTS "Authenticated users can view all stats" ON player_stats;
DROP POLICY IF EXISTS "Authenticated users can insert stats" ON player_stats;
DROP POLICY IF EXISTS "Authenticated users can update all stats" ON player_stats;

DROP POLICY IF EXISTS "Authenticated users can view referrals" ON referrals;
DROP POLICY IF EXISTS "Authenticated users can create referrals" ON referrals;

DROP POLICY IF EXISTS "Authenticated users can view combat" ON combat_encounters;
DROP POLICY IF EXISTS "Authenticated users can insert combat" ON combat_encounters;

DROP POLICY IF EXISTS "Authenticated users can view inventory" ON player_inventory;
DROP POLICY IF EXISTS "Authenticated users can insert inventory" ON player_inventory;
DROP POLICY IF EXISTS "Authenticated users can update inventory" ON player_inventory;
DROP POLICY IF EXISTS "Authenticated users can delete inventory" ON player_inventory;

-- Create permissive policies for public access
CREATE POLICY "Anyone can view players"
  ON players FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert players"
  ON players FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update players"
  ON players FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can view stats"
  ON player_stats FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert stats"
  ON player_stats FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update stats"
  ON player_stats FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can view referrals"
  ON referrals FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create referrals"
  ON referrals FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view combat"
  ON combat_encounters FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert combat"
  ON combat_encounters FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view inventory"
  ON player_inventory FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert inventory"
  ON player_inventory FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update inventory"
  ON player_inventory FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete inventory"
  ON player_inventory FOR DELETE
  USING (true);