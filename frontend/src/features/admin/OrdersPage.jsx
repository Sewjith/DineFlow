import { useEffect, useState } from 'react';
import { orderApi } from '../../api/orderApi';
import { toMessage } from '../../api/client';
import { formatMoney, formatDateTime } from '../../lib/format';
import { ORDER_STATUSES, STATUS_COLOR } from '../../lib/orderStatus';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      setOrders(await orderApi.list(statusFilter || undefined));
      setError('');
    } catch (e) {
      setError(toMessage(e, 'Failed to load orders'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const changeStatus = async (id, status) => {
    try {
      await orderApi.updateStatus(id, status);
      await load();
    } catch (e) {
      setError(toMessage(e, 'Could not change status'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Orders</h1>
        <select className="input max-w-xs" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {loading ? (
        <Spinner label="Loading orders…" />
      ) : orders.length === 0 ? (
        <p className="py-10 text-center text-slate-500">No orders found.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="card p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  className="text-left"
                  onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                >
                  <p className="font-mono font-semibold text-slate-800">{order.reference}</p>
                  <p className="text-sm text-slate-500">
                    {order.customerName} · {order.phone} ·{' '}
                    {order.orderType === 'DINE_IN' ? `Dine-in (T${order.tableNumber})` : 'Takeaway'}
                  </p>
                </button>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{formatMoney(order.total)}</span>
                  <span className={`badge ${STATUS_COLOR[order.status]}`}>{order.status}</span>
                  <select
                    className="input w-36 py-1"
                    value=""
                    onChange={(e) => e.target.value && changeStatus(order.id, e.target.value)}
                  >
                    <option value="">Change…</option>
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {expanded === order.id && (
                <div className="mt-3 border-t border-slate-100 pt-3">
                  {order.items.map((item) => (
                    <div key={item.menuItemId} className="flex justify-between py-1 text-sm">
                      <span>
                        {item.quantity} × {item.name}
                      </span>
                      <span>{formatMoney(item.lineTotal)}</span>
                    </div>
                  ))}
                  <p className="mt-2 text-xs text-slate-400">Placed {formatDateTime(order.createdAt)}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
