export function Skeleton({class: className = ''}: {class?: string}) {
  return <div aria-hidden class={`animate-pulse rounded-md bg-slate-200 ${className}`} />;
}
