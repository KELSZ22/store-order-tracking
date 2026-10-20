import type {Money} from '../features/orders/types';

const formatters = new Map<string, Intl.NumberFormat>();

function getFormatter(locale: string, currencyCode: string): Intl.NumberFormat {
  const key = `${locale}|${currencyCode}`;
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {style: 'currency', currency: currencyCode});
    formatters.set(key, formatter);
  }
  return formatter;
}

export function formatMoney(money: Money, locale: string): string {
  return getFormatter(locale, money.currencyCode).format(money.amount);
}
