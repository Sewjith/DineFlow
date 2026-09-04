import { orderApi } from '../../api/orderApi';
import usePolling from '../../hooks/usePolling';
import { toMessage } from '../../api/client';
import { formatMoney } from '../../lib/format';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';

export default function DashboardPage() {
  const { data, error, loading } = usePolling(orderApi.dashboard, 10000);

  if (loading && !data) return <Spinner label="Loading dashboard…" />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-stone-500">Today's activity, refreshed automatically.</p>
      </div>

      {error && <Alert type="error">{toMessage(error, 'Failed to load dashboard')}</Alert>}

      {data && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="card p-6">
            <p className="text-sm text-stone-500">Orders today</p>
            <p className="mt-3 font-display text-5xl font-semibold text-ink">{data.orderCount}</p>
          </div>
          <div className="card p-6">
            <p className="text-sm text-stone-500">Revenue today</p>
            <p className="mt-3 font-display text-5xl font-semibold text-ink">{formatMoney(data.revenue)}</p>
          </div>
        </div>
      )}
      {data && (
        <p className="text-xs text-stone-400">For {data.date}. Cancelled orders excluded.</p>
      )}
    </div>
  );
}
