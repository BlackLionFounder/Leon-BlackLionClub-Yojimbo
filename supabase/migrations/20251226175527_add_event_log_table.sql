/*
  # Add Event Log Table

  ## New Tables
    - `event_logs`
      - `id` (uuid, primary key)
      - `player_id` (uuid, foreign key to players)
      - `event_type` (text) - type of event: 'patrol', 'level_up', 'combat_damage', 'combat_victory', 'combat_defeat', 'ability_invested', etc.
      - `message` (text) - the message to display
      - `created_at` (timestamptz) - when the event occurred

  ## Security
    - Enable RLS on `event_logs` table
    - Allow public read and insert access for demo
*/

CREATE TABLE IF NOT EXISTS event_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE event_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view event logs"
  ON event_logs FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert event logs"
  ON event_logs FOR INSERT
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS event_logs_player_id_idx ON event_logs(player_id);
CREATE INDEX IF NOT EXISTS event_logs_created_at_idx ON event_logs(created_at DESC);