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
          <div className="card relative overflow-hidden p-6">
            <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-500" />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Orders today</p>
                <p className="mt-2 font-display text-4xl font-extrabold text-slate-900">{data.orderCount}</p>
              </div>
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-xl">🧾</span>
            </div>
          </div>
          <div className="card relative overflow-hidden p-6">
            <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-400 to-brand-600" />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Revenue today</p>
                <p className="mt-2 font-display text-4xl font-extrabold text-brand-700">
                  {formatMoney(data.revenue)}
                </p>
              </div>
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-xl">💰</span>
            </div>
          </div>
        </div>
      )}
      {data && <p className="text-xs text-slate-400">For {data.date}. Cancelled orders excluded.</p>}
    </div>
  );
}
