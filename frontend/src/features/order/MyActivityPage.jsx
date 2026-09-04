import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../../api/orderApi';
import { reservationApi } from '../../api/reservationApi';
import { toMessage } from '../../api/client';
import { formatMoney, formatDateTime } from '../../lib/format';
import { validatePhone, fieldClass } from '../../lib/validate';
import useFieldErrors from '../../hooks/useFieldErrors';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import FieldError from '../../components/FieldError';

const orderBadgeColor = {
  PLACED: 'bg-blue-100 text-blue-700',
  CONFIRMED: 'bg-indigo-100 text-indigo-700',
  PREPARING: 'bg-amber-100 text-amber-700',
  READY: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-stone-200 text-stone-600',
  CANCELLED: 'bg-red-100 text-red-700',
};

const reservationBadgeColor = {
  REQUESTED: 'bg-blue-100 text-blue-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  SEATED: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-stone-200 text-stone-600',
  CANCELLED: 'bg-red-100 text-red-700',
  NO_SHOW: 'bg-red-100 text-red-700',
};

const RESERVATION_TERMINAL = ['COMPLETED', 'CANCELLED', 'NO_SHOW'];

const reservationHint = {
  REQUESTED: 'Waiting for the restaurant to confirm your table.',
  CONFIRMED: 'Confirmed — see you then!',
  SEATED: "You're seated. Enjoy your meal!",
  COMPLETED: 'Thanks for dining with us.',
  CANCELLED: 'This booking was cancelled.',
  NO_SHOW: 'Marked as a no-show.',
};

export default function MyActivityPage() {
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState(null); // null = not searched yet
  const [reservations, setReservations] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const activePhone = useRef('');

  const errs = useFieldErrors({ phone: () => validatePhone(phone) });

  const search = async (e) => {
    e?.preventDefault();
    if (!errs.validateAll()) return;
    setLoading(true);
    setError('');
    activePhone.current = phone.trim();
    try {
      const [o, r] = await Promise.all([
        orderApi.historyByPhone(phone.trim()),
        reservationApi.historyByPhone(phone.trim()),
      ]);
      setOrders(o);
      setReservations(r);
    } catch (err) {
      setError(toMessage(err, 'Could not look up your orders and bookings'));
      setOrders(null);
      setReservations(null);
    } finally {
      setLoading(false);
    }
  };

  // Live updates: once results are showing, quietly re-fetch so a customer sees the
  // kitchen advance an order or the restaurant confirm/cancel a booking without reloading.
  const searched = orders !== null || reservations !== null;
  useEffect(() => {
    if (!searched) return;
    const id = setInterval(async () => {
      const phoneToPoll = activePhone.current;
      if (!phoneToPoll) return;
      try {
        const [o, r] = await Promise.all([
          orderApi.historyByPhone(phoneToPoll),
          reservationApi.historyByPhone(phoneToPoll),
        ]);
        if (activePhone.current === phoneToPoll) {
          setOrders(o);
          setReservations(r);
        }
      } catch {
        // Ignore transient errors; keep showing the last known state.
      }
    }, 10000);
    return () => clearInterval(id);
  }, [searched]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <p className="eyebrow">Lookup</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">My orders &amp; bookings</h1>
        <p className="mt-2 text-sm text-stone-500">
          Enter the phone number you used, and we&apos;ll show your recent orders and table bookings.
        </p>
      </header>

      <form className="card p-4" onSubmit={search} noValidate>
        <div className="flex gap-2">
          <input
            className={`${fieldClass(errs.errors.phone)} flex-1`}
            placeholder="Phone number"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              errs.clear('phone');
            }}
            onBlur={errs.blur('phone')}
          />
          <button className="btn-primary" disabled={loading}>
            {loading ? 'Searching…' : 'Find'}
          </button>
        </div>
        <FieldError>{errs.errors.phone}</FieldError>
      </form>

      {error && <Alert type="error">{error}</Alert>}

      {loading ? (
        <Spinner label="Looking up your orders and bookings…" />
      ) : (
        searched && (
          <div className="space-y-8">
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-ink">Orders</h2>
              {orders && orders.length === 0 ? (
                <p className="py-6 text-center text-sm text-stone-500">
                  No orders found for that phone number.
                </p>
              ) : (
                <div className="space-y-3">
                  {orders?.map((order) => (
                    <Link
                      key={order.id}
                      to={`/track?ref=${order.reference}`}
                      className="card flex items-center justify-between p-4 transition hover:border-ink"
                    >
                      <div>
                        <p className="font-mono font-semibold text-stone-800">{order.reference}</p>
                        <p className="text-sm text-stone-500">
                          {order.orderType === 'DINE_IN'
                            ? `Dine-in · ${order.tableLabel}`
                            : 'Takeaway'}{' '}
                          · {formatDateTime(order.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-stone-800">
                          {formatMoney(order.total)}
                        </span>
                        <span className={`badge ${orderBadgeColor[order.status]}`}>
                          {order.status}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-ink">Bookings</h2>
              {reservations && reservations.length === 0 ? (
                <p className="py-6 text-center text-sm text-stone-500">
                  No reservations found for that phone number.
                </p>
              ) : (
                <div className="space-y-3">
                  {reservations?.map((r) => (
                    <div key={r.id} className="card space-y-2 p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-stone-800">
                            Table {r.tableLabel} · party of {r.partySize}
                          </p>
                          <p className="text-sm text-stone-500">{formatDateTime(r.reservedAt)}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`badge ${reservationBadgeColor[r.status]}`}>
                            {r.status}
                          </span>
                          {!RESERVATION_TERMINAL.includes(r.status) && (
                            <span className="flex items-center gap-1 text-[11px] text-stone-400">
                              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                              Updating live
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-stone-500">{reservationHint[r.status]}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )
      )}
    </div>
  );
}
