import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import useCartReconcile from '../../hooks/useCartReconcile';
import { formatMoney } from '../../lib/format';
import Alert from '../../components/Alert';

export default function CartPage() {
  const { items, setQuantity, removeItem, total, hasUnavailable } = useCart();
  const navigate = useNavigate();
  useCartReconcile();

  if (items.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="text-lg font-medium text-stone-700">Your cart is empty</p>
        <p className="mt-1 text-sm text-stone-500">Add some dishes from the menu to get started.</p>
        <Link to="/" className="btn-primary mt-4">
          Browse the menu
        </Link>
      </div>
    );
  }

  const priceChanged = items.some((i) => i.priceChanged);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-stone-800">Your Cart</h1>

      {hasUnavailable && (
        <Alert type="error">
          Some items are no longer available and have been marked below. Remove them to check out.
        </Alert>
      )}
      {!hasUnavailable && priceChanged && (
        <Alert type="info">Some prices have changed since you added them — your total is updated.</Alert>
      )}

      <div className="card divide-y divide-stone-100">
        {items.map((item) => (
          <div
            key={item.menuItemId}
            className={`flex items-center gap-4 p-4 ${item.unavailable ? 'bg-red-50' : ''}`}
          >
            <div className="flex-1">
              <p className="font-medium text-stone-800">{item.name}</p>
              {item.unavailable ? (
                <p className="text-sm font-medium text-red-600">No longer available</p>
              ) : (
                <p className="text-sm text-stone-500">
                  {formatMoney(item.price)} each
                  {item.priceChanged && <span className="ml-2 text-amber-600">· price updated</span>}
                </p>
              )}
            </div>
            {!item.unavailable && (
              <div className="flex items-center gap-2">
                <button
                  className="btn-ghost h-8 w-8 p-0"
                  onClick={() => setQuantity(item.menuItemId, item.quantity - 1)}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                <button
                  className="btn-ghost h-8 w-8 p-0"
                  onClick={() => setQuantity(item.menuItemId, item.quantity + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            )}
            <div className="w-20 text-right font-semibold text-stone-800">
              {item.unavailable ? '—' : formatMoney(item.price * item.quantity)}
            </div>
            <button
              className="text-sm text-red-500 hover:underline"
              onClick={() => removeItem(item.menuItemId)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-lg">
          <span className="text-stone-500">Total: </span>
          <span className="font-bold text-stone-800">{formatMoney(total)}</span>
        </div>
        <button
          className="btn-primary disabled:pointer-events-none disabled:opacity-40"
          disabled={hasUnavailable}
          onClick={() => navigate('/checkout')}
        >
          Proceed to checkout
        </button>
      </div>
      {hasUnavailable && (
        <p className="text-right text-xs text-red-500">Remove unavailable items to continue.</p>
      )}
      <p className="text-xs text-stone-400">
        The final total is confirmed by the server from live menu prices.
      </p>
    </div>
  );
}
