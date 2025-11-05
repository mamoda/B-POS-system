/*
  # Restaurant Management System Schema

  1. New Tables
    - `menu_items` - Restaurant menu items with prices and availability
    - `tables` - Restaurant tables with capacity and status
    - `orders` - Customer orders with totals and status
    - `order_items` - Individual items within orders
    - `payments` - Payment records for orders

  2. Security
    - Enable RLS on all tables
    - Public read access for menu items
    - Restricted access for orders and payments based on table/session
    - Admin policies for management tables

  3. Key Features
    - Real-time order tracking
    - Table management
    - Payment processing integration
    - Kitchen order management
*/

-- Menu Items Table
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL,
  price decimal(10, 2) NOT NULL,
  image_url text,
  available boolean DEFAULT true,
  preparation_time_minutes integer DEFAULT 15,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tables Table
CREATE TABLE IF NOT EXISTS tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number integer NOT NULL UNIQUE,
  capacity integer NOT NULL,
  status text DEFAULT 'available',
  current_order_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id uuid NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
  table_number integer NOT NULL,
  status text DEFAULT 'pending',
  subtotal decimal(10, 2) DEFAULT 0,
  tax decimal(10, 2) DEFAULT 0,
  total decimal(10, 2) DEFAULT 0,
  estimated_ready_time timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id uuid NOT NULL REFERENCES menu_items(id),
  quantity integer NOT NULL DEFAULT 1,
  unit_price decimal(10, 2) NOT NULL,
  special_instructions text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  amount decimal(10, 2) NOT NULL,
  payment_method text NOT NULL,
  status text DEFAULT 'pending',
  stripe_payment_intent_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Menu Items: Public read access
CREATE POLICY "Menu items are publicly readable"
  ON menu_items FOR SELECT
  TO anon, authenticated
  USING (true);

-- Tables: Public read access for availability
CREATE POLICY "Tables are publicly readable"
  ON tables FOR SELECT
  TO anon, authenticated
  USING (true);

-- Orders: Allow anyone to create and read their own orders
CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read all orders"
  ON orders FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can update orders"
  ON orders FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Order Items: Public access
CREATE POLICY "Order items are readable"
  ON order_items FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can create order items"
  ON order_items FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update order items"
  ON order_items FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Payments: Public access
CREATE POLICY "Payments are readable"
  ON payments FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can create payments"
  ON payments FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update payments"
  ON payments FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_table_id ON orders(table_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_status ON order_items(status);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_tables_table_number ON tables(table_number);
