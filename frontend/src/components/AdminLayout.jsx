import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/menu', label: 'Menu' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/kitchen', label: 'Kitchen' },
  { to: '/admin/reservations', label: 'Reservations' },
];

const linkClass = ({ isActive }) =>
  `block rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-slate-700'
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
      <aside className="flex w-56 flex-col bg-slate-900 p-4">
        <div className="mb-6 flex items-center gap-2 px-1 text-lg font-bold text-white">
          <span className="text-2xl">🍽️</span> DineFlow
        </div>
        <nav className="flex-1 space-y-1">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <button className="btn-ghost mt-4" onClick={signOut}>
          Sign out
        </button>
      </aside>
      <main className="flex-1 overflow-x-hidden bg-slate-50 p-6">
        <Outlet />
      </main>
    </div>
  );
}
