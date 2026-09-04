import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toMessage } from '../../api/client';
import { validateRequired, fieldClass } from '../../lib/validate';
import useFieldErrors from '../../hooks/useFieldErrors';
import Alert from '../../components/Alert';
import FieldError from '../../components/FieldError';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/admin';

  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const errs = useFieldErrors({
    username: () => validateRequired(form.username, 'Username'),
    password: () => validateRequired(form.password, 'Password'),
  });

  const change = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    errs.clear(field);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!errs.validateAll()) return;
    setSubmitting(true);
    setError('');
    try {
      await login(form.username, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(toMessage(err, 'Login failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form className="w-full max-w-sm space-y-6 animate-fade-in" onSubmit={submit} noValidate>
        <div className="text-center">
          <div className="font-display text-2xl font-semibold tracking-tight text-ink">
            Dineflow<span className="text-brand-500">.</span>
          </div>
          <p className="mt-1 text-sm text-stone-500">Sign in to the admin portal</p>
        </div>

        {error && <Alert type="error">{error}</Alert>}

        <div>
          <label className="label">Username</label>
          <input
            className={fieldClass(errs.errors.username)}
            value={form.username}
            onChange={change('username')}
            onBlur={errs.blur('username')}
          />
          <FieldError>{errs.errors.username}</FieldError>
        </div>
        <div>
          <label className="label">Password</label>
          <input
            className={fieldClass(errs.errors.password)}
            type="password"
            value={form.password}
            onChange={change('password')}
            onBlur={errs.blur('password')}
          />
          <FieldError>{errs.errors.password}</FieldError>
        </div>
        <button className="btn-primary w-full" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="text-center text-xs text-stone-400">Default: admin / admin123</p>
      </form>
    </div>
  );
}
