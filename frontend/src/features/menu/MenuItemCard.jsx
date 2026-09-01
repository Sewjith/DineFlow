import { useCart } from '../../context/CartContext';
import { formatMoney } from '../../lib/format';

export default function MenuItemCard({ item }) {
  const { addItem } = useCart();

  return (
    <div className="card flex flex-col justify-between p-4">
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-slate-800">{item.name}</h3>
          <span className="whitespace-nowrap font-semibold text-brand-700">
            {formatMoney(item.price)}
          </span>
        </div>
        {item.description && (
          <p className="mt-1 text-sm text-slate-500">{item.description}</p>
        )}
      </div>
      <div className="mt-4 flex items-center justify-between">
        {item.available ? (
          <span className="badge bg-green-100 text-green-700">Available</span>
        ) : (
          <span className="badge bg-slate-200 text-slate-500">Sold out</span>
        )}
        <button
          className="btn-primary"
          disabled={!item.available}
          onClick={() => addItem(item)}
        >
          Add to cart
        </button>
      </div>
    </div>
  );
}
