-- Expand category constraint to support all menu sections
ALTER TABLE menu_items DROP CONSTRAINT menu_items_category_check;
ALTER TABLE menu_items ADD CONSTRAINT menu_items_category_check
  CHECK (category IN ('Antipasti', 'Pasta', 'Baked Pasta', 'Panini', 'Pizza', 'Additional Toppings', 'Mains', 'Side Dishes', 'Salads', 'Sides', 'Drinks'));

-- Ensure Posticino's restaurant exists
INSERT INTO restaurants (id, name, cuisine, delivery_time, image_url) VALUES
('22222222-2222-4222-8222-222222222222', 'Posticino''s', 'Italian', '35 mins', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&q=80&w=800')
ON CONFLICT (id) DO NOTHING;

-- Remove old seed data for Posticino's menu items
DELETE FROM menu_items WHERE restaurant_id = '22222222-2222-4222-8222-222222222222';

-- =====================
-- ANTIPASTI
-- =====================
INSERT INTO menu_items (restaurant_id, name, description, price, category, order_count) VALUES
('22222222-2222-4222-8222-222222222222', 'Chicken Livers', 'Pan fried livers in white wine with onions, in napoletana sauce', 104.00, 'Antipasti', 45),
('22222222-2222-4222-8222-222222222222', 'Funghi Grigliati', 'Black mushrooms grilled in garlic & parsley, topped with mozzarella', 112.00, 'Antipasti', 38),
('22222222-2222-4222-8222-222222222222', 'Calamari Starter', 'Pan grilled calamari, served with lemon', 134.00, 'Antipasti', 72),
('22222222-2222-4222-8222-222222222222', 'Mussels', 'White wine, garlic, and parsley, served in a cream based sauce with pita bread', 129.00, 'Antipasti', 55),
('22222222-2222-4222-8222-222222222222', 'Melenzane Parmigiano', 'Layers of brinjals & napoletana sauce, topped with mozzarella & baked in the woodfire oven', 154.00, 'Antipasti', 30);

-- =====================
-- PASTA
-- =====================
INSERT INTO menu_items (restaurant_id, name, description, price, category, order_count) VALUES
('22222222-2222-4222-8222-222222222222', 'Burro e Salvia', 'Butter & sage', 95.00, 'Pasta', 25),
('22222222-2222-4222-8222-222222222222', 'Aglio Olio', 'Olive oil & garlic', 94.00, 'Pasta', 95),
('22222222-2222-4222-8222-222222222222', 'Basil Pesto', 'Basil, pine nuts, olive oil, garlic & parmigiano', 140.00, 'Pasta', 60),
('22222222-2222-4222-8222-222222222222', 'Alla Ingrid', 'Aglio olio, calamari, chilli & white wine', 185.00, 'Pasta', 42),
('22222222-2222-4222-8222-222222222222', 'Fresco', 'Aglio olio with sliced tomato, black mushrooms & basil pesto', 155.00, 'Pasta', 35),
('22222222-2222-4222-8222-222222222222', 'Alla Gracie', 'Aglio olio with red & green peppers, bacon, chicken, mushrooms & fresh feta on top', 160.00, 'Pasta', 50),
('22222222-2222-4222-8222-222222222222', 'Napoletana', 'Tomato & herbs', 95.00, 'Pasta', 80),
('22222222-2222-4222-8222-222222222222', 'Arrabiata', 'Napoletana with chilli', 105.00, 'Pasta', 45),
('22222222-2222-4222-8222-222222222222', 'Bolognese', 'Napoletana with slow-cooked beef mince, carrots & onion', 156.00, 'Pasta', 120),
('22222222-2222-4222-8222-222222222222', 'Polpette', 'Napoletana with homemade beef meatballs', 165.00, 'Pasta', 70),
('22222222-2222-4222-8222-222222222222', 'Primavera', 'Napoletana with mushrooms, green peppers, brinjals & zucchini', 155.00, 'Pasta', 28),
('22222222-2222-4222-8222-222222222222', 'Puttanesca', 'Napoletana with anchovies, olives & capers', 155.00, 'Pasta', 33),
('22222222-2222-4222-8222-222222222222', 'Ammatriciana', 'Napoletana with bacon, onion & chilli', 155.00, 'Pasta', 40),
('22222222-2222-4222-8222-222222222222', 'Forestiera', 'Napoletana with black mushroom & olives', 155.00, 'Pasta', 22),
('22222222-2222-4222-8222-222222222222', 'Aurora', 'Napoletana with cream & parmigiano', 125.00, 'Pasta', 55),
('22222222-2222-4222-8222-222222222222', 'Al Fredo', 'Cream with ham & mushrooms', 155.00, 'Pasta', 65),
('22222222-2222-4222-8222-222222222222', 'Alla Nor', 'Cream with chicken, bacon, mushrooms, onions & sundried tomatoes', 165.00, 'Pasta', 48),
('22222222-2222-4222-8222-222222222222', 'Carbonara', 'Cream, bacon, egg & black pepper', 145.00, 'Pasta', 110),
('22222222-2222-4222-8222-222222222222', 'Salmone', 'Cream with smoked salmon, capers & onions', 175.00, 'Pasta', 30),
('22222222-2222-4222-8222-222222222222', 'Quatro Formaggi', 'Cream with mozzarella, gorgonzola, provolone & parmigiano', 170.00, 'Pasta', 38),
('22222222-2222-4222-8222-222222222222', 'Chicken Pasta', 'Chicken pasta', 150.00, 'Pasta', 42),
('22222222-2222-4222-8222-222222222222', 'Veal Pasta', 'Veal pasta', 180.00, 'Pasta', 18),
('22222222-2222-4222-8222-222222222222', 'Al Tonno', 'Napoletana with tuna & onions', 160.00, 'Pasta', 20),
('22222222-2222-4222-8222-222222222222', 'Marinara Pasta', 'Calamari, mussels and prawns', 190.00, 'Pasta', 35),
('22222222-2222-4222-8222-222222222222', 'Gnocchi', 'Potato gnocchi (add R28 to any pasta)', 28.00, 'Pasta', 50),
('22222222-2222-4222-8222-222222222222', 'Ravioli Spinach & Ricotta', 'Spinach & ricotta ravioli (add R55 to any pasta)', 55.00, 'Pasta', 25),
('22222222-2222-4222-8222-222222222222', 'Ravioli Butternut & Ricotta', 'Butternut & ricotta ravioli (add R55 to any pasta)', 55.00, 'Pasta', 20),
('22222222-2222-4222-8222-222222222222', 'Ravioli Wild Mushroom & Artichoke', 'Wild mushroom & artichoke ravioli (add R55 to any pasta)', 55.00, 'Pasta', 18),
('22222222-2222-4222-8222-222222222222', 'Ravioli Beef', 'Beef ravioli (add R60 to any pasta)', 60.00, 'Pasta', 22),
('22222222-2222-4222-8222-222222222222', 'Ravioli Smoked Salmon', 'Smoked salmon ravioli (add R60 to any pasta)', 60.00, 'Pasta', 15);

-- =====================
-- BAKED PASTA
-- =====================
INSERT INTO menu_items (restaurant_id, name, description, price, category, order_count) VALUES
('22222222-2222-4222-8222-222222222222', 'Lasagne - Beef', 'Classic beef lasagne', 165.00, 'Baked Pasta', 85),
('22222222-2222-4222-8222-222222222222', 'Canneloni - Spinach & Ricotta', 'Spinach & ricotta canneloni', 165.00, 'Baked Pasta', 40),
('22222222-2222-4222-8222-222222222222', 'Pasta Al Forno', 'Baked pasta', 175.00, 'Baked Pasta', 35);

-- =====================
-- PANINI
-- =====================
INSERT INTO menu_items (restaurant_id, name, description, price, category, order_count) VALUES
('22222222-2222-4222-8222-222222222222', 'The Polpette', 'Meatballs with ragu, wilted spinach, peppers and parmesan', 112.00, 'Panini', 55),
('22222222-2222-4222-8222-222222222222', 'The Chicken & Avo', 'Lettuce, grilled chicken, avo, onion, Posti''s special dressing', 99.00, 'Panini', 80),
('22222222-2222-4222-8222-222222222222', 'The Melenzane', 'Olive oil, melenzane parmigiana, rocket, parmesan and melted mozzarella', 90.00, 'Panini', 30),
('22222222-2222-4222-8222-222222222222', 'The Chicken Parm', 'Chicken parmigiana, mozzarella and parmesan', 112.00, 'Panini', 65),
('22222222-2222-4222-8222-222222222222', 'The Grigliato - Chicken', 'Grilled chicken, rocket, tomato and balsamic caramelized onion', 96.00, 'Panini', 42),
('22222222-2222-4222-8222-222222222222', 'The Grigliato - Veal', 'Grilled veal, rocket, tomato and balsamic caramelized onion', 110.00, 'Panini', 20),
('22222222-2222-4222-8222-222222222222', 'The Prosciutto', 'Olive oil, prosciutto crudo, rocket, parmesan shavings and tomato', 120.00, 'Panini', 35);

-- =====================
-- PIZZA
-- =====================
INSERT INTO menu_items (restaurant_id, name, description, price, category, order_count) VALUES
('22222222-2222-4222-8222-222222222222', 'Foccaccia', 'Crispy pizza base with garlic, olive oil, salt and herbs', 65.00, 'Pizza', 150),
('22222222-2222-4222-8222-222222222222', 'Foccaccia Caprese', 'Foccaccia base with sliced tomato, mozzarella and basil pesto', 90.00, 'Pizza', 45),
('22222222-2222-4222-8222-222222222222', 'Margherita', 'Tomato base, mozzarella and herbs', 95.00, 'Pizza', 200),
('22222222-2222-4222-8222-222222222222', 'Regina', 'Ham and mushrooms', 130.00, 'Pizza', 85),
('22222222-2222-4222-8222-222222222222', 'Hawaiian', 'Ham and pineapple', 130.00, 'Pizza', 60),
('22222222-2222-4222-8222-222222222222', 'Capricciosa', 'Salami, mushrooms, olives and asparagus', 149.00, 'Pizza', 55),
('22222222-2222-4222-8222-222222222222', 'Quattro Stagioni', 'Ham, mushrooms, olives and artichokes', 149.00, 'Pizza', 48),
('22222222-2222-4222-8222-222222222222', 'Siciliana', 'Anchovies, olives and garlic', 145.00, 'Pizza', 20),
('22222222-2222-4222-8222-222222222222', 'Funghineri', 'Black mushrooms and garlic', 130.00, 'Pizza', 35),
('22222222-2222-4222-8222-222222222222', 'Asparagi', 'Asparagus, olives and mushrooms', 140.00, 'Pizza', 22),
('22222222-2222-4222-8222-222222222222', 'Posticino', 'Mushrooms, olives, green peppers, asparagus', 160.00, 'Pizza', 180),
('22222222-2222-4222-8222-222222222222', 'Capo', 'Gorgonzola, provolone and parmigiano cheese', 155.00, 'Pizza', 40),
('22222222-2222-4222-8222-222222222222', 'Panna', 'Smoked salmon, caviar and cream cheese', 190.00, 'Pizza', 25),
('22222222-2222-4222-8222-222222222222', 'Carabinieri', 'Mushrooms, olives, green peppers, chilli and garlic', 145.00, 'Pizza', 38),
('22222222-2222-4222-8222-222222222222', 'Porchetta', 'Bacon and avo', 130.00, 'Pizza', 50),
('22222222-2222-4222-8222-222222222222', 'Contadina', 'Brinjals, zucchini, red peppers and sundried tomatoes', 140.00, 'Pizza', 28),
('22222222-2222-4222-8222-222222222222', 'Strega', 'Pan fried chicken livers, onion and chilli', 150.00, 'Pizza', 18),
('22222222-2222-4222-8222-222222222222', 'Marinara Pizza', 'Calamari, mussels and shrimps', 190.00, 'Pizza', 30),
('22222222-2222-4222-8222-222222222222', 'Mexicana', 'Beef mince, green peppers, onion, chilli and garlic', 165.00, 'Pizza', 45),
('22222222-2222-4222-8222-222222222222', 'Algreco', 'Spinach, olives and feta', 130.00, 'Pizza', 32);

-- =====================
-- MAINS (Chicken / Veal)
-- =====================
INSERT INTO menu_items (restaurant_id, name, description, price, category, order_count) VALUES
('22222222-2222-4222-8222-222222222222', 'Grilled Chicken', 'Olive oil, lemon and herbs', 190.00, 'Mains', 75),
('22222222-2222-4222-8222-222222222222', 'Grilled Veal', 'Olive oil, lemon and herbs', 210.00, 'Mains', 35),
('22222222-2222-4222-8222-222222222222', 'Grilled Chicken with Mushrooms', 'Olive oil, lemon, herbs and sauteed black mushrooms', 216.00, 'Mains', 40),
('22222222-2222-4222-8222-222222222222', 'Grilled Veal with Mushrooms', 'Olive oil, lemon, herbs and sauteed black mushrooms', 216.00, 'Mains', 15),
('22222222-2222-4222-8222-222222222222', 'Chicken Schnitzel', 'Breadcrumbed and fried', 195.00, 'Mains', 60),
('22222222-2222-4222-8222-222222222222', 'Veal Schnitzel', 'Breadcrumbed and fried', 225.00, 'Mains', 20),
('22222222-2222-4222-8222-222222222222', 'Chicken Limone', 'Flour dusted and pan fried in butter, lemon and white wine', 195.00, 'Mains', 45),
('22222222-2222-4222-8222-222222222222', 'Veal Limone', 'Flour dusted and pan fried in butter, lemon and white wine', 225.00, 'Mains', 12),
('22222222-2222-4222-8222-222222222222', 'Chicken Forestiera', 'Schnitzel with napoletana sauce, olives, garlic and black mushrooms', 205.00, 'Mains', 30),
('22222222-2222-4222-8222-222222222222', 'Veal Forestiera', 'Schnitzel with napoletana sauce, olives, garlic and black mushrooms', 230.00, 'Mains', 10),
('22222222-2222-4222-8222-222222222222', 'Chicken Parmigiano', 'Schnitzel, napoletana, cream and parmigiano, cooked in the wood fire oven', 210.00, 'Mains', 55),
('22222222-2222-4222-8222-222222222222', 'Veal Parmigiano', 'Schnitzel, napoletana, cream and parmigiano, cooked in the wood fire oven', 240.00, 'Mains', 15),
('22222222-2222-4222-8222-222222222222', 'Calamari Main', 'Pan grilled calamari in white wine, garlic and lemon', 215.00, 'Mains', 50);

-- =====================
-- SALADS
-- =====================
INSERT INTO menu_items (restaurant_id, name, description, price, category, order_count) VALUES
('22222222-2222-4222-8222-222222222222', 'Greek Salad', 'Lettuce, cucumber, tomato, onion, feta, oregano', 90.00, 'Salads', 65),
('22222222-2222-4222-8222-222222222222', 'Chicken and Avo Salad', 'Lettuce, cucumber, tomato, chicken, avo, onion', 135.00, 'Salads', 80),
('22222222-2222-4222-8222-222222222222', 'Calamari Salad', 'Lettuce, cucumber, tomato, onion, grilled calamari', 155.00, 'Salads', 30),
('22222222-2222-4222-8222-222222222222', 'Tuna Salad', 'Lettuce, cucumber, tomato, onion, tuna, capers, boiled eggs', 135.00, 'Salads', 25),
('22222222-2222-4222-8222-222222222222', 'Caprese Salad', 'Tomato, bocconcini, basil pesto', 90.00, 'Salads', 40),
('22222222-2222-4222-8222-222222222222', 'Italian Salad', 'Lettuce, tomato, cucumber, bocconcini', 90.00, 'Salads', 35);
