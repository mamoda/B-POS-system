import { useState, useEffect, useCallback } from 'react';
import { orderApi, orderItemApi } from '../lib/api';
import { Order, OrderItem, MenuItem } from '../lib/supabase';
import { supabase } from '../lib/supabase';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export function KitchenDisplay() {
  const [orders, setOrders] = useState<(Order & { items?: (OrderItem & { menu_item?: MenuItem })[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadOrders = useCallback(async () => {
    try {
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .in('status', ['confirmed', 'preparing'])
        .order('created_at', { ascending: true });

      if (ordersData) {
        const ordersWithItems = await Promise.all(
          ordersData.map(async (order: Order) => {
            const items = await orderItemApi.getOrderItems(order.id);
            const itemsWithMenu = await Promise.all(
              items.map(async (item: OrderItem) => {
                const { data: menuItem } = await supabase
                  .from('menu_items')
                  .select('*')
                  .eq('id', item.menu_item_id)
                  .single();
                return { ...item, menu_item: menuItem };
              })
            );
            return { ...order, items: itemsWithMenu };
          })
        );
        setOrders(ordersWithItems);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 3000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  const handleItemReady = async (itemId: string) => {
    try {
      await orderItemApi.updateOrderItemStatus(itemId, 'ready');
      await loadOrders();
    } catch (error) {
      console.error('Failed to update item status:', error);
    }
  };

  const handleOrderComplete = async (orderId: string) => {
    try {
      await orderApi.updateOrder(orderId, { status: 'ready_for_pickup' });
      await loadOrders();
    } catch (error) {
      console.error('Failed to complete order:', error);
    }
  };

  const getOrderItemStatus = (items?: (OrderItem & { menu_item?: MenuItem })[]) => {
    if (!items) return 'pending';
    const allReady = items.every(item => item.status === 'ready' || item.status === 'completed');
    return allReady ? 'complete' : 'preparing';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-blue-400">تحميل الطلبات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-row-reverse min-h-screen bg-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex  flex-row-reverse items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">عرض المطبخ</h1>
            <p className="text-slate-400 mt-1">{orders.length} طلبات نشطة</p>
          </div>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              autoRefresh
                ? 'bg-green-600 text-white'
                : 'bg-slate-700 text-slate-300'
            }`}
          >
            {autoRefresh ? 'تحديث تلقائي: ON' : 'تحديث تلقائي: OFF'}
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-xl text-slate-300">لا طلبات نشطة</p>
            <p className="text-slate-500 mt-2">المطبخ جاهز!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map(order => {
              const status = getOrderItemStatus(order.items);
              const allItemsReady = order.items?.every(item => item.status === 'ready' || item.status === 'completed');

              return (
                <div
                  key={order.id}
                  className={`rounded-xl overflow-hidden shadow-lg transition-all ${
                    status === 'complete'
                      ? 'bg-green-900 border-2 border-green-500'
                      : 'bg-slate-800 border-2 border-slate-700'
                  }`}
                >
                  <div className="p-4">
                    <div className="flex flex-row-reverse items-center justify-between mb-4">
                      <h2 className="text-3xl font-bold text-white">طاولة {order.table_number}</h2>
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        status === 'complete'
                          ? 'bg-green-500 text-white'
                          : 'bg-yellow-500 text-slate-900'
                      }`}>
                        {status === 'complete' ? 'READY' : 'PREPARING'}
                      </div>
                    </div>

                    <div className="bg-slate-700 rounded-lg p-3 mb-4">
                      <div className="flex flex-row-reverse items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <span className="text-slate-300 text-sm">
                          تم تقديم الطلب: {new Date(order.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      {order.estimated_ready_time && (
                        <div className="text-blue-400 font-semibold">
                          من المتوقع أن يكون جاهزًا: {new Date(order.estimated_ready_time).toLocaleTimeString()}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 mb-4">
                      {order.items?.map(item => (
                        <div
                          key={item.id}
                          className={`flex items-start justify-between p-3 rounded-lg ${
                            item.status === 'ready'
                              ? 'bg-green-700'
                              : 'bg-slate-700'
                          }`}
                        >
                          <div className="flex-1">
                            <p className="text-white font-semibold">
                              {item.quantity}x {item.menu_item?.name}
                            </p>
                            {item.special_instructions && (
                              <p className="text-sm text-slate-300 mt-1 italic">
                                تذكير: {item.special_instructions}
                              </p>
                            )}
                          </div>
                          {item.status !== 'ready' && item.status !== 'completed' && (
                            <button
                              onClick={() => handleItemReady(item.id)}
                              className="ml-2 px-3 py-1 bg-blue-600 text-white text-xs rounded font-semibold hover:bg-blue-700 transition-colors"
                            >
                              جاهز
                            </button>
                          )}
                          {(item.status === 'ready' || item.status === 'completed') && (
                            <CheckCircle2 className="w-5 h-5 text-green-400 ml-2 flex-shrink-0 mt-0.5" />
                          )}
                        </div>
                      ))}
                    </div>

                    {allItemsReady && (
                      <button
                        onClick={() => handleOrderComplete(order.id)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        الطلب مكتمل - جاهز للاستلام
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
