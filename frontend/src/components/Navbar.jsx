import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
  }`;

export default function Navbar() {
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-brand-700">
          <span className="text-2xl">🍽️</span> DineFlow
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
          <NavLink to="/cart" className={linkClass}>
            <span className="relative">
              Cart
              {count > 0 && (
                <span className="absolute -right-4 -top-2 rounded-full bg-brand-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {count}
                </span>
              )}
            </span>
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
