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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 px-4">
      <div className="absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-brand-600/30 blur-3xl" />
      <div className="absolute -right-20 bottom-1/4 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl" />
      <form className="card relative w-full max-w-sm space-y-4 p-8 animate-fade-in" onSubmit={submit}>
        <div className="text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-2xl shadow-lift">
            🍽️
          </div>
          <h1 className="mt-3 font-display text-xl font-extrabold text-slate-900">DineFlow Admin</h1>
          <p className="text-sm text-slate-500">Sign in to manage the restaurant.</p>
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
        <p className="text-center text-xs text-slate-400">Default: admin / admin123</p>
      </form>
    </div>
  );
}
