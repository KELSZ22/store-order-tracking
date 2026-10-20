import {useState} from 'preact/hooks';
import type {LineItem} from '../types';

const SIZE_CLASSES = {
  sm: 'size-12 text-sm',
  md: 'size-14 text-base',
};

/** Stable hue per product so placeholders are distinguishable but brand-neutral. */
function hueFor(seed: string): number {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) % 360;
  return hash;
}

interface ProductThumbnailProps {
  item: Pick<LineItem, 'title' | 'image'>;
  size?: keyof typeof SIZE_CLASSES;
}

export function ProductThumbnail({item, size = 'md'}: ProductThumbnailProps) {
  const [failed, setFailed] = useState(false);
  const base = `${SIZE_CLASSES[size]} shrink-0 overflow-hidden rounded-store ring-1 ring-slate-200`;

  if (item.image && !failed) {
    return (
      <img
        src={item.image.url}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
        class={`${base} bg-slate-100 object-cover`}
      />
    );
  }

  const hue = hueFor(item.title);
  return (
    <span
      aria-hidden
      class={`${base} grid place-items-center font-semibold`}
      style={{backgroundColor: `hsl(${hue} 55% 93%)`, color: `hsl(${hue} 45% 28%)`}}
    >
      {item.title.charAt(0).toUpperCase()}
    </span>
  );
}
