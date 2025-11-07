import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, BarChart3 } from 'lucide-react';
import { supabase, MenuItem } from '../lib/supabase';

export function AdminDashboard() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    image_url: '',
    available: true,
    preparation_time_minutes: '15',
  });
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      const { data } = await supabase
        .from('menu_items')
        .select('*')
        .order('category', { ascending: true });

      if (data) {
        setMenuItems(data);
        const uniqueCategories = Array.from(new Set(data.map(item => item.category)));
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Failed to load menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        await supabase
          .from('menu_items')
          .update({
            ...formData,
            price: parseFloat(formData.price),
            preparation_time_minutes: parseInt(formData.preparation_time_minutes),
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId);
      } else {
        await supabase
          .from('menu_items')
          .insert({
            ...formData,
            price: parseFloat(formData.price),
            preparation_time_minutes: parseInt(formData.preparation_time_minutes),
          });
      }

      await loadMenuItems();
      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: '',
        description: '',
        category: '',
        price: '',
        image_url: '',
        available: true,
        preparation_time_minutes: '15',
      });
    } catch (error) {
      console.error('Failed to save menu item:', error);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setFormData({
      name: item.name,
      description: item.description,
      category: item.category,
      price: item.price.toString(),
      image_url: item.image_url || '',
      available: item.available,
      preparation_time_minutes: item.preparation_time_minutes.toString(),
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await supabase.from('menu_items').delete().eq('id', id);
      await loadMenuItems();
    } catch (error) {
      console.error('Failed to delete menu item:', error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      price: '',
      image_url: '',
      available: true,
      preparation_time_minutes: '15',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">جارٍ تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-row-reverse items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              لوحة التحكم
            </h1>
            <p className="text-slate-600 mt-1">{menuItems.length} عناصر القائمة</p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              إضافة عنصر
            </button>
          )}
        </div>

        {showForm && (
          <div className=" bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              {editingId ? 'Edit Menu Item' : 'Add New Menu Item'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    الاسم *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    النوع *
                  </label>
                  <input
                    type="text"
                    required
                    list="categories"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <datalist id="categories">
                    {categories.map(cat => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    اسعر * (ج.م)
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                     وقت التحضير (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.preparation_time_minutes}
                    onChange={(e) => setFormData({ ...formData, preparation_time_minutes: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  الوصف
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                   رابط الصورة
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.available}
                    onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-slate-900 font-semibold">متاح</span>
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  {editingId ? 'Update Item' : 'Add Item'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-slate-300 text-slate-900 py-3 rounded-lg font-semibold hover:bg-slate-400 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        <div className=" bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200">
                   <th className="px-6 py-4  text-right text-sm font-semibold text-slate-900">
                    الأحداث
                  </th>
                   <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                    متاح
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                    وقت التحضير
                  </th>
                 <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                    السعر
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                    النوع
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                    الاسم
                  </th>
               </tr>
              </thead>
              <tbody className="w-full">
                {menuItems.map(item => (
                  <tr key={item.id} className=" border-b border-slate-200 hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-8 text-right flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                     <td className="px-6 py-4 text-right">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          item.available
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {item.available ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-600">
                      {item.preparation_time_minutes} دقيقة
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-blue-600">
                       ج.م {item.price.toFixed(2)}
                    </td>
                     <td className="px-6 py-4 text-right text-slate-600">{item.category}</td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-900">{item.name}</td>
                </tr>
                ))}
              </tbody>
            </table>
          </div>

          {menuItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-600 text-lg">  لا منتجات في القائمة حتى الآن قم بإنشاء منتج الآن</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
