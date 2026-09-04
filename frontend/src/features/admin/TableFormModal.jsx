import { useState } from 'react';
import Modal from '../../components/Modal';
import Alert from '../../components/Alert';
import { tableApi } from '../../api/tableApi';
import { toMessage } from '../../api/client';
import { validateRequired, validateCount, fieldClass } from '../../lib/validate';
import useFieldErrors from '../../hooks/useFieldErrors';
import FieldError from '../../components/FieldError';

/** Admin modal to add a new table or edit an existing one (label + seat capacity). */
export default function TableFormModal({ table, onClose, onSaved }) {
  const editing = Boolean(table);
  const [form, setForm] = useState(
    table ? { label: table.label, seats: table.seats } : { label: '', seats: 2 },
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const errs = useFieldErrors({
    label: () => validateRequired(form.label, 'Label'),
    seats: () => validateCount(form.seats, { label: 'Seats', max: 50 }),
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
      const payload = { label: form.label.trim(), seats: Number(form.seats) };
      if (editing) await tableApi.update(table.id, payload);
      else await tableApi.create(payload);
      onSaved();
    } catch (err) {
      setError(toMessage(err, 'Could not save the table'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={editing ? 'Edit table' : 'New table'} onClose={onClose}>
      <form className="space-y-4" onSubmit={submit} noValidate>
        {error && <Alert type="error">{error}</Alert>}
        <div>
          <label className="label">Label</label>
          <input
            className={fieldClass(errs.errors.label)}
            placeholder="e.g. T7"
            value={form.label}
            onChange={update('label')}
            onBlur={errs.blur('label')}
          />
          <FieldError>{errs.errors.label}</FieldError>
        </div>
        <div>
          <label className="label">Seats</label>
          <input
            className={fieldClass(errs.errors.seats)}
            type="number"
            min="1"
            max="50"
            value={form.seats}
            onChange={update('seats')}
            onBlur={errs.blur('seats')}
          />
          <FieldError>{errs.errors.seats}</FieldError>
        </div>
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
