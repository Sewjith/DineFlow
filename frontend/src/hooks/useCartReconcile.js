import { useEffect, useState } from 'react';
import { menuApi } from '../api/menuApi';
import { useCart } from '../context/CartContext';

/**
 * On mount, fetches the full menu and reconciles the persisted cart against it
 * (sold-out / deleted / price-changed lines). Returns { checking } for a loading hint.
 * Safe on an empty cart — it simply no-ops after the fetch.
 */
export default function useCartReconcile() {
  const { reconcile } = useCart();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    menuApi
      .listItems()
      .then((live) => {
        if (cancelled) return;
        reconcile(new Map(live.map((i) => [i.id, i])));
      })
      .catch(() => {
        // Leave the cart as-is on a failed fetch; the server still validates at checkout.
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { checking };
}
