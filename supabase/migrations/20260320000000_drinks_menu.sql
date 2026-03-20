-- Add description column to drinks table
ALTER TABLE drinks ADD COLUMN IF NOT EXISTS description TEXT;

-- Clear existing non-alcoholic drinks
DELETE FROM drinks;

-- Insert Oliver's alcoholic drinks menu
INSERT INTO drinks (name, price, description) VALUES
  ('Juicy Lucy', 45.00, 'A lager so smooth it''ll make you forget it''s a Tuesday.'),
  ('Jack Black', 50.00, 'Craft beer for people who say "I only drink craft" at every braai.'),
  ('Castle Lite', 40.00, 'The official beer of "just one more" turning into six.'),
  ('Black Label', 38.00, 'Champion beer. Champion decisions. Questionable afternoons.'),
  ('Gin & Tonic', 65.00, 'Because you''re classy. Or at least that''s what gin drinkers tell themselves.'),
  ('Brandy & Coke', 55.00, 'The South African handshake. Oom would be proud.'),
  ('Red Wine', 70.00, 'For the sophisticated ones who swirl before they sip. At lunch. On a weekday.'),
  ('White Wine', 65.00, 'Pairs well with pasta, questionable life choices, and a 2pm meeting you forgot about.');
