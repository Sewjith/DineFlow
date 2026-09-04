import { useCallback, useEffect, useState } from 'react';
import { orderApi } from '../../api/orderApi';
import useOrderEvents from '../../hooks/useOrderEvents';
import { toMessage } from '../../api/client';
import { formatMoney, formatDateTime } from '../../lib/format';
import { ORDER_STATUSES, STATUS_COLOR, NEXT_STATUS, NEXT_STATUS_LABEL } from '../../lib/orderStatus';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setOrders(await orderApi.list(statusFilter || undefined));
      setError('');
    } catch (e) {
      setError(toMessage(e, 'Failed to load orders'));
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  // Refresh live whenever an order is placed or changes status elsewhere.
  useOrderEvents(load);

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
        <h1 className="text-2xl font-bold text-stone-800">Orders</h1>
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
        <p className="py-10 text-center text-stone-500">No orders found.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="card p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  className="text-left"
                  onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                >
                  <p className="font-mono font-semibold text-stone-800">{order.reference}</p>
                  <p className="text-sm text-stone-500">
                    {order.customerName} · {order.phone} ·{' '}
                    {order.orderType === 'DINE_IN' ? `Dine-in (${order.tableLabel})` : 'Takeaway'}
                  </p>
                </button>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{formatMoney(order.total)}</span>
                  <span className={`badge ${STATUS_COLOR[order.status]}`}>{order.status}</span>
                  {NEXT_STATUS[order.status] && (
                    <button
                      className="btn-primary py-1"
                      onClick={() => changeStatus(order.id, NEXT_STATUS[order.status])}
                    >
                      {NEXT_STATUS_LABEL[order.status]} →
                    </button>
                  )}
                  {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                    <button className="btn-ghost py-1" onClick={() => changeStatus(order.id, 'CANCELLED')}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {expanded === order.id && (
                <div className="mt-3 border-t border-stone-100 pt-3">
                  {order.items.map((item) => (
                    <div key={item.menuItemId} className="flex justify-between py-1 text-sm">
                      <span>
                        {item.quantity} × {item.name}
                      </span>
                      <span>{formatMoney(item.lineTotal)}</span>
                    </div>
                  ))}
                  <p className="mt-2 text-xs text-stone-400">Placed {formatDateTime(order.createdAt)}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
