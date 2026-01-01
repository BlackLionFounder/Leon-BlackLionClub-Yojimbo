/*
  # Add Lucky Draw Card Type

  1. Changes
    - Update player_cards table to allow 'lucky_draw' card type
    - This is a constraint update to support the new card type
    
  2. Notes
    - Lucky Draw cards increase loot quality and quantity when active
    - They work similarly to XP multiplier cards but affect drop rates
*/

DO $$
BEGIN
  ALTER TABLE player_cards DROP CONSTRAINT IF EXISTS player_cards_card_type_check;
  
  ALTER TABLE player_cards ADD CONSTRAINT player_cards_card_type_check 
    CHECK (card_type IN ('single', 'double', 'triple', 'quadruple', 'quintuple', 'lucky_draw'));
END $$;