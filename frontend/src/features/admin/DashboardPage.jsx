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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500">Today's activity, refreshed automatically.</p>
      </div>

      {error && <Alert type="error">{toMessage(error, 'Failed to load dashboard')}</Alert>}

      {data && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="card p-6">
            <p className="text-sm text-slate-500">Orders today</p>
            <p className="mt-2 text-4xl font-bold text-slate-800">{data.orderCount}</p>
          </div>
          <div className="card p-6">
            <p className="text-sm text-slate-500">Revenue today</p>
            <p className="mt-2 text-4xl font-bold text-brand-700">{formatMoney(data.revenue)}</p>
          </div>
        </div>
      )}
      {data && <p className="text-xs text-slate-400">For {data.date}. Cancelled orders excluded.</p>}
    </div>
  );
}
