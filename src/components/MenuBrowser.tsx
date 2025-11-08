import { useState, useEffect } from 'react';
import { Plus, Minus, ShoppingCart, Clock } from 'lucide-react';
import { menuApi } from '../lib/api';
import { MenuItem } from '../lib/supabase';

interface Cart {
  [menuItemId: string]: {
    item: MenuItem;
    quantity: number;
    instructions: string;
  };
}

interface MenuBrowserProps {
  tableNumber: number;
  onCheckout: (cart: Cart) => void;
  isLoading?: boolean;
}

export function MenuBrowser({ tableNumber, onCheckout, isLoading }: MenuBrowserProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Cart>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const items = await menuApi.getMenuItems();
        setMenuItems(items);
        const uniqueCategories = Array.from(new Set(items.map(item => item.category)));
        setCategories(uniqueCategories);
        if (uniqueCategories.length > 0) {
          setSelectedCategory(uniqueCategories[0]);
        }
      } catch (error) {
        console.error('Failed to load menu:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMenu();
  }, []);

  const filteredItems = selectedCategory
    ? menuItems.filter(item => item.category === selectedCategory)
    : menuItems;

  const cartTotal = Object.values(cart).reduce(
    (sum, item) => sum + (item.item.price * item.quantity),
    0
  );

  const cartCount = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (item: MenuItem) => {
    setCart(prev => ({
      ...prev,
      [item.id]: {
        item,
        quantity: (prev[item.id]?.quantity || 0) + 1,
        instructions: prev[item.id]?.instructions || '',
      },
    }));
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const updated = { ...prev };
      if (updated[itemId]) {
        if (updated[itemId].quantity > 1) {
          updated[itemId].quantity -= 1;
        } else {
          delete updated[itemId];
        }
      }
      return updated;
    });
  };

  const handleCheckout = () => {
    if (cartCount > 0) {
      onCheckout(cart);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">تحميل القائمة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <div className="sticky top-0 bg-white shadow-sm z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-row-reverse items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">القائمة</h1>
              <p className="text-slate-600 text-sm">طاولة {tableNumber}</p>
            </div>
            <button
              onClick={handleCheckout}
              disabled={cartCount === 0 || isLoading}
              className="relative flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>الدفع</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          <div className="flex flex-row-reverse gap-2 overflow-x-auto pb-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap px-4 py-2 rounded-full font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 text-slate-900 hover:bg-slate-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              {item.image_url && (
                <div className="w-full h-48 bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              <div className="p-4">
                <h3 className="font-semibold text-slate-900 text-lg mb-1">{item.name}</h3>
                <p className="text-slate-600 text-sm mb-3 line-clamp-2">{item.description}</p>

                <div className="flex flex-row-reverse items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-blue-600">ج.م{item.price.toFixed(2)}</span>
                  <div className="flex items-center gap-1 text-slate-600 text-xs">
                    <Clock className="w-4 h-4" />
                    <span>{item.preparation_time_minutes} دقيقة</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  {cart[item.id] ? (
                    <div className="flex items-center gap-3 bg-slate-100 rounded-lg px-3 py-2">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-600 hover:text-slate-900 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-semibold text-slate-900 w-6 text-center">
                        {cart[item.id].quantity}
                      </span>
                      <button
                        onClick={() => addToCart(item)}
                        className="text-slate-600 hover:text-slate-900 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(item)}
                      className="flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      إضافة
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">إجمالي الطلب</p>
              <p className="text-3xl font-bold text-slate-900">ج.م{cartTotal.toFixed(2)}</p>
            </div>
            <button
              onClick={handleCheckout}
              disabled={isLoading}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              الدفع ({cartCount} عناصر)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
