/*
  # Create Monsters Configuration Table

  ## Overview
  Creates a table to store monster templates with fixed stats and spawn rates,
  allowing manual configuration of each monster type individually.

  ## New Tables
  
  ### `monsters`
  Stores all monster configuration data:
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Display name of the monster
  - `type` (text, unique) - Type identifier for the monster
  - `image_path` (text) - Path to monster image
  - `base_health` (integer) - Base health value
  - `base_strength` (integer) - Base strength value
  - `base_speed` (integer) - Base speed value
  - `exp_reward` (integer) - Experience points awarded
  - `coin_reward` (integer) - Coins awarded
  - `spawn_rate` (decimal) - Probability of spawning (0.0 to 1.0)
  - `min_player_level` (integer) - Minimum player level to encounter
  - `max_player_level` (integer, nullable) - Maximum player level to encounter
  - `drop_table` (jsonb) - Item drop configuration
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on monsters table
  - Allow public read access for game functionality
  - Restrict insert/update/delete to authenticated users only

  ## Initial Data
  Populates the table with 6 monster types from the original game code.
*/

CREATE TABLE IF NOT EXISTS monsters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text UNIQUE NOT NULL,
  image_path text NOT NULL,
  base_health integer NOT NULL DEFAULT 50,
  base_strength integer NOT NULL DEFAULT 10,
  base_speed integer NOT NULL DEFAULT 10,
  exp_reward integer NOT NULL DEFAULT 10,
  coin_reward integer NOT NULL DEFAULT 20,
  spawn_rate decimal NOT NULL DEFAULT 1.0 CHECK (spawn_rate >= 0 AND spawn_rate <= 1),
  min_player_level integer NOT NULL DEFAULT 1,
  max_player_level integer,
  drop_table jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE monsters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read monsters"
  ON monsters
  FOR SELECT
  USING (true);

CREATE POLICY "Only authenticated users can insert monsters"
  ON monsters
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can update monsters"
  ON monsters
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can delete monsters"
  ON monsters
  FOR DELETE
  TO authenticated
  USING (true);

INSERT INTO monsters (name, type, image_path, base_health, base_strength, base_speed, exp_reward, coin_reward, spawn_rate, min_player_level, drop_table) VALUES
  (
    'Feral Wolf',
    'feral_wolf',
    '/images/monsters/feral-wolf.png',
    25,
    8,
    12,
    8,
    15,
    0.20,
    1,
    '[
      {"itemType": "health_potion", "dropChance": 0.3, "quantity": 1},
      {"itemType": "coin_boost", "dropChance": 0.1, "quantity": 1}
    ]'::jsonb
  ),
  (
    'Mountain Bandit',
    'mountain_bandit',
    '/images/monsters/mountain-bandit.png',
    35,
    10,
    10,
    12,
    25,
    0.20,
    3,
    '[
      {"itemType": "stamina_potion", "dropChance": 0.3, "quantity": 1},
      {"itemType": "exp_boost", "dropChance": 0.15, "quantity": 1}
    ]'::jsonb
  ),
  (
    'Demon Ronin',
    'demon_ronin',
    '/images/monsters/demon-ronin.png',
    50,
    14,
    11,
    18,
    35,
    0.20,
    5,
    '[
      {"itemType": "energy_potion", "dropChance": 0.25, "quantity": 1},
      {"itemType": "health_potion", "dropChance": 0.25, "quantity": 2},
      {"itemType": "exp_boost", "dropChance": 0.2, "quantity": 1}
    ]'::jsonb
  ),
  (
    'Shadow Assassin',
    'shadow_assassin',
    '/images/monsters/shadow-assassin.png',
    45,
    16,
    14,
    20,
    40,
    0.15,
    7,
    '[
      {"itemType": "stamina_potion", "dropChance": 0.35, "quantity": 1},
      {"itemType": "coin_boost", "dropChance": 0.15, "quantity": 1}
    ]'::jsonb
  ),
  (
    'Cursed Samurai',
    'cursed_samurai',
    '/images/monsters/cursed-samurai.png',
    70,
    18,
    12,
    28,
    55,
    0.15,
    10,
    '[
      {"itemType": "health_potion", "dropChance": 0.4, "quantity": 2},
      {"itemType": "energy_potion", "dropChance": 0.3, "quantity": 1},
      {"itemType": "exp_boost", "dropChance": 0.25, "quantity": 1}
    ]'::jsonb
  ),
  (
    'Oni Warlord',
    'oni_warlord',
    '/images/monsters/oni-warlord.png',
    100,
    22,
    13,
    40,
    80,
    0.10,
    15,
    '[
      {"itemType": "rejuvenation_potion", "dropChance": 0.05, "quantity": 1},
      {"itemType": "health_potion", "dropChance": 0.5, "quantity": 3},
      {"itemType": "exp_boost", "dropChance": 0.3, "quantity": 2}
    ]'::jsonb
  )
ON CONFLICT (type) DO NOTHING;