import type {ComponentChildren} from 'preact';

interface CardProps {
  title?: string;
  action?: ComponentChildren;
  children: ComponentChildren;
  class?: string;
}

export function Card({title, action, children, class: className = ''}: CardProps) {
  return (
    <section
      class={`rounded-store bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5 ${className}`}
      aria-label={title}
    >
      {(title || action) && (
        <div class="mb-3 flex items-center justify-between gap-3">
          {title && <h2 class="text-base font-semibold text-slate-900">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
