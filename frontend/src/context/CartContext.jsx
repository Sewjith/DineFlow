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

  const total = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items],
  );
  const count = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  const value = useMemo(
    () => ({ items, addItem, setQuantity, removeItem, clear, total, count }),
    [items, addItem, setQuantity, removeItem, clear, total, count],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
