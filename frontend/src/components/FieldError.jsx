/** A small inline validation message shown beneath a form field. Renders nothing when empty. */
export default function FieldError({ children }) {
  if (!children) return null;
  return <p className="mt-1 text-sm text-red-600">{children}</p>;
}
