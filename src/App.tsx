import { useState, useEffect } from 'react';
import { TableSelection } from './components/TableSelection';
import { MenuBrowser } from './components/MenuBrowser';
import { CheckoutPage } from './components/CheckoutPage';
import { KitchenDisplay } from './components/KitchenDisplay';
import { AdminDashboard } from './components/AdminDashboard';
import { orderApi, tableApi } from '../backend/src/lib/api';
import { Order } from '../backend/src/lib/supabase';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  preparation_time_minutes: number;
}

interface CartItem {
  item: MenuItem;
  quantity: number;
  instructions: string;
}

interface Cart {
  [menuItemId: string]: CartItem;
}

type Page = 'table-selection' | 'menu' | 'checkout' | 'order-placed' | 'kitchen' | 'admin';

function App() {
  const [page, setPage] = useState<Page>('table-selection');
  const [tableNumber, setTableNumber] = useState<number | null>(null);
  const [cart, setCart] = useState<Cart>({});
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTableSelected = async (table: number) => {
    setIsLoading(true);
    try {
      const tableData = await tableApi.getTableByNumber(table);
      if (tableData) {
        const order = await orderApi.createOrder(tableData.id, table);
        setCurrentOrder(order);
        setTableNumber(table);
        setPage('menu');
      }
    } catch (error) {
      console.error('Error selecting table:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckout = (cartItems: Cart) => {
    setCart(cartItems);
    setPage('checkout');
  };

  const handleOrderComplete = (order: Order) => {
    setCurrentOrder(order);
    setCart({});
    setPage('order-placed');
  };

  const goBackToMenu = () => {
    setCart({});
    setPage('menu');
  };

  const reset = () => {
    setPage('table-selection');
    setTableNumber(null);
    setCart({});
    setCurrentOrder(null);
  };

  const goToKitchen = () => {
    setPage('kitchen');
  };

  const goToAdmin = () => {
    setPage('admin');
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const view = urlParams.get('view');

    if (view === 'kitchen') {
      setPage('kitchen');
    } else if (view === 'admin') {
      setPage('admin');
    }
  }, []);

  return (
    <div>
      {page === 'table-selection' && (
        <TableSelection onTableSelected={handleTableSelected} isLoading={isLoading} />
      )}

      {page === 'menu' && tableNumber && (
        <div>
          <MenuBrowser
            tableNumber={tableNumber}
            onCheckout={handleCheckout}
            isLoading={isLoading}
          />
          <div className="fixed top-4 right-4 z-50 space-y-2">
            <button
              onClick={() => window.location.href = '?view=admin'}
              className="block w-full px-4 py-2 bg-slate-700 text-white text-sm rounded-lg hover:bg-slate-800 transition-colors"
            >
              Admin
            </button>
            <button
              onClick={() => window.location.href = '?view=kitchen'}
              className="block w-full px-4 py-2 bg-slate-700 text-white text-sm rounded-lg hover:bg-slate-800 transition-colors"
            >
              Kitchen
            </button>
          </div>
        </div>
      )}

      {page === 'checkout' && tableNumber && currentOrder && (
        <CheckoutPage
          tableNumber={tableNumber}
          cart={cart}
          onBack={goBackToMenu}
          onOrderComplete={handleOrderComplete}
        />
      )}

      {page === 'order-placed' && tableNumber && currentOrder && (
        <div>
          <CheckoutPage
            tableNumber={tableNumber}
            cart={cart}
            onBack={goBackToMenu}
            onOrderComplete={handleOrderComplete}
          />
        </div>
      )}

      {page === 'kitchen' && (
        <div>
          <KitchenDisplay />
          <div className="fixed top-4 right-4 z-50 space-y-2">
            <button
              onClick={() => window.location.href = '/'}
              className="block px-4 py-2 bg-slate-700 text-white text-sm rounded-lg hover:bg-slate-800 transition-colors"
            >
              Back to Menu
            </button>
          </div>
        </div>
      )}

      {page === 'admin' && (
        <div>
          <AdminDashboard />
          <div className="fixed top-4 right-4 z-50 space-y-2">
            <button
              onClick={() => window.location.href = '/'}
              className="block px-4 py-2 bg-slate-700 text-white text-sm rounded-lg hover:bg-slate-800 transition-colors"
            >
              Back to Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
