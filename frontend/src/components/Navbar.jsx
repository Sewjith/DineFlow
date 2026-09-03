import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const linkClass = ({ isActive }) =>
  `text-sm transition-colors ${isActive ? 'font-medium text-ink' : 'text-stone-500 hover:text-ink'}`;

export default function Navbar() {
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-10 border-b border-stone-200 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
        <Link to="/" className="font-display text-xl font-semibold tracking-tight text-ink">
          Dineflow<span className="text-brand-500">.</span>
        </Link>
        <nav className="flex items-center gap-7">
          <NavLink to="/" end className={linkClass}>
            Menu
          </NavLink>
          <NavLink to="/book" className={linkClass}>
            Reservations
          </NavLink>
          <NavLink to="/track" className={linkClass}>
            Track order
          </NavLink>
          <NavLink to="/cart" className={linkClass}>
            Cart
            {count > 0 && <span className="ml-1 text-stone-400">({count})</span>}
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
