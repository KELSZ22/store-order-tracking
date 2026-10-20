import {Search, X} from 'lucide-preact';

interface OrderSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function OrderSearch({value, onChange}: OrderSearchProps) {
  return (
    <form role="search" onSubmit={(e) => e.preventDefault()} class="relative">
      <label for="order-search" class="sr-only">
        Search orders by order number or product name
      </label>
      <Search
        class="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-slate-400"
        aria-hidden
      />
      <input
        id="order-search"
        type="search"
        inputMode="search"
        autoComplete="off"
        placeholder="Search by order number or product"
        value={value}
        onInput={(e) => onChange(e.currentTarget.value)}
        onKeyDown={(e) => e.key === 'Escape' && onChange('')}
        class="min-h-11 w-full rounded-store border-0 bg-white py-2.5 pr-11 pl-10 text-base text-slate-900 shadow-sm ring-1 ring-slate-300 ring-inset placeholder:text-slate-400 focus:ring-2 focus:ring-brand focus:outline-none sm:text-sm [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          class="absolute top-1/2 right-1 grid size-9 -translate-y-1/2 place-items-center rounded-store text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Clear search"
        >
          <X class="size-4" aria-hidden />
        </button>
      )}
    </form>
  );
}
