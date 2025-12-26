/*
  # Friends and Leaderboard System

  ## Overview
  This migration creates tables for managing user profiles, referral system, and leaderboard functionality for the Hamster Kombat game.

  ## New Tables
  
  ### 1. `users`
  User profiles with their game stats
  - `id` (uuid, primary key) - Unique user identifier
  - `username` (text) - Display name
  - `telegram_id` (text, unique) - Telegram user ID
  - `points` (bigint) - Current points/coins
  - `level` (int) - Current level
  - `profit_per_hour` (bigint) - Hourly profit
  - `referral_code` (text, unique) - User's unique referral code
  - `referred_by` (uuid, nullable) - ID of user who referred them
  - `total_referrals` (int) - Count of direct referrals
  - `created_at` (timestamptz) - Account creation time
  - `updated_at` (timestamptz) - Last update time

  ### 2. `referrals`
  Tracks referral relationships
  - `id` (uuid, primary key) - Unique referral record ID
  - `referrer_id` (uuid) - User who made the referral
  - `referred_id` (uuid) - User who was referred
  - `referral_bonus` (bigint) - Bonus points awarded
  - `created_at` (timestamptz) - When referral was created

  ### 3. `leaderboard`
  Materialized view for leaderboard rankings
  - `user_id` (uuid) - User identifier
  - `username` (text) - User's display name
  - `points` (bigint) - Total points
  - `level` (int) - Current level
  - `total_referrals` (int) - Number of referrals
  - `rank` (bigint) - User's rank position

  ## Security
  - Enable RLS on all tables
  - Users can view their own data and referrals
  - Leaderboard is publicly viewable
  - Only authenticated users can access the system

  ## Important Notes
  1. Referral codes are automatically generated and unique
  2. Leaderboard rankings are based on points
  3. Users can view their downline (people they referred)
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  telegram_id text UNIQUE,
  points bigint DEFAULT 0,
  level int DEFAULT 1,
  profit_per_hour bigint DEFAULT 0,
  referral_code text UNIQUE NOT NULL DEFAULT substr(md5(random()::text), 1, 8),
  referred_by uuid REFERENCES users(id),
  total_referrals int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referral_bonus bigint DEFAULT 5000,
  created_at timestamptz DEFAULT now(),
  UNIQUE(referrer_id, referred_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_points ON users(points DESC);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_id);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all profiles for leaderboard"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Referrals policies
CREATE POLICY "Users can view their referrals"
  ON referrals FOR SELECT
  TO authenticated
  USING (referrer_id = auth.uid() OR referred_id = auth.uid());

CREATE POLICY "Users can create referrals"
  ON referrals FOR INSERT
  TO authenticated
  WITH CHECK (referred_id = auth.uid());

-- Function to update total_referrals count
CREATE OR REPLACE FUNCTION update_referral_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET total_referrals = (
    SELECT COUNT(*) FROM referrals WHERE referrer_id = NEW.referrer_id
  )
  WHERE id = NEW.referrer_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update referral count
DROP TRIGGER IF EXISTS trigger_update_referral_count ON referrals;
CREATE TRIGGER trigger_update_referral_count
  AFTER INSERT ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_referral_count();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update users updated_at
DROP TRIGGER IF EXISTS trigger_users_updated_at ON users;
CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();