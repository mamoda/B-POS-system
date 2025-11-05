import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image_url: string | null;
  available: boolean;
  preparation_time_minutes: number;
};

export type Table = {
  id: string;
  table_number: number;
  capacity: number;
  status: string;
  current_order_id: string | null;
};

export type Order = {
  id: string;
  table_id: string;
  table_number: number;
  status: string;
  subtotal: number;
  tax: number;
  total: number;
  estimated_ready_time: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  special_instructions: string | null;
  status: string;
};

export type Payment = {
  id: string;
  order_id: string;
  amount: number;
  payment_method: string;
  status: string;
  stripe_payment_intent_id: string | null;
};
