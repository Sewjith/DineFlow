import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'dineflow.cart';

export function CartProvider({ children }) {
  // Each line: { menuItemId, name, price, quantity }
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((menuItem, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.menuItemId === menuItem.id);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === menuItem.id ? { ...i, quantity: i.quantity + quantity } : i,
        );
      }
      return [
        ...prev,
        { menuItemId: menuItem.id, name: menuItem.name, price: menuItem.price, quantity },
      ];
    });
  }, []);

  const setQuantity = useCallback((menuItemId, quantity) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.menuItemId !== menuItemId)
        : prev.map((i) => (i.menuItemId === menuItemId ? { ...i, quantity } : i)),
    );
  }, []);

  const removeItem = useCallback((menuItemId) => {
    setItems((prev) => prev.filter((i) => i.menuItemId !== menuItemId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  /**
   * Reconciles the persisted cart against the live menu (a Map of id → menu item built
   * from a *complete* menu fetch — the customer menu returns sold-out items too, so an
   * id absent from it has been deleted). Marks gone/sold-out lines `unavailable` and
   * refreshes prices to the server's current value (flagging `priceChanged` for the UI).
   * Only call after a successful fetch, so a partial list never wrongly voids the cart.
   */
  const reconcile = useCallback((liveById) => {
    setItems((prev) =>
      prev.map((i) => {
        const live = liveById.get(i.menuItemId);
        if (live === undefined || !live.available) {
          return { ...i, unavailable: true, priceChanged: false };
        }
        return {
          ...i,
          unavailable: false,
          priceChanged: live.price !== i.price,
          price: live.price,
        };
      }),
    );
  }, []);

  // Unavailable lines can't be ordered, so they don't count toward the payable total.
  const total = useMemo(
    () => items.reduce((sum, i) => (i.unavailable ? sum : sum + i.price * i.quantity), 0),
    [items],
  );
  const count = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const hasUnavailable = useMemo(() => items.some((i) => i.unavailable), [items]);

  const value = useMemo(
    () => ({ items, addItem, setQuantity, removeItem, clear, reconcile, total, count, hasUnavailable }),
    [items, addItem, setQuantity, removeItem, clear, reconcile, total, count, hasUnavailable],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
