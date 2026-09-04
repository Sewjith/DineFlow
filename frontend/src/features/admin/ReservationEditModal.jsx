import { useState } from 'react';
import Modal from '../../components/Modal';
import Alert from '../../components/Alert';
import { reservationApi } from '../../api/reservationApi';
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
import FieldError from '../../components/FieldError';

/**
 * Admin modal to edit an existing reservation's guest details and time window. The server
 * re-checks availability and may reassign the table (or reject with 409 if none is free).
 */
export default function ReservationEditModal({ reservation, onClose, onSaved }) {
  const [form, setForm] = useState({
    customerName: reservation.customerName,
    phone: reservation.phone,
    partySize: reservation.partySize,
    date: reservation.date,
    time: reservation.time?.slice(0, 5) ?? reservation.time,
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const errs = useFieldErrors({
    customerName: () => validateName(form.customerName),
    phone: () => validatePhone(form.phone),
    partySize: () => validateCount(form.partySize, { label: 'Party size', max: 50 }),
    date: () => validateDate(form.date),
    time: () => validateTime(form.time),
  });

  const update = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    errs.clear(field);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!errs.validateAll()) return;
    setSaving(true);
    setError('');
    try {
      await reservationApi.update(reservation.id, {
        customerName: form.customerName,
        phone: form.phone,
        partySize: Number(form.partySize),
        date: form.date,
        time: form.time,
      });
      onSaved();
    } catch (err) {
      setError(toMessage(err, 'Could not update the reservation'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Edit reservation" onClose={onClose}>
      <form className="space-y-4" onSubmit={submit} noValidate>
        {error && <Alert type="error">{error}</Alert>}
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
            value={form.time}
            onChange={update('time')}
            onBlur={errs.blur('time')}
          />
          <FieldError>{errs.errors.time}</FieldError>
        </div>
        <p className="text-xs text-stone-400">
          The table is reassigned automatically if the current one no longer fits or is taken.
        </p>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
