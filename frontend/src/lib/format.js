export function formatMoney(value) {
  const number = typeof value === 'number' ? value : Number(value ?? 0);
  return number.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
}

export function formatDateTime(value) {
  if (!value) return '';
  return new Date(value).toLocaleString();
}
