import { useEffect, useState } from 'react';
import { menuApi } from '../../api/menuApi';
import { toMessage } from '../../api/client';
import { formatMoney } from '../../lib/format';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import MenuItemFormModal from './MenuItemFormModal';

export default function MenuManagePage() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // item | 'new' | null
  const [newCategory, setNewCategory] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [cats, its] = await Promise.all([menuApi.listCategories(), menuApi.listItems()]);
      setCategories(cats);
      setItems(its);
      setError('');
    } catch (e) {
      setError(toMessage(e, 'Failed to load menu'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const act = async (fn, confirmMsg) => {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    try {
      await fn();
      await load();
    } catch (e) {
      setError(toMessage(e, 'Action failed'));
    }
  };

  const addCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    await act(() => menuApi.createCategory({ name: newCategory.trim() }));
    setNewCategory('');
  };

  if (loading) return <Spinner label="Loading menu…" />;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Menu management</h1>
        <button className="btn-primary" onClick={() => setEditing('new')} disabled={categories.length === 0}>
          + New item
        </button>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {/* Categories */}
      <section className="card p-5">
        <h2 className="mb-3 font-semibold text-slate-700">Categories</h2>
        <div className="mb-4 flex flex-wrap gap-2">
          {categories.map((c) => (
            <span key={c.id} className="badge flex items-center gap-2 bg-slate-100 text-slate-700">
              {c.name}
              <button
                className="text-red-500 hover:text-red-700"
                title="Delete category"
                onClick={() =>
                  act(
                    () => menuApi.deleteCategory(c.id),
                    `Delete category "${c.name}"? (only works if it has no items)`,
                  )
                }
              >
                ✕
              </button>
            </span>
          ))}
        </div>
        <form className="flex gap-2" onSubmit={addCategory}>
          <input
            className="input max-w-xs"
            placeholder="New category name"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <button className="btn-ghost">Add</button>
        </form>
      </section>

      {/* Items */}
      <section className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Available</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 font-medium text-slate-800">{item.name}</td>
                <td className="px-4 py-3 text-slate-500">{item.categoryName}</td>
                <td className="px-4 py-3">{formatMoney(item.price)}</td>
                <td className="px-4 py-3">
                  <button
                    className={`badge ${
                      item.available ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'
                    }`}
                    onClick={() => act(() => menuApi.setAvailability(item.id, !item.available))}
                    title="Toggle availability"
                  >
                    {item.available ? 'Available' : 'Sold out'}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="mr-3 text-brand-700 hover:underline" onClick={() => setEditing(item)}>
                    Edit
                  </button>
                  <button
                    className="text-red-500 hover:underline"
                    onClick={() => act(() => menuApi.deleteItem(item.id), `Delete "${item.name}"?`)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {editing && (
        <MenuItemFormModal
          item={editing === 'new' ? null : editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}
