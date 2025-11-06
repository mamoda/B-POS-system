import { useState } from 'react';
import { UtensilsCrossed } from 'lucide-react';

interface TableSelectionProps {
  onTableSelected: (tableNumber: number) => void;
  isLoading?: boolean;
}

export function TableSelection({ onTableSelected, isLoading }: TableSelectionProps) {
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (selectedTable === null) return;
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 300));
    onTableSelected(selectedTable);
  };

  const tables = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-center mb-8">
            <UtensilsCrossed className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-slate-900">B-POS</h1>
          </div>

          <p className="text-center text-slate-600 mb-8">
            اختر الطاولة
          </p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            {tables.map((table) => (
              <button
                key={table}
                onClick={() => setSelectedTable(table)}
                disabled={isLoading}
                className={`p-4 rounded-lg font-semibold transition-all duration-200 ${
                  selectedTable === table
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                    : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                } disabled:opacity-50`}
              >
                طاولة {table}
              </button>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={selectedTable === null || isSubmitting || isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'بدأ الطلب...' : ' ابدأ الطلب'}
          </button>
        </div>

        <div className="text-center mt-6 text-slate-600 text-sm">
          <p>الطاولات 1-12 متاحة</p>
        </div>
      </div>
    </div>
  );
}
