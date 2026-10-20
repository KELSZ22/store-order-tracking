import {useRef} from 'preact/hooks';
import type {TabDefinition} from '../../../lib/order-status';
import type {OrderTab} from '../types';

interface StatusTabsProps {
  tabs: TabDefinition[];
  active: OrderTab;
  counts: Record<OrderTab, number> | null;
  onChange: (tab: OrderTab) => void;
  panelId: string;
}

export function StatusTabs({tabs, active, counts, onChange, panelId}: StatusTabsProps) {
  const listRef = useRef<HTMLDivElement>(null);

  // Roving focus per WAI-ARIA tabs pattern: arrows/Home/End move and select.
  const onKeyDown = (e: KeyboardEvent) => {
    const index = tabs.findIndex((t) => t.id === active);
    let next = index;
    if (e.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    else return;
    e.preventDefault();
    onChange(tabs[next].id);
    const button = listRef.current?.querySelector<HTMLButtonElement>(`#tab-${tabs[next].id}`);
    button?.focus();
    button?.scrollIntoView({block: 'nearest', inline: 'nearest'});
  };

  return (
    <div class="-mx-4 border-b border-slate-200 sm:mx-0">
      <div
        ref={listRef}
        role="tablist"
        aria-label="Filter orders by status"
        onKeyDown={onKeyDown}
        class="scrollbar-none flex gap-1 overflow-x-auto px-4 sm:px-0"
      >
        {tabs.map((tab) => {
          const selected = tab.id === active;
          const count = counts?.[tab.id];
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(tab.id)}
              class={`relative flex min-h-11 shrink-0 items-center gap-1.5 px-3 text-sm font-medium whitespace-nowrap transition-colors ${
                selected ? 'text-brand' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
              {count !== undefined && (
                <span
                  class={`min-w-5 rounded-full px-1.5 text-center text-xs tabular-nums ${
                    selected ? 'bg-brand text-on-brand' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              )}
              {selected && (
                <span aria-hidden class="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-brand" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
