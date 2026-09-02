const styles = {
  error: 'bg-red-50 text-red-700 border-red-200',
  success: 'bg-green-50 text-green-700 border-green-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
};

const icons = {
  error: '⚠️',
  success: '✅',
  info: 'ℹ️',
};

export default function Alert({ type = 'info', children }) {
  if (!children) return null;
  return (
    <div
      className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm animate-fade-in ${styles[type]}`}
    >
      <span className="mt-0.5 shrink-0 leading-none">{icons[type]}</span>
      <div>{children}</div>
    </div>
  );
}
