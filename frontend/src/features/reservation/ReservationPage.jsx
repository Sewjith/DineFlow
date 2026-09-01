import { useState } from 'react';
import { reservationApi } from '../../api/reservationApi';
import { toMessage } from '../../api/client';
import Alert from '../../components/Alert';

const empty = { customerName: '', phone: '', partySize: 2, date: '', time: '' };

export default function ReservationPage() {
  const [form, setForm] = useState(empty);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setResult(null);
    try {
      const reservation = await reservationApi.book({
        customerName: form.customerName,
        phone: form.phone,
        partySize: Number(form.partySize),
        date: form.date,
        time: form.time,
      });
      setResult(reservation);
      setForm(empty);
    } catch (err) {
      setError(toMessage(err, 'Could not book a table'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Book a table</h1>
        <p className="text-sm text-slate-500">
          We'll assign a suitable table for your party, if one is free.
        </p>
      </div>

      {result && (
        <Alert type="success">
          Table <strong>{result.tableLabel}</strong> booked for {result.partySize} on{' '}
          {result.date} at {result.time}. Status: {result.status}.
        </Alert>
      )}
      {error && <Alert type="error">{error}</Alert>}

      <form className="card space-y-4 p-6" onSubmit={submit}>
        <div>
          <label className="label">Name</label>
          <input className="input" required value={form.customerName} onChange={update('customerName')} />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" required value={form.phone} onChange={update('phone')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Party size</label>
            <input
              className="input"
              type="number"
              min="1"
              max="50"
              required
              value={form.partySize}
              onChange={update('partySize')}
            />
          </div>
          <div>
            <label className="label">Date</label>
            <input className="input" type="date" required value={form.date} onChange={update('date')} />
          </div>
        </div>
        <div>
          <label className="label">Time</label>
          <input className="input" type="time" required value={form.time} onChange={update('time')} />
        </div>
        <button className="btn-primary w-full" disabled={submitting}>
          {submitting ? 'Booking…' : 'Book table'}
        </button>
      </form>
    </div>
  );
}
