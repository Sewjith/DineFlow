import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`;

export default function Navbar() {
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-extrabold text-slate-900">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-lg shadow-lift">
            🍽️
          </span>
          <span>
            Dine<span className="text-brand-600">Flow</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          <NavLink to="/" end className={linkClass}>
            Menu
          </NavLink>
          <NavLink to="/book" className={linkClass}>
            Book a Table
          </NavLink>
          <NavLink to="/track" className={linkClass}>
            Track Order
          </NavLink>
          <NavLink
            to="/cart"
            className={({ isActive }) =>
              `relative ml-1 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            <span>🛒 Cart</span>
            {count > 0 && (
              <span className="grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-brand-600 px-1 text-[11px] font-bold text-white">
                {count}
              </span>
            )}
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
