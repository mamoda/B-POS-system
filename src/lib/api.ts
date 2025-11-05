import { supabase, MenuItem, Table, Order, OrderItem, Payment } from './supabase';

export const menuApi = {
  async getMenuItems(): Promise<MenuItem[]> {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('available', true)
      .order('category', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getMenuItemsByCategory(category: string): Promise<MenuItem[]> {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('category', category)
      .eq('available', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },
};

export const tableApi = {
  async getTables(): Promise<Table[]> {
    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .order('table_number', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getTableByNumber(tableNumber: number): Promise<Table | null> {
    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .eq('table_number', tableNumber)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async updateTableStatus(tableId: string, status: string, orderId?: string): Promise<void> {
    const { error } = await supabase
      .from('tables')
      .update({
        status,
        current_order_id: orderId || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', tableId);

    if (error) throw error;
  },
};

export const orderApi = {
  async createOrder(tableId: string, tableNumber: number): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        table_id: tableId,
        table_number: tableNumber,
        status: 'pending',
        subtotal: 0,
        tax: 0,
        total: 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getOrder(orderId: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getOrdersByTable(tableNumber: number): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('table_number', tableNumber)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async updateOrder(orderId: string, updates: Partial<Order>): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) throw error;
  },

  async updateOrderTotals(orderId: string): Promise<void> {
    const { data: items } = await supabase
      .from('order_items')
      .select('unit_price, quantity')
      .eq('order_id', orderId);

    if (!items) return;

    const subtotal = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    const maxPrepTime = items.length > 0 ? Math.max(...items.map(() => 15)) : 0;

    await supabase
      .from('orders')
      .update({
        subtotal,
        tax,
        total,
        estimated_ready_time: new Date(Date.now() + maxPrepTime * 60000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);
  },
};

export const orderItemApi = {
  async addOrderItem(orderId: string, menuItemId: string, quantity: number, price: number, instructions?: string): Promise<OrderItem> {
    const { data, error } = await supabase
      .from('order_items')
      .insert({
        order_id: orderId,
        menu_item_id: menuItemId,
        quantity,
        unit_price: price,
        special_instructions: instructions || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (error) throw error;
    return data || [];
  },

  async updateOrderItem(itemId: string, quantity: number): Promise<void> {
    const { error } = await supabase
      .from('order_items')
      .update({ quantity, updated_at: new Date().toISOString() })
      .eq('id', itemId);

    if (error) throw error;
  },

  async deleteOrderItem(itemId: string): Promise<void> {
    const { error } = await supabase
      .from('order_items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
  },

  async updateOrderItemStatus(itemId: string, status: string): Promise<void> {
    const { error } = await supabase
      .from('order_items')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', itemId);

    if (error) throw error;
  },
};

export const paymentApi = {
  async createPayment(orderId: string, amount: number, paymentMethod: string): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .insert({
        order_id: orderId,
        amount,
        payment_method: paymentMethod,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getPayment(paymentId: string): Promise<Payment | null> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async updatePaymentStatus(paymentId: string, status: string, stripeId?: string): Promise<void> {
    const { error } = await supabase
      .from('payments')
      .update({
        status,
        stripe_payment_intent_id: stripeId || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentId);

    if (error) throw error;
  },

  async getOrderPayments(orderId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId);

    if (error) throw error;
    return data || [];
  },
};
