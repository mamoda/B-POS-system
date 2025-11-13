// NOTE: This file assumes the data types (MenuItem, Table, Order, etc.) are defined in a separate file,
// or you can copy them from the original 'supabase.ts' file into a new 'types.ts' file.
// For simplicity, I'm including the necessary types here, assuming they were originally in './supabase'.

// --- Data Types (Copied from original supabase.ts for completeness) ---
export type MenuItem = {
  _id: string; // Changed from 'id' to '_id' for MongoDB
  name: string;
  description: string;
  category: string;
  price: number;
  image_url: string | null;
  available: boolean;
  preparation_time_minutes: number;
};

export type Table = {
  _id: string; // Changed from 'id' to '_id' for MongoDB
  table_number: number;
  capacity: number;
  status: string;
  current_order_id: string | null;
};

export type Order = {
  _id: string; // Changed from 'id' to '_id' for MongoDB
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
  _id: string; // Changed from 'id' to '_id' for MongoDB
  order_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  special_instructions: string | null;
  status: string;
};

export type Payment = {
  _id: string; // Changed from 'id' to '_id' for MongoDB
  order_id: string;
  amount: number;
  payment_method: string;
  status: string;
  stripe_payment_intent_id: string | null;
};

export type User = {
  _id: string;
  username: string;
  role: 'admin' | 'staff' | 'kitchen';
};

export type AuthResponse = {
  token: string;
  user: User;
};

// --- API Configuration and Helper Functions ---

const BASE_URL = 'http://localhost:5000/api/v1';

let authToken: string | null = localStorage.getItem('authToken');

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

const fetcher = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authToken) {
    headers['Authorization'] = \`Bearer \${authToken}\`;
  }

  const response = await fetch(\`\${BASE_URL}\${url}\`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.error || errorData.message || 'An unknown error occurred');
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  const data = await response.json();
  return data.data as T;
};

// --- Authentication API ---

export const authApi = {
  async login(username: string, password: string): Promise<AuthResponse> {
    const data = await fetcher<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    setAuthToken(data.token);
    return data;
  },

  async logout(): Promise<void> {
    setAuthToken(null);
    // No backend call needed for simple JWT logout
  },

  async getMe(): Promise<User> {
    return fetcher<User>('/auth/me');
  },
};

// --- Menu API ---

export const menuApi = {
  async getMenuItems(): Promise<MenuItem[]> {
    return fetcher<MenuItem[]>('/menu');
  },

  async getMenuItemsByCategory(category: string): Promise<MenuItem[]> {
    return fetcher<MenuItem[]>(`/menu/category/\${category}`);
  },
};

// --- Table API ---

export const tableApi = {
  async getTables(): Promise<Table[]> {
    return fetcher<Table[]>('/tables');
  },

  async getTableByNumber(tableNumber: number): Promise<Table | null> {
    // The backend returns a single object or null, so we use the fetcher directly
    return fetcher<Table | null>(`/tables/\${tableNumber}`);
  },

  async updateTableStatus(tableId: string, status: string, orderId?: string): Promise<void> {
    await fetcher<void>(`/tables/\${tableId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, current_order_id: orderId }),
    });
  },
};

// --- Order API ---

export const orderApi = {
  async createOrder(tableId: string, tableNumber: number): Promise<Order> {
    return fetcher<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify({ table_id: tableId, table_number: tableNumber }),
    });
  },

  async getOrder(orderId: string): Promise<Order | null> {
    return fetcher<Order | null>(`/orders/\${orderId}`);
  },

  async getOrdersByTable(tableNumber: number): Promise<Order[]> {
    return fetcher<Order[]>(`/orders/table/\${tableNumber}`);
  },

  async updateOrder(orderId: string, updates: Partial<Order>): Promise<void> {
    await fetcher<void>(`/orders/\${orderId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async updateOrderTotals(orderId: string): Promise<void> {
    // The backend handles the calculation and update in a single endpoint
    await fetcher<void>(`/orders/\${orderId}/totals`, {
      method: 'PUT',
    });
  },
};

// --- Order Item API ---

export const orderItemApi = {
  async addOrderItem(orderId: string, menuItemId: string, quantity: number, price: number, instructions?: string): Promise<OrderItem> {
    // The backend calculates the price based on menuItemId, so we don't need to pass 'price'
    return fetcher<OrderItem>(`/orders/\${orderId}/items`, {
      method: 'POST',
      body: JSON.stringify({
        menu_item_id: menuItemId,
        quantity,
        special_instructions: instructions,
      }),
    });
  },

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return fetcher<OrderItem[]>(`/orders/\${orderId}/items`);
  },

  async updateOrderItem(itemId: string, quantity: number): Promise<void> {
    await fetcher<void>(`/orders/items/\${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  },

  async deleteOrderItem(itemId: string): Promise<void> {
    await fetcher<void>(`/orders/items/\${itemId}`, {
      method: 'DELETE',
    });
  },

  async updateOrderItemStatus(itemId: string, status: string): Promise<void> {
    await fetcher<void>(`/orders/items/\${itemId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
};

// --- Payment API ---

export const paymentApi = {
  async createPayment(orderId: string, amount: number, paymentMethod: string): Promise<Payment> {
    return fetcher<Payment>('/payments', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId, amount, payment_method: paymentMethod }),
    });
  },

  async getPayment(paymentId: string): Promise<Payment | null> {
    return fetcher<Payment | null>(`/payments/\${paymentId}`);
  },

  async updatePaymentStatus(paymentId: string, status: string, stripeId?: string): Promise<void> {
    await fetcher<void>(`/payments/\${paymentId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, stripe_payment_intent_id: stripeId }),
    });
  },

  async getOrderPayments(orderId: string): Promise<Payment[]> {
    return fetcher<Payment[]>(`/payments/order/\${orderId}`);
  },
};

// --- Admin/Kitchen API (New Endpoints) ---

export const adminApi = {
  async getKitchenOrders(): Promise<any[]> { // Replace 'any[]' with a proper KitchenOrder type if defined
    return fetcher<any[]>('/admin/kitchen');
  },

  async getDashboardStats(): Promise<any> { // Replace 'any' with a proper DashboardStats type if defined
    return fetcher<any>('/admin/dashboard');
  },
};
