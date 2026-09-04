import { useState } from 'react';
import { isClean } from '../lib/validate';

/**
 * Standardizes field-level validation across forms so error messages appear
 * consistently and inline (no native browser popups).
 *
 * `validators` is a map of `{ field: () => errorMessage }` where a validator
 * returns '' when the field is valid. Build it fresh each render so the closures
 * read the latest form state.
 *
 * Returns:
 *  - `errors`      — current `{ field: message }` map (drives red text + border)
 *  - `clear(field)`— clear a field's error (call while the user types)
 *  - `blur(field)` — an onBlur handler that validates just that field
 *  - `validateAll()` — validate every field on submit; returns true when clean
 */
export default function useFieldErrors(validators) {
  const [errors, setErrors] = useState({});

  const clear = (field) => setErrors((e) => (e[field] ? { ...e, [field]: '' } : e));

  const blur = (field) => () => setErrors((e) => ({ ...e, [field]: validators[field]() }));

  const validateAll = () => {
    const result = Object.fromEntries(
      Object.entries(validators).map(([field, run]) => [field, run()]),
    );
    setErrors(result);
    return isClean(result);
  };

  return { errors, clear, blur, validateAll };
}
