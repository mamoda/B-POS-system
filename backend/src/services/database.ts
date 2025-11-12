// src/services/database.ts
import { createClient } from '@supabase/supabase-js';
import { config } from '../config/env';

class DatabaseService {
  private supabase;

  constructor() {
    this.supabase = createClient(config.supabase.url, config.supabase.key);
  }

  // Menu Items
  async getMenuItems(category?: string) {
    let query = this.supabase
      .from('menu_items')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async getMenuItem(id: string) {
    const { data, error } = await this.supabase
      .from('menu_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createMenuItem(menuItem: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await this.supabase
      .from('menu_items')
      .insert([menuItem])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateMenuItem(id: string, updates: Partial<MenuItem>) {
    const { data, error } = await this.supabase
      .from('menu_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteMenuItem(id: string) {
    const { error } = await this.supabase
      .from('menu_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Orders
  async createOrder(tableNumber: number) {
    const { data, error } = await this.supabase
      .from('orders')
      .insert([{ table_number: tableNumber }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getOrder(id: string) {
    const { data, error } = await this.supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async getOrdersByTable(tableNumber: number) {
    const { data, error } = await this.supabase
      .from('orders')
      .select('*')
      .eq('table_number', tableNumber)
      .in('status', ['pending', 'confirmed', 'preparing'])
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async updateOrder(id: string, updates: Partial<Order>) {
    const { data, error } = await this.supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getActiveOrders() {
    const { data, error } = await this.supabase
      .from('orders')
      .select('*')
      .in('status', ['confirmed', 'preparing'])
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  // Order Items
  async createOrderItem(orderItem: Omit<OrderItem, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await this.supabase
      .from('order_items')
      .insert([orderItem])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getOrderItems(orderId: string) {
    const { data, error } = await this.supabase
      .from('order_items')
      .select(`
        *,
        menu_item:menu_items(*)
      `)
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  async updateOrderItem(id: string, updates: Partial<OrderItem>) {
    const { data, error } = await this.supabase
      .from('order_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Payments
  async createPayment(payment: Omit<Payment, 'id' | 'created_at'>) {
    const { data, error } = await this.supabase
      .from('payments')
      .insert([payment])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateOrderTotals(orderId: string) {
    // Calculate order totals from order items
    const { data: orderItems, error } = await this.supabase
      .from('order_items')
      .select('quantity, unit_price')
      .eq('order_id', orderId);

    if (error) throw error;

    const subtotal = orderItems.reduce((sum, item) => 
      sum + (item.quantity * item.unit_price), 0
    );
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    return this.updateOrder(orderId, { subtotal, tax, total });
  }
}

export const db = new DatabaseService();