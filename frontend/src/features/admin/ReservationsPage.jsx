import { useEffect, useState } from 'react';
import { reservationApi } from '../../api/reservationApi';
import { toMessage } from '../../api/client';
import useReservationEvents from '../../hooks/useReservationEvents';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import ReservationEditModal from './ReservationEditModal';

const STATUS_COLOR = {
  REQUESTED: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  SEATED: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-stone-200 text-stone-600',
  CANCELLED: 'bg-red-100 text-red-700',
  NO_SHOW: 'bg-red-100 text-red-700',
};

// Allowed next statuses per current status, mirroring the server's ReservationStatus rules.
const TRANSITIONS = {
  REQUESTED: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SEATED', 'NO_SHOW', 'CANCELLED'],
  SEATED: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};

const ACTION_LABEL = {
  CONFIRMED: 'Confirm',
  SEATED: 'Seat',
  COMPLETED: 'Complete',
  NO_SHOW: 'No-show',
  CANCELLED: 'Cancel',
};

// Destructive transitions are styled red; everything else advances the happy path.
const ACTION_CLASS = (status) =>
  status === 'CANCELLED' || status === 'NO_SHOW'
    ? 'text-red-500 hover:underline'
    : 'text-green-600 hover:underline';

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function ReservationsPage() {
  const [date, setDate] = useState(today());
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // reservation | null

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

  // Live refresh when any reservation is booked, edited or changes status.
  useReservationEvents(load);

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
        <h1 className="text-2xl font-bold text-stone-800">Reservations</h1>
        <input className="input max-w-xs" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {loading ? (
        <Spinner label="Loading reservations…" />
      ) : reservations.length === 0 ? (
        <p className="py-10 text-center text-stone-500">No reservations for {date}.</p>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-left text-[11px] font-semibold uppercase tracking-wider text-stone-500">
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Table</th>
                <th className="px-4 py-3">Guest</th>
                <th className="px-4 py-3">Party</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {reservations.map((r) => (
                <tr key={r.id} className="transition hover:bg-stone-50/70">
                  <td className="px-4 py-3 font-medium">{r.time}</td>
                  <td className="px-4 py-3">{r.tableLabel}</td>
                  <td className="px-4 py-3">
                    {r.customerName}
                    <span className="block text-xs text-stone-400">{r.phone}</span>
                  </td>
                  <td className="px-4 py-3">{r.partySize}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${STATUS_COLOR[r.status]}`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {TRANSITIONS[r.status]?.length > 0 && (
                        <button className="text-stone-600 hover:underline" onClick={() => setEditing(r)}>
                          Edit
                        </button>
                      )}
                      {TRANSITIONS[r.status]?.map((status) => (
                        <button key={status} className={ACTION_CLASS(status)} onClick={() => setStatus(r.id, status)}>
                          {ACTION_LABEL[status]}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <ReservationEditModal
          reservation={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}
