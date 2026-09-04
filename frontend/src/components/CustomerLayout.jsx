import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function CustomerLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 animate-fade-in">
        <Outlet />
      </main>
      <footer className="border-t border-stone-200">
        <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-stone-400">
          Dineflow — fresh food, no waiting.
        </div>
      </footer>
    </div>
  );
}
