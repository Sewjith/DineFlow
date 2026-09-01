import { useEffect, useMemo, useState } from 'react';
import { menuApi } from '../../api/menuApi';
import { toMessage } from '../../api/client';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import MenuItemCard from './MenuItemCard';

export default function MenuPage() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState(null);

  // Load categories once.
  useEffect(() => {
    menuApi.listCategories().then(setCategories).catch(() => {});
  }, []);

  // Reload items whenever the filters change (server-side search/filter).
  useEffect(() => {
    setLoading(true);
    const params = {};
    if (categoryId) params.categoryId = categoryId;
    if (search.trim()) params.search = search.trim();
    const handle = setTimeout(() => {
      menuApi
        .listItems(params)
        .then((data) => {
          setItems(data);
          setError('');
        })
        .catch((e) => setError(toMessage(e, 'Failed to load the menu')))
        .finally(() => setLoading(false));
    }, 250); // debounce typing
    return () => clearTimeout(handle);
  }, [search, categoryId]);

  // Group items by category name for display.
  const grouped = useMemo(() => {
    const map = new Map();
    for (const item of items) {
      if (!map.has(item.categoryName)) map.set(item.categoryName, []);
      map.get(item.categoryName).push(item);
    }
    return Array.from(map.entries());
  }, [items]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Our Menu</h1>
        <p className="text-sm text-slate-500">Browse, filter, and add dishes to your cart.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          className="input sm:max-w-xs"
          placeholder="Search dishes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <button
            className={categoryId === null ? 'btn-primary' : 'btn-ghost'}
            onClick={() => setCategoryId(null)}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              className={categoryId === c.id ? 'btn-primary' : 'btn-ghost'}
              onClick={() => setCategoryId(c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {loading ? (
        <Spinner label="Loading menu…" />
      ) : grouped.length === 0 ? (
        <p className="py-10 text-center text-slate-500">No dishes match your search.</p>
      ) : (
        grouped.map(([categoryName, categoryItems]) => (
          <section key={categoryName} className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-700">{categoryName}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categoryItems.map((item) => (
                <MenuItemCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
