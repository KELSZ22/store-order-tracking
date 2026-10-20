import type {JSX} from 'preact';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-on-brand hover:brightness-110 active:brightness-95',
  secondary: 'bg-white text-slate-800 ring-1 ring-inset ring-slate-300 hover:bg-slate-50',
  ghost: 'text-brand hover:bg-brand-soft/60',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-3 text-sm',
  md: 'min-h-11 px-4 text-sm',
};

/** Shared button styling so links and buttons look identical. */
export function buttonClass(variant: ButtonVariant = 'secondary', size: ButtonSize = 'md') {
  return `inline-flex items-center justify-center gap-2 rounded-store font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]}`;
}

type ButtonProps = JSX.HTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  type?: 'button' | 'submit';
};

export function Button({
  variant,
  size,
  class: className = '',
  type = 'button',
  ...rest
}: ButtonProps) {
  return <button type={type} class={`${buttonClass(variant, size)} ${className}`} {...rest} />;
}
