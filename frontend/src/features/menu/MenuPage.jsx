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

  const chipClass = (active) =>
    active
      ? 'rounded-full bg-ink px-4 py-1.5 text-sm text-white transition-colors'
      : 'rounded-full border border-stone-300 px-4 py-1.5 text-sm text-stone-600 transition-colors hover:border-ink hover:text-ink';

  return (
    <div className="space-y-10">
      <header className="max-w-2xl">
        <p className="eyebrow">The menu</p>
        <h1 className="mt-3 text-4xl font-semibold leading-[1.1] text-ink sm:text-5xl">
          Fresh, seasonal, made to order.
        </h1>
        <p className="mt-4 text-stone-500">
          Browse the menu and build your order — dine-in or takeaway, your call.
        </p>
      </header>

      <div className="flex flex-col gap-4 border-y border-stone-200 py-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          className="input sm:max-w-xs"
          placeholder="Search dishes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <button className={chipClass(categoryId === null)} onClick={() => setCategoryId(null)}>
            All
          </button>
          {categories.map((c) => (
            <button key={c.id} className={chipClass(categoryId === c.id)} onClick={() => setCategoryId(c.id)}>
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {loading ? (
        <Spinner label="Loading menu…" />
      ) : grouped.length === 0 ? (
        <p className="py-16 text-center text-stone-400">No dishes match your search.</p>
      ) : (
        grouped.map(([categoryName, categoryItems]) => (
          <section key={categoryName} className="space-y-5">
            <h2 className="text-sm font-medium uppercase tracking-widest text-stone-400">
              {categoryName}
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
