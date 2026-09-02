import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { orderApi } from '../../api/orderApi';
import { toMessage } from '../../api/client';
import { formatMoney, formatDateTime } from '../../lib/format';
import Alert from '../../components/Alert';

const STATUS_STEPS = ['PLACED', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED'];

const badgeColor = {
  PLACED: 'bg-blue-100 text-blue-700',
  CONFIRMED: 'bg-indigo-100 text-indigo-700',
  PREPARING: 'bg-amber-100 text-amber-700',
  READY: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-slate-200 text-slate-600',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function OrderStatusPage() {
  const [params, setParams] = useSearchParams();
  const [reference, setReference] = useState(params.get('ref') || '');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const justPlaced = params.get('ref') && order && order.reference === params.get('ref');

  const lookup = async (ref) => {
    if (!ref) return;
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      setOrder(await orderApi.getByReference(ref));
    } catch (err) {
      setError(toMessage(err, 'Order not found'));
    } finally {
      setLoading(false);
    }
  };

  // Auto-lookup when arriving with ?ref=...
  useEffect(() => {
    const ref = params.get('ref');
    if (ref) lookup(ref);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = (e) => {
    e.preventDefault();
    setParams(reference ? { ref: reference } : {});
    lookup(reference);
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Track your order</h1>
        <p className="text-sm text-slate-500">Enter your order reference to see its status.</p>
      </div>

      <form className="flex gap-2" onSubmit={submit}>
        <input
          className="input"
          placeholder="e.g. ORD-AB12CD"
          value={reference}
          onChange={(e) => setReference(e.target.value.toUpperCase())}
        />
        <button className="btn-primary" disabled={loading}>
          {loading ? 'Looking…' : 'Look up'}
        </button>
      </form>

      {error && <Alert type="error">{error}</Alert>}

      {order && (
        <div className="card space-y-4 p-6">
          {justPlaced && (
            <Alert type="success">
              Order placed! Your reference is <strong>{order.reference}</strong> — keep it to track
              your order.
            </Alert>
          )}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Reference</p>
              <p className="font-mono text-lg font-bold">{order.reference}</p>
            </div>
            <span className={`badge ${badgeColor[order.status]}`}>{order.status}</span>
          </div>

          {order.status !== 'CANCELLED' && (
            <div className="flex items-center gap-1">
              {STATUS_STEPS.map((step, idx) => {
                const reached = STATUS_STEPS.indexOf(order.status) >= idx;
                return (
                  <div key={step} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className={`h-2 w-full rounded-full ${reached ? 'bg-brand-500' : 'bg-slate-200'}`}
                    />
                    <span className="text-[10px] text-slate-500">{step}</span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="divide-y divide-slate-100 border-t border-slate-100 pt-2">
            {order.items.map((item) => (
              <div key={item.menuItemId} className="flex justify-between py-2 text-sm">
                <span>
                  {item.quantity} × {item.name}
                </span>
                <span className="font-medium">{formatMoney(item.lineTotal)}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between border-t border-slate-100 pt-3 font-semibold">
            <span>Total</span>
            <span>{formatMoney(order.total)}</span>
          </div>
          <p className="text-xs text-slate-400">
            {order.orderType === 'DINE_IN' ? `Dine-in · Table ${order.tableNumber}` : 'Takeaway'} ·
            Placed {formatDateTime(order.createdAt)}
          </p>
        </div>
      )}
    </div>
  );
}
