const styles = {
  error: 'border-red-200 bg-red-50 text-red-800',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  info: 'border-stone-200 bg-stone-50 text-stone-700',
};

export default function Alert({ type = 'info', children }) {
  if (!children) return null;
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${styles[type]}`}>{children}</div>
  );
}
