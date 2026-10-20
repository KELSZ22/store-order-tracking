import type {ComponentChildren} from 'preact';
import type {Tone} from '../../lib/order-status';

const TONE_CLASSES: Record<Tone, string> = {
  neutral: 'bg-slate-100 text-slate-700 ring-slate-200',
  info: 'bg-sky-50 text-sky-800 ring-sky-200',
  warning: 'bg-amber-50 text-amber-800 ring-amber-200',
  success: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  danger: 'bg-rose-50 text-rose-800 ring-rose-200',
};

interface BadgeProps {
  tone?: Tone;
  children: ComponentChildren;
  class?: string;
}

export function Badge({tone = 'neutral', children, class: className = ''}: BadgeProps) {
  return (
    <span
      class={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset ${TONE_CLASSES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
