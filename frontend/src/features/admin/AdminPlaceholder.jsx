import { useAuth } from '../../context/AuthContext';

// Temporary — the full admin portal (menu manage, orders, reservations, dashboard,
// kitchen) is added in the next part of Step 5.
export default function AdminPlaceholder() {
  const { logout } = useAuth();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-100">
      <p className="text-lg font-medium text-slate-700">✅ Signed in as admin</p>
      <p className="text-sm text-slate-500">The admin portal screens are coming next.</p>
      <button className="btn-ghost" onClick={logout}>
        Sign out
      </button>
    </div>
  );
}
