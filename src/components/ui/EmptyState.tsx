import type {ComponentChildren} from 'preact';
import type {LucideIcon} from 'lucide-preact';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: ComponentChildren;
  action?: ComponentChildren;
  role?: 'status' | 'alert';
}

export function EmptyState({icon: Icon, title, description, action, role}: EmptyStateProps) {
  return (
    <div
      role={role}
      class="flex flex-col items-center rounded-store bg-white px-6 py-12 text-center ring-1 ring-slate-200"
    >
      <span class="mb-4 grid size-14 place-items-center rounded-full bg-brand-soft text-brand">
        <Icon class="size-7" aria-hidden />
      </span>
      <h2 class="text-base font-semibold text-slate-900">{title}</h2>
      {description && <p class="mt-1 max-w-sm text-sm text-slate-600">{description}</p>}
      {action && <div class="mt-5">{action}</div>}
    </div>
  );
}
