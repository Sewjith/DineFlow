import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { formatMoney } from '../../lib/format';
import { imageFor, emojiFor } from '../../lib/foodImages';

export default function MenuItemCard({ item }) {
  const { addItem } = useCart();
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className={`group flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white transition-colors hover:border-stone-300 ${
        item.available ? '' : 'opacity-60'
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
        {imgError ? (
          <div className="flex h-full w-full items-center justify-center text-4xl grayscale">
            {emojiFor(item)}
          </div>
        ) : (
          <img
            src={imageFor(item)}
            alt={item.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] ${
              item.available ? '' : 'grayscale'
            }`}
          />
        )}
        {!item.available && (
          <div className="absolute inset-0 grid place-items-center bg-white/60">
            <span className="text-xs font-medium uppercase tracking-widest text-ink">Sold out</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-base font-medium text-ink">{item.name}</h3>
          <span className="shrink-0 text-sm text-stone-500">{formatMoney(item.price)}</span>
        </div>
        {item.description && (
          <p className="mt-1.5 flex-1 text-sm leading-relaxed text-stone-500">{item.description}</p>
        )}
        <button
          className="mt-4 w-full rounded-lg border border-stone-300 py-2 text-sm font-medium text-ink transition-colors hover:border-ink hover:bg-ink hover:text-white disabled:pointer-events-none disabled:opacity-40"
          disabled={!item.available}
          onClick={() => addItem(item)}
        >
          Add to order
        </button>
      </div>
    </div>
  );
}
