import type {ComponentChildren} from 'preact';
import {ChevronDown, type LucideIcon} from 'lucide-preact';

interface DisclosureProps {
  icon: LucideIcon;
  title: string;
  /** Short preview shown while collapsed, so the key fact is visible without opening. */
  summary?: ComponentChildren;
  children: ComponentChildren;
}

/** Native <details> row: keyboard and screen-reader accessible without extra JS. */
export function Disclosure({icon: Icon, title, summary, children}: DisclosureProps) {
  return (
    <details class="group border-t border-slate-100 first:border-t-0">
      <summary class="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 py-3 [&::-webkit-details-marker]:hidden">
        <span class="flex items-center gap-2.5 text-sm font-medium text-slate-900">
          <Icon class="size-4 text-slate-400" aria-hidden />
          {title}
        </span>
        <span class="flex min-w-0 items-center gap-2 text-sm text-slate-500">
          <span class="truncate">{summary}</span>
          <ChevronDown class="size-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden />
        </span>
      </summary>
      <div class="pb-4 pl-6.5">{children}</div>
    </details>
  );
}
