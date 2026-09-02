import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { formatMoney } from '../../lib/format';
import { imageFor, emojiFor } from '../../lib/foodImages';

export default function MenuItemCard({ item }) {
  const { addItem } = useCart();
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className={`card group flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift ${
        item.available ? '' : 'opacity-90'
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-brand-100 to-brand-50">
        {imgError ? (
          <div className="flex h-full w-full items-center justify-center text-5xl">{emojiFor(item)}</div>
        ) : (
          <img
            src={imageFor(item)}
            alt={item.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${
              item.available ? '' : 'grayscale'
            }`}
          />
        )}
        <span className="absolute bottom-2 right-2 rounded-lg bg-white/95 px-2 py-0.5 text-sm font-bold text-brand-700 shadow-sm backdrop-blur">
          {formatMoney(item.price)}
        </span>
        {!item.available && (
          <div className="absolute inset-0 grid place-items-center bg-slate-900/40">
            <span className="badge bg-white text-slate-700">Sold out</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display font-semibold leading-snug text-slate-900">{item.name}</h3>
        {item.description && (
          <p className="mt-1 flex-1 text-sm leading-relaxed text-slate-500">{item.description}</p>
        )}
        <button
          className="btn-primary mt-4 w-full"
          disabled={!item.available}
          onClick={() => addItem(item)}
        >
          {item.available ? 'Add to cart' : 'Unavailable'}
        </button>
      </div>
    </div>
  );
}
