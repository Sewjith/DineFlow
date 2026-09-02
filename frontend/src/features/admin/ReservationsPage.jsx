import { useEffect, useState } from 'react';
import { reservationApi } from '../../api/reservationApi';
import { toMessage } from '../../api/client';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';

const STATUS_COLOR = {
  REQUESTED: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function ReservationsPage() {
  const [date, setDate] = useState(today());
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      setReservations(await reservationApi.listByDate(date));
      setError('');
    } catch (e) {
      setError(toMessage(e, 'Failed to load reservations'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const setStatus = async (id, status) => {
    try {
      await reservationApi.updateStatus(id, status);
      await load();
    } catch (e) {
      setError(toMessage(e, 'Could not update reservation'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Reservations</h1>
        <input className="input max-w-xs" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {loading ? (
        <Spinner label="Loading reservations…" />
      ) : reservations.length === 0 ? (
        <p className="py-10 text-center text-slate-500">No reservations for {date}.</p>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Table</th>
                <th className="px-4 py-3">Guest</th>
                <th className="px-4 py-3">Party</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reservations.map((r) => (
                <tr key={r.id} className="transition hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-medium">{r.time}</td>
                  <td className="px-4 py-3">{r.tableLabel}</td>
                  <td className="px-4 py-3">
                    {r.customerName}
                    <span className="block text-xs text-slate-400">{r.phone}</span>
                  </td>
                  <td className="px-4 py-3">{r.partySize}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${STATUS_COLOR[r.status]}`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {r.status !== 'CONFIRMED' && (
                      <button className="mr-3 text-green-600 hover:underline" onClick={() => setStatus(r.id, 'CONFIRMED')}>
                        Confirm
                      </button>
                    )}
                    {r.status !== 'CANCELLED' && (
                      <button className="text-red-500 hover:underline" onClick={() => setStatus(r.id, 'CANCELLED')}>
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
