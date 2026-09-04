export default function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-ink/30 p-4">
      <div className="w-full max-w-md rounded-xl border border-stone-200 bg-white p-6 animate-fade-in">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-medium text-ink">{title}</h2>
          <button
            className="text-stone-400 transition-colors hover:text-ink"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
