/*
  # Add Combat Wins and Tap Tracking

  1. Changes
    - Add `combat_wins` column to players table to track total combat victories
    - Add `total_taps` column to players table to track total tap/patrol actions
    
  2. Notes
    - Both columns default to 0
    - These values are used for quest progress tracking
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'players' AND column_name = 'combat_wins'
  ) THEN
    ALTER TABLE players ADD COLUMN combat_wins integer DEFAULT 0 CHECK (combat_wins >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'players' AND column_name = 'total_taps'
  ) THEN
    ALTER TABLE players ADD COLUMN total_taps integer DEFAULT 0 CHECK (total_taps >= 0);
  END IF;
END $$;