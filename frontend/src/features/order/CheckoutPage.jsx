import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import useCartReconcile from '../../hooks/useCartReconcile';
import { orderApi } from '../../api/orderApi';
import { tableApi } from '../../api/tableApi';
import { toMessage } from '../../api/client';
import { formatMoney } from '../../lib/format';
import { validateName, validatePhone, fieldClass } from '../../lib/validate';
import useFieldErrors from '../../hooks/useFieldErrors';
import Alert from '../../components/Alert';
import FieldError from '../../components/FieldError';

export default function CheckoutPage() {
  const { items, total, clear, hasUnavailable } = useCart();
  const navigate = useNavigate();
  useCartReconcile();

  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    orderType: 'DINE_IN',
    tableLabel: '',
  });
  const [tables, setTables] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const errs = useFieldErrors({
    customerName: () => validateName(form.customerName),
    phone: () => validatePhone(form.phone),
    tableLabel: () =>
      form.orderType === 'DINE_IN' && !form.tableLabel ? 'Please select a table' : '',
  });

  useEffect(() => {
    tableApi
      .list()
      .then(setTables)
      .catch(() => setTables([]));
  }, []);

  const update = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    errs.clear(field);
  };

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
    if (hasUnavailable) {
      setError('Some items are no longer available. Please review your cart before checking out.');
      return;
    }
    if (!errs.validateAll()) return;
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        customerName: form.customerName,
        phone: form.phone,
        orderType: form.orderType,
        tableLabel: form.orderType === 'DINE_IN' ? form.tableLabel || null : null,
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

      {hasUnavailable && (
        <Alert type="error">
          Some items are no longer available.{' '}
          <Link to="/cart" className="font-medium underline">
            Review your cart
          </Link>{' '}
          to continue.
        </Alert>
      )}

      <form className="card space-y-4 p-6" onSubmit={submit} noValidate>
        {error && <Alert type="error">{error}</Alert>}

        <div>
          <label className="label">Name</label>
          <input
            className={fieldClass(errs.errors.customerName)}
            value={form.customerName}
            onChange={update('customerName')}
            onBlur={errs.blur('customerName')}
          />
          <FieldError>{errs.errors.customerName}</FieldError>
        </div>
        <div>
          <label className="label">Phone</label>
          <input
            className={fieldClass(errs.errors.phone)}
            value={form.phone}
            onChange={update('phone')}
            onBlur={errs.blur('phone')}
            inputMode="numeric"
            maxLength={10}
          />
          <FieldError>{errs.errors.phone}</FieldError>
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
            <label className="label">Table</label>
            {tables.length === 0 ? (
              <p className="text-sm text-stone-500">No tables are configured — please choose Takeaway.</p>
            ) : (
              <select
                className={fieldClass(errs.errors.tableLabel)}
                value={form.tableLabel}
                onChange={update('tableLabel')}
                onBlur={errs.blur('tableLabel')}
              >
                <option value="" disabled>
                  Select a table…
                </option>
                {tables.map((t) => (
                  <option key={t.id} value={t.label}>
                    {t.label} · seats {t.seats}
                  </option>
                ))}
              </select>
            )}
            <FieldError>{errs.errors.tableLabel}</FieldError>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-stone-100 pt-4">
          <span className="text-lg font-bold text-stone-800">{formatMoney(total)}</span>
          <button
            className="btn-primary disabled:pointer-events-none disabled:opacity-40"
            disabled={submitting || hasUnavailable}
          >
            {submitting ? 'Placing…' : 'Place order'}
          </button>
        </div>
      </form>
    </div>
  );
}
