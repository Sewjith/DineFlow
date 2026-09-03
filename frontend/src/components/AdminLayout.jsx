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
  `block rounded-lg px-3 py-2 text-sm transition-colors ${
    isActive ? 'bg-stone-100 font-medium text-ink' : 'text-stone-500 hover:bg-stone-50 hover:text-ink'
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
      <aside className="flex w-60 flex-col border-r border-stone-200 bg-white p-5">
        <div className="mb-9 px-1 font-display text-xl font-semibold tracking-tight text-ink">
          Dineflow<span className="text-brand-500">.</span>
        </div>
        <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-widest text-stone-400">
          Manage
        </p>
        <nav className="flex-1 space-y-0.5">
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
      <main className="flex-1 overflow-x-hidden bg-paper p-8 animate-fade-in">
        <Outlet />
      </main>
    </div>
  );
}
