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
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <form className="card w-full max-w-sm space-y-4 p-8" onSubmit={submit}>
        <div className="text-center">
          <div className="text-3xl">🍽️</div>
          <h1 className="mt-2 text-xl font-bold text-slate-800">DineFlow Admin</h1>
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
