export default function Spinner({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-12 text-stone-500">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-stone-200 border-t-ink" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
