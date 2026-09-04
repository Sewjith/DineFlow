import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reservationApi } from '../../api/reservationApi';
import { settingsApi } from '../../api/settingsApi';
import { toMessage } from '../../api/client';
import {
  validateName,
  validatePhone,
  validateCount,
  validateDate,
  validateTime,
  fieldClass,
} from '../../lib/validate';
import useFieldErrors from '../../hooks/useFieldErrors';
import Alert from '../../components/Alert';
import FieldError from '../../components/FieldError';

const empty = { customerName: '', phone: '', partySize: 2, date: '', time: '' };
const toHhMm = (t) => (t ? t.slice(0, 5) : '');
const today = () => new Date().toISOString().slice(0, 10);

export default function ReservationPage() {
  const [form, setForm] = useState(empty);
  const [settings, setSettings] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState(null); // null = none offered
  const [submitting, setSubmitting] = useState(false);

  const errs = useFieldErrors({
    customerName: () => validateName(form.customerName),
    phone: () => validatePhone(form.phone),
    partySize: () => validateCount(form.partySize, { label: 'Party size', max: 50 }),
    date: () => validateDate(form.date, { min: today() }),
    time: () =>
      validateTime(form.time, {
        opening: settings?.openingTime,
        closing: settings?.closingTime,
      }),
  });

  useEffect(() => {
    settingsApi
      .get()
      .then((s) =>
        setSettings({
          openingTime: toHhMm(s.openingTime),
          closingTime: toHhMm(s.closingTime),
          defaultDurationMinutes: s.defaultDurationMinutes,
        }),
      )
      .catch(() => setSettings(null));
  }, []);

  const update = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    errs.clear(field);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!errs.validateAll()) return;
    setSubmitting(true);
    setError('');
    setResult(null);
    setSuggestions(null);
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
      // No table at the requested time (409): offer other times that day.
      if (err?.response?.status === 409) {
        try {
          const times = await reservationApi.availability(form.date, Number(form.partySize));
          setSuggestions(times.map(toHhMm).filter((t) => t !== toHhMm(form.time)));
        } catch {
          setSuggestions([]);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const chooseTime = (time) => {
    setForm((f) => ({ ...f, time }));
    setSuggestions(null);
    setError('');
  };

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div className="overflow-hidden rounded-xl border border-stone-200">
        <img
          src="/menu/hero-reservation.jpg"
          alt="Our dining room"
          className="aspect-[3/1] w-full object-cover"
        />
      </div>
      <header>
        <p className="eyebrow">Reservations</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Book a table</h1>
        <p className="mt-2 text-sm text-stone-500">
          We'll assign a suitable table for your party, if one is free.
          {settings && (
            <>
              {' '}Open {settings.openingTime}–{settings.closingTime}; tables are held for{' '}
              {settings.defaultDurationMinutes} minutes.
            </>
          )}
        </p>
      </header>

      {result && (
        <Alert type="success">
          Table <strong>{result.tableLabel}</strong> requested for {result.partySize} on{' '}
          {result.date} at {result.time}. We'll confirm shortly — check the status any time under{' '}
          <Link to="/my-activity" className="font-medium underline">
            My orders &amp; bookings
          </Link>
          .
        </Alert>
      )}
      {error && <Alert type="error">{error}</Alert>}

      {suggestions && suggestions.length > 0 && (
        <div className="card space-y-2 p-4">
          <p className="text-sm text-stone-600">
            Your time is full for a party of {form.partySize}. These times are free that day:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((t) => (
              <button
                key={t}
                type="button"
                className="rounded-full border border-stone-300 px-4 py-1.5 text-sm text-stone-700 transition-colors hover:border-ink hover:text-ink"
                onClick={() => chooseTime(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}
      {suggestions && suggestions.length === 0 && (
        <Alert type="info">No other times are available that day — try another date or party size.</Alert>
      )}

      <form className="card space-y-4 p-6" onSubmit={submit} noValidate>
        <div>
          <label className="label">Name</label>
          <input
            className={fieldClass(errs.errors.customerName)}
            value={form.customerName}
            onChange={update('customerName')}
            onBlur={errs.blur('customerName')}
          />
          <FieldError>{errs.errors.customerName}</FieldError>
        </div>
        <div>
          <label className="label">Phone</label>
          <input
            className={fieldClass(errs.errors.phone)}
            value={form.phone}
            onChange={update('phone')}
            onBlur={errs.blur('phone')}
            inputMode="numeric"
            maxLength={10}
          />
          <FieldError>{errs.errors.phone}</FieldError>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Party size</label>
            <input
              className={fieldClass(errs.errors.partySize)}
              type="number"
              min="1"
              max="50"
              value={form.partySize}
              onChange={update('partySize')}
              onBlur={errs.blur('partySize')}
            />
            <FieldError>{errs.errors.partySize}</FieldError>
          </div>
          <div>
            <label className="label">Date</label>
            <input
              className={fieldClass(errs.errors.date)}
              type="date"
              min={today()}
              value={form.date}
              onChange={update('date')}
              onBlur={errs.blur('date')}
            />
            <FieldError>{errs.errors.date}</FieldError>
          </div>
        </div>
        <div>
          <label className="label">Time</label>
          <input
            className={fieldClass(errs.errors.time)}
            type="time"
            min={settings?.openingTime}
            max={settings?.closingTime}
            value={form.time}
            onChange={update('time')}
            onBlur={errs.blur('time')}
          />
          <FieldError>{errs.errors.time}</FieldError>
        </div>
        <button className="btn-primary w-full" disabled={submitting}>
          {submitting ? 'Booking…' : 'Book table'}
        </button>
      </form>
    </div>
  );
}
