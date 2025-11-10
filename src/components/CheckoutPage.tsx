import { useState, useEffect } from "react";
import { ArrowLeft, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { orderApi, orderItemApi } from "../lib/api";
import { MenuItem, Order } from "../lib/supabase";
import { CreditCard, Smartphone, Wallet } from "lucide-react";

interface Cart {
  [menuItemId: string]: {
    item: MenuItem;
    quantity: number;
    instructions: string;
  };
}

interface CheckoutPageProps {
  tableNumber: number;
  cart: Cart;
  onBack: () => void;
  onOrderComplete: (order: Order) => void;
}

export function CheckoutPage({
  tableNumber,
  cart,
  onBack,
  onOrderComplete,
}: CheckoutPageProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState<string | null>(null);
const [paymentMethod, setPaymentMethod] = useState<"card" | "wallet" | "cash">("card");

  const subtotal = Object.values(cart).reduce(
    (sum, item) => sum + item.item.price * item.quantity,
    0
  );

  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handlePlaceOrder = async () => {
    setLoading(true);

    setError(null);

    try {
      const orders = await orderApi.getOrdersByTable(tableNumber);
      // let tableData = null;

      if (orders.length === 0) {
        return;
      }

      const currentOrder = orders[0];

      for (const [menuItemId, cartItem] of Object.entries(cart)) {
        await orderItemApi.addOrderItem(
          currentOrder.id,
          menuItemId,
          cartItem.quantity,
          cartItem.item.price,
          cartItem.instructions || undefined
        );
      }

      await orderApi.updateOrderTotals(currentOrder.id);
      await orderApi.updateOrder(currentOrder.id, { status: "confirmed" });

      const maxPrepTime = Math.max(
        ...Object.values(cart).map((item) => item.item.preparation_time_minutes)
      );

      const readyTime = new Date(Date.now() + maxPrepTime * 60000);
      setEstimatedTime(
        readyTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
      setOrderPlaced(true);

      const updatedOrder = await orderApi.getOrder(currentOrder.id);
      if (updatedOrder) {
        onOrderComplete(updatedOrder);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="mb-6">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
            </div>

            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              تم تأكيد الطلب!
            </h1>
            <p className="text-slate-600 mb-6">تم إرسال الطلب إلى المطبخ</p>

            <div className="bg-blue-50 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-600">رقم الطاولة</span>
                <span className="text-2xl font-bold text-blue-600">
                  #{tableNumber}
                </span>
              </div>
              <div className="border-t border-blue-200 pt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-slate-600">جاهز في حوالي</span>
                </div>
                <span className="font-bold text-blue-600">{estimatedTime}</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left">
              <h3 className="font-semibold text-slate-900 mb-3">ملخص الطلب</h3>
              <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                {Object.values(cart).map((cartItem, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-slate-600">
                      {cartItem.quantity}x {cartItem.item.name}
                    </span>
                    <span className="font-semibold text-slate-900">
                      ${(cartItem.item.price * cartItem.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-200 pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">المجموع الفرعي</span>
                  <span className="text-slate-900">
                    ج.م{subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tax (10%)</span>
                  <span className="text-slate-900">ج.م{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-slate-200">
                  <span className="text-slate-900">إجمالي</span>
                  <span className="text-blue-600">ج.م{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-6">
              سيتم إحضار طلبك إلى الطاولة وسيتم معالجة الدفع عندما تكون جاهزًا.
            </p>

            <button
              onClick={onBack}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              استمر في تصفح القائمة
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-8">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 font-semibold mb-6 hover:text-blue-700"
        >
          <ArrowLeft className="w-5 h-5" />
          الرجوع إلى القائمة
        </button>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            مراجعة الطلب
          </h1>
          <p className="text-slate-600 mb-8">الطاولة {tableNumber}</p>

          <div className="bg-slate-50 rounded-xl p-6 mb-8">
            <h2 className="font-semibold text-slate-900 mb-4">عناصر</h2>
            <div className="space-y-4">
              {Object.values(cart).map((cartItem, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-start pb-4 border-b border-slate-200 last:border-0 last:pb-0"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">
                      {cartItem.item.name}
                    </p>
                    <p className="text-sm text-slate-600">
                      قطعة: {cartItem.quantity}
                    </p>
                    {cartItem.instructions && (
                      <p className="text-sm text-slate-500 italic mt-1">
                        ملاحظة: {cartItem.instructions}
                      </p>
                    )}
                  </div>
                  <p className="font-semibold text-slate-900 text-right">
                    ج.م {(cartItem.item.price * cartItem.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 mb-8">
            <div className="space-y-3">
              <div className="flex justify-between text-slate-700">
                <span>المجموع الفرعي</span>
                <span>ج.م{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>الضريبة (10%)</span>
                <span>ج.م{tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-blue-200 pt-3 flex justify-between text-xl font-bold text-slate-900">
                <span>الإجمالي</span>
                <span className="text-blue-600">ج.م{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-900">خطأ</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <div className="bg-slate-100 rounded-2xl p-5 mb-6 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-4 text-lg">
              طريقة الدفع
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* بطاقة بنكية */}
              <button
                onClick={() => setPaymentMethod("card")}
                className={`flex flex-col items-center justify-center gap-2 py-4 rounded-xl border transition-all duration-200 ${
                  paymentMethod === "card"
                    ? "bg-blue-600 text-white border-blue-600 shadow-md scale-[1.02]"
                    : "bg-white text-slate-700 border-slate-300 hover:border-blue-400 hover:shadow"
                }`}
              >
                <CreditCard className="w-6 h-6" />
                <span className="font-semibold text-sm">بطاقة بنكية</span>
              </button>

              {/* محفظة إلكترونية */}
              <button
                onClick={() => setPaymentMethod("wallet")}
                className={`flex flex-col items-center justify-center gap-2 py-4 rounded-xl border transition-all duration-200 ${
                  paymentMethod === "wallet"
                    ? "bg-blue-600 text-white border-blue-600 shadow-md scale-[1.02]"
                    : "bg-white text-slate-700 border-slate-300 hover:border-blue-400 hover:shadow"
                }`}
              >
                <Smartphone className="w-6 h-6" />
                <span className="font-semibold text-sm">محفظة إلكترونية</span>
              </button>

              {/* الدفع عند الاستلام */}
              <button
                onClick={() => setPaymentMethod("cash")}
                className={`flex flex-col items-center justify-center gap-2 py-4 rounded-xl border transition-all duration-200 ${
                  paymentMethod === "cash"
                    ? "bg-blue-600 text-white border-blue-600 shadow-md scale-[1.02]"
                    : "bg-white text-slate-700 border-slate-300 hover:border-blue-400 hover:shadow"
                }`}
              >
                <Wallet className="w-6 h-6" />
                <span className="font-semibold text-sm">كاش عند الاستلام</span>
              </button>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-4 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 mb-4"
          >
            {loading ? "Placing Order..." : "Place Order"}
          </button>

          <p className="text-center text-sm text-slate-600">
            سيتم إعداد طلبك وسيتم تحصيل الدفع في طاولتك
          </p>
        </div>
      </div>
    </div>
  );
}
