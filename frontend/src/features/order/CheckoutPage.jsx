import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { orderApi } from '../../api/orderApi';
import { toMessage } from '../../api/client';
import { formatMoney } from '../../lib/format';
import Alert from '../../components/Alert';

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    orderType: 'DINE_IN',
    tableNumber: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  if (items.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="text-lg font-medium text-stone-700">Nothing to check out</p>
        <Link to="/" className="btn-primary mt-4">
          Browse the menu
        </Link>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        customerName: form.customerName,
        phone: form.phone,
        orderType: form.orderType,
        tableNumber:
          form.orderType === 'DINE_IN' && form.tableNumber ? Number(form.tableNumber) : null,
        items: items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
      };
      const order = await orderApi.place(payload);
      clear();
      navigate(`/track?ref=${order.reference}`, { state: { justPlaced: true } });
    } catch (err) {
      setError(toMessage(err, 'Could not place your order'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-stone-800">Checkout</h1>

      <form className="card space-y-4 p-6" onSubmit={submit}>
        {error && <Alert type="error">{error}</Alert>}

        <div>
          <label className="label">Name</label>
          <input className="input" required value={form.customerName} onChange={update('customerName')} />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" required value={form.phone} onChange={update('phone')} />
        </div>

        <div>
          <label className="label">Order type</label>
          <div className="flex gap-2">
            {['DINE_IN', 'TAKEAWAY'].map((type) => (
              <button
                type="button"
                key={type}
                className={form.orderType === type ? 'btn-primary flex-1' : 'btn-ghost flex-1'}
                onClick={() => setForm({ ...form, orderType: type })}
              >
                {type === 'DINE_IN' ? 'Dine-in' : 'Takeaway'}
              </button>
            ))}
          </div>
        </div>

        {form.orderType === 'DINE_IN' && (
          <div>
            <label className="label">Table number</label>
            <input
              className="input"
              type="number"
              min="1"
              required
              value={form.tableNumber}
              onChange={update('tableNumber')}
            />
          </div>
        )}

        <div className="flex items-center justify-between border-t border-stone-100 pt-4">
          <span className="text-lg font-bold text-stone-800">{formatMoney(total)}</span>
          <button className="btn-primary" disabled={submitting}>
            {submitting ? 'Placing…' : 'Place order'}
          </button>
        </div>
      </form>
    </div>
  );
}
