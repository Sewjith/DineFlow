import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/menu', label: 'Menu', icon: '🍽️' },
  { to: '/admin/orders', label: 'Orders', icon: '🧾' },
  { to: '/admin/kitchen', label: 'Kitchen', icon: '👨‍🍳' },
  { to: '/admin/reservations', label: 'Reservations', icon: '📅' },
];

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
    isActive
      ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lift'
      : 'text-slate-300 hover:bg-white/5 hover:text-white'
  }`;

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const signOut = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 flex-col bg-slate-900 bg-gradient-to-b from-slate-900 to-slate-950 p-4">
        <div className="mb-8 flex items-center gap-2 px-1 font-display text-lg font-extrabold text-white">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-lg">
            🍽️
          </span>
          <span>
            Dine<span className="text-brand-400">Flow</span>
          </span>
        </div>
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Manage
        </p>
        <nav className="flex-1 space-y-1">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              <span className="text-base">{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <button
          className="mt-4 flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
          onClick={signOut}
        >
          <span>↩</span> Sign out
        </button>
      </aside>
      <main className="flex-1 overflow-x-hidden bg-slate-50 p-6 animate-fade-in lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
