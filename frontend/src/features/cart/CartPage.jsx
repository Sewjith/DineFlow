import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatMoney } from '../../lib/format';

export default function CartPage() {
  const { items, setQuantity, removeItem, total } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="text-lg font-medium text-slate-700">Your cart is empty</p>
        <p className="mt-1 text-sm text-slate-500">Add some dishes from the menu to get started.</p>
        <Link to="/" className="btn-primary mt-4">
          Browse the menu
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Your Cart</h1>

      <div className="card divide-y divide-slate-100">
        {items.map((item) => (
          <div key={item.menuItemId} className="flex items-center gap-4 p-4">
            <div className="flex-1">
              <p className="font-medium text-slate-800">{item.name}</p>
              <p className="text-sm text-slate-500">{formatMoney(item.price)} each</p>
            </div>
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
            <div className="w-20 text-right font-semibold text-slate-800">
              {formatMoney(item.price * item.quantity)}
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
          <span className="text-slate-500">Total: </span>
          <span className="font-bold text-slate-800">{formatMoney(total)}</span>
        </div>
        <button className="btn-primary" onClick={() => navigate('/checkout')}>
          Proceed to checkout
        </button>
      </div>
      <p className="text-xs text-slate-400">
        The final total is confirmed by the server from live menu prices.
      </p>
    </div>
  );
}
