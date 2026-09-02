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
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-500 to-brand-400 px-6 py-12 text-white shadow-lift sm:px-10 sm:py-16">
        <img
          src="/menu/hero-menu.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-800/80 via-brand-700/30 to-transparent" />
        <div className="relative max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
            🔥 Freshly prepared daily
          </span>
          <h1 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">Our Menu</h1>
          <p className="mt-2 max-w-md text-sm text-white/90 sm:text-base">
            Browse, filter, and add your favourites to the cart — dine-in or takeaway, your call.
          </p>
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:max-w-xs sm:flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input
            className="input pl-9"
            placeholder="Search dishes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className={
              categoryId === null
                ? 'rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition active:scale-95'
                : 'rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-brand-300 hover:text-brand-700 active:scale-95'
            }
            onClick={() => setCategoryId(null)}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              className={
                categoryId === c.id
                  ? 'rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition active:scale-95'
                  : 'rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-brand-300 hover:text-brand-700 active:scale-95'
              }
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
          <section key={categoryName} className="space-y-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
              <span className="h-5 w-1.5 rounded-full bg-brand-500" />
              {categoryName}
            </h2>
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
