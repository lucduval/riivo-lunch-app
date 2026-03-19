INSERT INTO restaurants (id, name, cuisine, delivery_time, image_url) VALUES
('11111111-1111-4111-8111-111111111111', 'La Colombe', 'Fine Dining', 'N/A', 'https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&q=80&w=800'),
('22222222-2222-4222-8222-222222222222', 'Posticino''s', 'Italian', '35 mins', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&q=80&w=800'),
('33333333-3333-4333-8333-333333333333', 'Chefs Warehouse', 'Fine Dining', 'N/A', 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=800'),
('44444444-4444-4444-8444-444444444444', 'The Lebanese Bakery', 'Lebanese', '30 mins', 'https://images.unsplash.com/photo-1623334044303-241021148842?auto=format&fit=crop&q=80&w=800');

INSERT INTO menu_items (id, restaurant_id, name, description, price, category, order_count) VALUES
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', '22222222-2222-4222-8222-222222222222', 'Margherita', '(basic base) tomato base, mozzarella and herbs', 95.0, 'Mains', 120),
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', '22222222-2222-4222-8222-222222222222', 'Regina', 'Ham and mushrooms', 130.0, 'Mains', 85),
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', '22222222-2222-4222-8222-222222222222', 'Posticino', 'Mushrooms, olives, green peppers, asparagus', 160.0, 'Mains', 200),
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4', '22222222-2222-4222-8222-222222222222', 'Puttanesca', 'Napoletana with anchovies, olives & capers', 155.0, 'Mains', 45),
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5', '22222222-2222-4222-8222-222222222222', 'Foccaccia', 'Crispy pizza base with garlic, olive oil, salt and herbs', 65.0, 'Sides', 150),
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa6', '22222222-2222-4222-8222-222222222222', 'Aglio Olio', 'Olive oil & garlic pasta', 94.0, 'Mains', 95);

INSERT INTO drinks (id, name, price) VALUES
('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1', 'Sparkling Water', 35.0),
('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2', 'Cold Brew Coffee', 45.0);
