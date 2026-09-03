import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toMessage } from '../../api/client';
import Alert from '../../components/Alert';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/admin';

  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
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
      <form className="w-full max-w-sm space-y-6 animate-fade-in" onSubmit={submit}>
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
            className="input"
            required
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Password</label>
          <input
            className="input"
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <button className="btn-primary w-full" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="text-center text-xs text-stone-400">Default: admin / admin123</p>
      </form>
    </div>
  );
}
