import { useId, cloneElement, Children } from 'react';
import { ChevronDown } from 'lucide-react';

const BASE =
  'w-full rounded-xl border border-line bg-white px-3.5 text-ink placeholder:text-muted/70 transition-colors ' +
  'focus:border-pine-600 focus:outline-none focus:ring-4 focus:ring-sage/60 ' +
  'disabled:bg-sage-50 disabled:text-muted aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger/10';

/** Etiqueta + control + ayuda/error. Conecta id, aria-describedby y aria-invalid al hijo. */
export function Field({ label, hint, error, opcional, className = '', children }) {
  const id = useId();
  const descId = `${id}-desc`;
  const hijo = Children.only(children);
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-[15px] font-bold text-ink">
        {label}
        {opcional && <span className="ml-1.5 font-normal text-muted">(opcional)</span>}
      </label>
      {cloneElement(hijo, {
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': error || hint ? descId : undefined,
      })}
      {(error || hint) && (
        <p id={descId} className={`text-sm ${error ? 'text-danger' : 'text-muted'}`}>{error || hint}</p>
      )}
    </div>
  );
}

export const Input = ({ className = '', ...p }) => <input className={`${BASE} h-11 ${className}`} {...p} />;

export const Select = ({ className = '', children, ...p }) => (
  <div className={`relative ${className}`}>
    <select className={`${BASE} h-11 appearance-none pr-10`} {...p}>
      {children}
    </select>
    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-[18px] -translate-y-1/2 text-pine-600" aria-hidden />
  </div>
);

export const Textarea = ({ className = '', ...p }) => <textarea className={`${BASE} min-h-28 py-2.5 ${className}`} {...p} />;
