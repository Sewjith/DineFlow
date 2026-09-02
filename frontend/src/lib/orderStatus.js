export const ORDER_STATUSES = [
  'PLACED',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'COMPLETED',
  'CANCELLED',
];

// Next status on the happy path (used by the kitchen "advance" button).
export const NEXT_STATUS = {
  PLACED: 'CONFIRMED',
  CONFIRMED: 'PREPARING',
  PREPARING: 'READY',
  READY: 'COMPLETED',
};

export const STATUS_COLOR = {
  PLACED: 'bg-blue-100 text-blue-700',
  CONFIRMED: 'bg-indigo-100 text-indigo-700',
  PREPARING: 'bg-amber-100 text-amber-700',
  READY: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-slate-200 text-slate-600',
  CANCELLED: 'bg-red-100 text-red-700',
};
