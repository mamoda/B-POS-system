/*
  # Seed Initial Data

  1. Add sample tables (1-12)
  2. Add sample menu items across categories
  
  This migration sets up demo data for testing the restaurant ordering system.
*/

-- Seed Tables (1-12)
INSERT INTO tables (table_number, capacity, status)
VALUES 
  (1, 2, 'available'),
  (2, 2, 'available'),
  (3, 2, 'available'),
  (4, 4, 'available'),
  (5, 4, 'available'),
  (6, 4, 'available'),
  (7, 6, 'available'),
  (8, 6, 'available'),
  (9, 2, 'available'),
  (10, 4, 'available'),
  (11, 4, 'available'),
  (12, 8, 'available')
ON CONFLICT (table_number) DO NOTHING;

-- Seed Menu Items - Appetizers
INSERT INTO menu_items (name, description, category, price, available, preparation_time_minutes)
VALUES 
  ('Bruschetta', 'Crispy bread with tomato, garlic, and basil', 'المشروبات', 8.99, true, 5),
  ('Calamari Fritti', 'Crispy fried squid served with marinara sauce', 'المشروبات', 12.99, true, 8),
  ('Spring Rolls', 'Fresh vegetable spring rolls with sweet chili sauce', 'المشروبات', 7.99, true, 6),
  ('Garlic Bread', 'Toasted bread with garlic butter and herbs', 'المشروبات', 5.99, true, 4)
ON CONFLICT DO NOTHING;

-- Seed Menu Items - Main Courses
INSERT INTO menu_items (name, description, category, price, available, preparation_time_minutes)
VALUES 
  ('Spaghetti Carbonara', 'Classic Italian pasta with creamy sauce and pancetta', 'Main Courses', 16.99, true, 12),
  ('Grilled Salmon', 'Fresh Atlantic salmon with seasonal vegetables', 'Main Courses', 24.99, true, 15),
  ('Chicken Parmesan', 'Breaded chicken breast with marinara and melted cheese', 'Main Courses', 18.99, true, 14),
  ('Ribeye Steak', 'Premium 12oz ribeye with garlic butter and potatoes', 'Main Courses', 32.99, true, 18),
  ('Vegetarian Risotto', 'Creamy arborio rice with mushrooms and truffle oil', 'Main Courses', 15.99, true, 14),
  ('Seafood Pasta', 'Mixed shrimp, clams, and mussels in white wine sauce', 'Main Courses', 22.99, true, 16)
ON CONFLICT DO NOTHING;

-- Seed Menu Items - Desserts
INSERT INTO menu_items (name, description, category, price, available, preparation_time_minutes)
VALUES 
  ('Tiramisu', 'Classic Italian dessert with mascarpone and espresso', 'Desserts', 8.99, true, 2),
  ('Chocolate Lava Cake', 'Warm chocolate cake with molten center', 'Desserts', 9.99, true, 8),
  ('Panna Cotta', 'Silky Italian cream dessert with berry compote', 'Desserts', 8.99, true, 2),
  ('Cheesecake', 'New York style cheesecake with graham cracker crust', 'Desserts', 7.99, true, 2)
ON CONFLICT DO NOTHING;

-- Seed Menu Items - Beverages
INSERT INTO menu_items (name, description, category, price, available, preparation_time_minutes)
VALUES 
  ('Coca Cola', 'Classic cola drink', 'Beverages', 2.99, true, 1),
  ('Iced Tea', 'Refreshing iced tea', 'Beverages', 2.99, true, 1),
  ('Espresso', 'Strong Italian coffee', 'Beverages', 3.99, true, 2),
  ('Cappuccino', 'Espresso with steamed milk and foam', 'Beverages', 4.99, true, 3),
  ('House Wine (Glass)', 'Selection of house wines', 'Beverages', 7.99, true, 1),
  ('Craft Beer', 'Selection of local craft beers', 'Beverages', 6.99, true, 1)
ON CONFLICT DO NOTHING;
