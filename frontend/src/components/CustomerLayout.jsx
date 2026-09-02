import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function CustomerLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-brand-50/60 via-slate-50 to-slate-50">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 animate-fade-in">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200/80 py-6 text-center text-xs text-slate-400">
        🍽️ DineFlow — fresh food, no waiting.
      </footer>
    </div>
  );
}
