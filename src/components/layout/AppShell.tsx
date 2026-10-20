import type {ComponentChildren} from 'preact';
import {FlaskConical, Store} from 'lucide-preact';
import {routes} from '../../app/router';
import {storeConfig} from '../../config/store';

export function AppShell({children}: {children: ComponentChildren}) {
  const {storeName, logoUrl, storefrontUrl} = storeConfig;

  return (
    <div class="flex min-h-dvh flex-col">
      <a
        href="#main"
        class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-store focus:bg-white focus:px-4 focus:py-2 focus:shadow"
      >
        Skip to content
      </a>

      <header class="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div class="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
          <a
            href={routes.orders()}
            class="flex min-w-0 items-center gap-2 rounded-store font-semibold text-slate-900"
          >
            {logoUrl ? (
              <img src={logoUrl} alt={storeName} class="h-8 w-auto" />
            ) : (
              <>
                <span class="grid size-8 shrink-0 place-items-center rounded-store bg-brand text-on-brand">
                  <Store class="size-4" aria-hidden />
                </span>
                <span class="truncate">{storeName}</span>
              </>
            )}
          </a>

          <div class="flex items-center gap-2 sm:gap-4">
            <span
              class="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 ring-1 ring-amber-200 ring-inset"
              title="This prototype uses synthetic orders and is not connected to a live store."
            >
              <FlaskConical class="size-3.5" aria-hidden />
              Demo data
            </span>
            <a
              href={storefrontUrl}
              class="hidden text-sm font-medium text-brand hover:underline sm:inline"
            >
              Continue shopping
            </a>
          </div>
        </div>
      </header>

      <main id="main" class="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>

      <footer class="border-t border-slate-200 bg-white">
        <p class="mx-auto max-w-5xl px-4 py-4 text-xs text-slate-500 sm:px-6">
          Prototype for {storeName}. All orders, addresses and tracking numbers shown are
          synthetic demo data and are not connected to any store or carrier.
        </p>
      </footer>
    </div>
  );
}
