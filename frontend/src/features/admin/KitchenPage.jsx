import { useCallback } from 'react';
import { orderApi } from '../../api/orderApi';
import usePolling from '../../hooks/usePolling';
import useOrderEvents from '../../hooks/useOrderEvents';
import { toMessage } from '../../api/client';
import { formatDateTime } from '../../lib/format';
import { NEXT_STATUS, STATUS_COLOR } from '../../lib/orderStatus';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';

const ACTIVE = ['PLACED', 'CONFIRMED', 'PREPARING', 'READY'];

export default function KitchenPage() {
  const fetchActive = useCallback(
    () => orderApi.list().then((all) => all.filter((o) => ACTIVE.includes(o.status))),
    [],
  );
  // Socket.IO drives instant updates; the slow poll is a safety net if the socket drops.
  const { data: orders, error, loading, refresh } = usePolling(fetchActive, 15000);
  useOrderEvents(refresh);

  const advance = async (order) => {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    try {
      await orderApi.updateStatus(order.id, next);
      refresh();
    } catch (e) {
      alert(toMessage(e, 'Could not update order'));
    }
  };

  if (loading && !orders) return <Spinner label="Loading kitchen…" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Kitchen</h1>
          <p className="text-sm text-stone-500">Live active orders · updates in real time.</p>
        </div>
        <span className="flex items-center gap-2 text-sm text-stone-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" /> live
        </span>
      </div>

      {error && <Alert type="error">{toMessage(error, 'Failed to load orders')}</Alert>}

      {orders && orders.length === 0 ? (
        <p className="py-10 text-center text-stone-500">No active orders. All caught up! 🎉</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {orders?.map((order) => (
            <div key={order.id} className="card flex flex-col p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono font-semibold">{order.reference}</span>
                <span className={`badge ${STATUS_COLOR[order.status]}`}>{order.status}</span>
              </div>
              <p className="mt-1 text-xs text-stone-500">
                {order.orderType === 'DINE_IN' ? `Dine-in · ${order.tableLabel}` : 'Takeaway'} ·{' '}
                {formatDateTime(order.createdAt)}
              </p>
              <div className="mt-3 flex-1 space-y-1 border-t border-stone-100 pt-3 text-sm">
                {order.items.map((item) => (
                  <div key={item.menuItemId} className="flex justify-between">
                    <span className="font-medium">
                      {item.quantity} × {item.name}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                {NEXT_STATUS[order.status] && (
                  <button className="btn-primary flex-1" onClick={() => advance(order)}>
                    → {NEXT_STATUS[order.status]}
                  </button>
                )}
                <button
                  className="btn-ghost"
                  onClick={async () => {
                    try {
                      await orderApi.updateStatus(order.id, 'CANCELLED');
                      refresh();
                    } catch (e) {
                      alert(toMessage(e, 'Could not cancel'));
                    }
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
