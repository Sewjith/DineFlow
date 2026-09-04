// Lightweight client-side validators. These mirror the backend Bean Validation
// constraints so users get instant feedback; the server remains the source of truth.

// Matches the backend @Pattern on phone: + optional, then 7-30 of digits/() -/space.
const PHONE_RE = /^\+?[0-9()\-\s]{7,30}$/;

/** Returns an error message, or '' when valid. */
export function validateName(value, { max = 120 } = {}) {
  const v = (value ?? '').trim();
  if (!v) return 'Name is required';
  if (v.length > max) return `Name must be at most ${max} characters`;
  return '';
}

/** Returns an error message, or '' when valid. Requires at least 7 digits. */
export function validatePhone(value) {
  const v = (value ?? '').trim();
  if (!v) return 'Phone is required';
  if (!PHONE_RE.test(v)) return 'Use 7-30 characters: digits and + ( ) - spaces';
  const digits = v.replace(/\D/g, '');
  if (digits.length < 7) return 'Phone must include at least 7 digits';
  return '';
}

/** Returns an error message, or '' when valid. */
export function validateRequired(value, label = 'This field') {
  return (value ?? '').toString().trim() ? '' : `${label} is required`;
}

/** Whole-number count within [min,max] (party size, seats). '' when valid. */
export function validateCount(value, { label = 'Value', min = 1, max = 50 } = {}) {
  if (value === '' || value === null || value === undefined) return `${label} is required`;
  const n = Number(value);
  if (!Number.isInteger(n)) return `${label} must be a whole number`;
  if (n < min) return `${label} must be at least ${min}`;
  if (n > max) return `${label} can be at most ${max}`;
  return '';
}

/** A price > 0. '' when valid. */
export function validatePrice(value) {
  if (value === '' || value === null || value === undefined) return 'Price is required';
  const n = Number(value);
  if (Number.isNaN(n)) return 'Enter a valid price';
  if (n <= 0) return 'Price must be greater than 0';
  return '';
}

/** A date (YYYY-MM-DD); optionally not before `min`. '' when valid. */
export function validateDate(value, { min } = {}) {
  const v = (value ?? '').trim();
  if (!v) return 'Please pick a date';
  if (min && v < min) return 'Please pick a date that is not in the past';
  return '';
}

/** A time (HH:mm); optionally within opening/closing hours. '' when valid. */
export function validateTime(value, { opening, closing } = {}) {
  const v = (value ?? '').trim();
  if (!v) return 'Please choose a time';
  if (opening && v < opening) return `We open at ${opening}`;
  if (closing && v > closing) return `We close at ${closing}`;
  return '';
}

/** Class list for an .input, adding the error variant when the field is invalid. */
export function fieldClass(error) {
  return error ? 'input input-error' : 'input';
}

/** True when every value in the errors object is empty/falsy. */
export function isClean(errors) {
  return Object.values(errors).every((e) => !e);
}
