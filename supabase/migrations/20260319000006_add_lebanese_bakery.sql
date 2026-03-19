-- Expand category constraint to support Lebanese Bakery menu sections
ALTER TABLE menu_items DROP CONSTRAINT menu_items_category_check;
ALTER TABLE menu_items ADD CONSTRAINT menu_items_category_check
  CHECK (category IN ('Antipasti', 'Pasta', 'Baked Pasta', 'Panini', 'Pizza', 'Additional Toppings', 'Mains', 'Side Dishes', 'Salads', 'Sides', 'Drinks', 'Breads', 'Dips & Spreads', 'Wraps & Sandwiches', 'Desserts'));

-- Insert The Lebanese Bakery restaurant
INSERT INTO restaurants (id, name, cuisine, delivery_time, image_url) VALUES
('44444444-4444-4444-8444-444444444444', 'The Lebanese Bakery', 'Lebanese', '30 mins', 'https://images.unsplash.com/photo-1623334044303-241021148842?auto=format&fit=crop&q=80&w=800')
ON CONFLICT (id) DO NOTHING;

-- =====================
-- BREADS
-- =====================
INSERT INTO menu_items (restaurant_id, name, description, price, category, order_count) VALUES
('44444444-4444-4444-8444-444444444444', 'Pita Bread White (6 piece)', 'Classic white pita bread', 49.00, 'Breads', 80),
('44444444-4444-4444-8444-444444444444', 'Pita Bread Brown (6 piece)', 'Wholesome brown pita bread', 54.00, 'Breads', 60),
('44444444-4444-4444-8444-444444444444', 'Saj (4 piece)', 'Traditional thin Lebanese flatbread', 48.00, 'Breads', 55),
('44444444-4444-4444-8444-444444444444', 'Baked Dipping Bread Za''atar', 'Crispy bread seasoned with za''atar', 38.00, 'Breads', 70),
('44444444-4444-4444-8444-444444444444', 'Baked Dipping Bread Chili & Paprika', 'Crispy bread with chili and paprika', 38.00, 'Breads', 45);

-- =====================
-- DIPS & SPREADS
-- =====================
INSERT INTO menu_items (restaurant_id, name, description, price, category, order_count) VALUES
('44444444-4444-4444-8444-444444444444', 'Hummus', 'Classic chickpea dip, 200g', 57.00, 'Dips & Spreads', 120),
('44444444-4444-4444-8444-444444444444', 'Caramelised Onion Hummus', 'Hummus topped with sweet caramelised onion, 150g', 63.00, 'Dips & Spreads', 65),
('44444444-4444-4444-8444-444444444444', 'Beetroot Hummus', 'Vibrant beetroot-infused hummus, 150g', 63.00, 'Dips & Spreads', 50),
('44444444-4444-4444-8444-444444444444', 'Baba Ganoush', 'Smoky roasted aubergine dip, 150g', 57.00, 'Dips & Spreads', 90),
('44444444-4444-4444-8444-444444444444', 'Mutabal', 'Creamy aubergine dip with tahini, 150g', 57.00, 'Dips & Spreads', 40),
('44444444-4444-4444-8444-444444444444', 'Tzatziki', 'Yoghurt, cucumber and garlic dip, 200g', 57.00, 'Dips & Spreads', 75),
('44444444-4444-4444-8444-444444444444', 'Labneh', 'Strained yoghurt dip, 200g', 57.00, 'Dips & Spreads', 55),
('44444444-4444-4444-8444-444444444444', 'Toumeya', 'Lebanese garlic sauce, 200g', 57.00, 'Dips & Spreads', 45),
('44444444-4444-4444-8444-444444444444', 'Mohammara', 'Roasted red pepper and walnut dip, 150g', 59.00, 'Dips & Spreads', 35),
('44444444-4444-4444-8444-444444444444', 'Zough', 'Spicy green herb sauce, 150g', 70.00, 'Dips & Spreads', 30);

-- =====================
-- WRAPS & SANDWICHES
-- =====================
INSERT INTO menu_items (restaurant_id, name, description, price, category, order_count) VALUES
('44444444-4444-4444-8444-444444444444', 'Falafel (4 piece)', 'Crispy chickpea fritters, served with tahini', 44.00, 'Wraps & Sandwiches', 100),
('44444444-4444-4444-8444-444444444444', 'Falafel Sandwich', 'Falafel in fresh pita with salad and tahini', 69.00, 'Wraps & Sandwiches', 110),
('44444444-4444-4444-8444-444444444444', 'Shawarma Chicken', 'Marinated chicken shawarma in fresh pita', 115.00, 'Wraps & Sandwiches', 150),
('44444444-4444-4444-8444-444444444444', 'Shawarma Beef', 'Marinated beef shawarma in fresh pita', 115.00, 'Wraps & Sandwiches', 130),
('44444444-4444-4444-8444-444444444444', 'Döner Chicken', 'Chicken döner in fresh pita', 99.00, 'Wraps & Sandwiches', 85),
('44444444-4444-4444-8444-444444444444', 'Döner Beef', 'Beef döner in fresh pita', 99.00, 'Wraps & Sandwiches', 80);

-- =====================
-- SIDES
-- =====================
INSERT INTO menu_items (restaurant_id, name, description, price, category, order_count) VALUES
('44444444-4444-4444-8444-444444444444', 'Chef''s Marinated Olives', 'House-marinated olives, 350g', 89.00, 'Sides', 40),
('44444444-4444-4444-8444-444444444444', 'Marinated Aubergines', 'Preserved marinated aubergines, 200g', 73.00, 'Sides', 25),
('44444444-4444-4444-8444-444444444444', 'Dolma Tub', 'Stuffed vine leaves', 72.00, 'Sides', 35);

-- =====================
-- DESSERTS
-- =====================
INSERT INTO menu_items (restaurant_id, name, description, price, category, order_count) VALUES
('44444444-4444-4444-8444-444444444444', 'Baklava (4 piece)', 'Traditional layered pastry with nuts and honey syrup', 75.00, 'Desserts', 90);

-- =====================
-- PLATTERS
-- =====================
INSERT INTO menu_items (restaurant_id, name, description, price, category, order_count) VALUES
('44444444-4444-4444-8444-444444444444', 'Mezze Box', 'A selection of dips, breads, falafel and sides to share', 565.00, 'Mains', 20);
