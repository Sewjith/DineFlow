import { useEffect, useState } from 'react';
import { settingsApi } from '../../api/settingsApi';
import { toMessage } from '../../api/client';
import { validateTime, validateCount, fieldClass } from '../../lib/validate';
import useFieldErrors from '../../hooks/useFieldErrors';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import FieldError from '../../components/FieldError';

// The API returns times as HH:mm[:ss]; the <input type="time"> wants HH:mm.
const toHhMm = (t) => (t ? t.slice(0, 5) : '');

export default function SettingsPage() {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const errs = useFieldErrors({
    openingTime: () => validateTime(form?.openingTime),
    closingTime: () => {
      const base = validateTime(form?.closingTime);
      if (base) return base;
      if (form?.openingTime && form.closingTime <= form.openingTime)
        return 'Closing time must be after opening time';
      return '';
    },
    defaultDurationMinutes: () =>
      validateCount(form?.defaultDurationMinutes, { label: 'Turn-time', min: 30, max: 480 }),
  });

  useEffect(() => {
    (async () => {
      try {
        const s = await settingsApi.get();
        setForm({
          openingTime: toHhMm(s.openingTime),
          closingTime: toHhMm(s.closingTime),
          defaultDurationMinutes: s.defaultDurationMinutes,
        });
      } catch (e) {
        setError(toMessage(e, 'Failed to load settings'));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const update = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    setSaved(false);
    errs.clear(field);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!errs.validateAll()) return;
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const s = await settingsApi.update({
        openingTime: form.openingTime,
        closingTime: form.closingTime,
        defaultDurationMinutes: Number(form.defaultDurationMinutes),
      });
      setForm({
        openingTime: toHhMm(s.openingTime),
        closingTime: toHhMm(s.closingTime),
        defaultDurationMinutes: s.defaultDurationMinutes,
      });
      setSaved(true);
    } catch (err) {
      setError(toMessage(err, 'Could not save settings'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner label="Loading settings…" />;

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-800">Settings</h1>
        <p className="mt-1 text-sm text-stone-500">
          Opening hours and the standard dining turn-time used for reservations.
        </p>
      </div>

      {error && <Alert type="error">{error}</Alert>}
      {saved && <Alert type="success">Settings saved.</Alert>}

      {form && (
        <form className="card space-y-4 p-6" onSubmit={submit} noValidate>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Opening time</label>
              <input
                className={fieldClass(errs.errors.openingTime)}
                type="time"
                value={form.openingTime}
                onChange={update('openingTime')}
                onBlur={errs.blur('openingTime')}
              />
              <FieldError>{errs.errors.openingTime}</FieldError>
            </div>
            <div>
              <label className="label">Closing time</label>
              <input
                className={fieldClass(errs.errors.closingTime)}
                type="time"
                value={form.closingTime}
                onChange={update('closingTime')}
                onBlur={errs.blur('closingTime')}
              />
              <FieldError>{errs.errors.closingTime}</FieldError>
            </div>
          </div>
          <div>
            <label className="label">Dining turn-time (minutes)</label>
            <input
              className={fieldClass(errs.errors.defaultDurationMinutes)}
              type="number"
              min="30"
              max="480"
              step="15"
              value={form.defaultDurationMinutes}
              onChange={update('defaultDurationMinutes')}
              onBlur={errs.blur('defaultDurationMinutes')}
            />
            <FieldError>{errs.errors.defaultDurationMinutes}</FieldError>
            <p className="mt-1 text-xs text-stone-400">
              How long each booking holds its table (30–480 minutes).
            </p>
          </div>
          <div className="flex justify-end pt-2">
            <button className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save settings'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
