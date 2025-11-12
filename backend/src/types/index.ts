// src/types/index.ts
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image_url?: string;
  available: boolean;
  preparation_time_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  table_number: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready_for_pickup' | 'completed' | 'cancelled';
  subtotal: number;
  tax: number;
  total: number;
  estimated_ready_time?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  special_instructions?: string;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  menu_item?: MenuItem;
}

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  payment_method: 'card' | 'wallet' | 'cash';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transaction_id?: string;
  created_at: string;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
  instructions: string;
}

export interface Cart {
  [menuItemId: string]: CartItem;
}