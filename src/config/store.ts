/**
 * Store configuration.
 *
 * Every merchant-specific value (name, branding, URLs, locale, currency) lives
 * here so the same codebase can be re-branded for another shop without touching
 * UI components. Values below are safe, brand-neutral demo defaults.
 */

export interface StoreTheme {
  /** Main brand color used for primary actions, links and active states. */
  primary: string;
  /** Text/icon color rendered on top of `primary`. Must meet WCAG AA contrast. */
  onPrimary: string;
  /** Soft accent color used for highlights and subtle surfaces. */
  secondary: string;
  /** CSS font-family stack. Prefer system fonts to stay local-first. */
  fontFamily: string;
  /** Base corner radius for cards and controls (any CSS length). */
  radius: string;
}

export interface StoreConfig {
  storeName: string;
  /** Optional logo; when omitted the store name is rendered as a wordmark. */
  logoUrl?: string;
  /** Public storefront base URL (no trailing slash). Used for "Continue shopping" links. */
  storefrontUrl: string;
  /** BCP 47 locale used for number and date formatting. */
  locale: string;
  /** ISO 4217 currency code. */
  currency: string;
  /** IANA time zone used to display event timestamps. */
  timeZone: string;
  /** Show the "To Pay" tab (hide it for stores that only take prepaid/COD orders). */
  showToPayTab: boolean;
  theme: StoreTheme;
}

export const storeConfig: StoreConfig = {
  storeName: 'Demo Store',
  logoUrl: undefined,
  storefrontUrl: 'https://example.com',
  locale: 'en-PH',
  currency: 'PHP',
  timeZone: 'Asia/Manila',
  showToPayTab: true,
  theme: {
    primary: '#0f766e',
    onPrimary: '#ffffff',
    secondary: '#ccfbf1',
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    radius: '0.75rem',
  },
};

/** Writes theme tokens to CSS custom properties consumed by `styles/index.css`. */
export function applyStoreTheme(config: StoreConfig, root: HTMLElement = document.documentElement) {
  const {theme} = config;
  root.style.setProperty('--store-primary', theme.primary);
  root.style.setProperty('--store-on-primary', theme.onPrimary);
  root.style.setProperty('--store-secondary', theme.secondary);
  root.style.setProperty('--store-font', theme.fontFamily);
  root.style.setProperty('--store-radius', theme.radius);
  root.lang = config.locale;
  document.title = `My Orders · ${config.storeName}`;
}

