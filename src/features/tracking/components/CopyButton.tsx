import {Check, Copy} from 'lucide-preact';
import {useEffect, useState} from 'preact/hooks';
import {copyText} from '../../../lib/clipboard';

type CopyState = 'idle' | 'copied' | 'failed';

export function CopyButton({text, label}: {text: string; label: string}) {
  const [state, setState] = useState<CopyState>('idle');

  useEffect(() => {
    if (state !== 'copied') return;
    const timer = setTimeout(() => setState('idle'), 2000);
    return () => clearTimeout(timer);
  }, [state]);

  const onClick = async () => setState((await copyText(text)) ? 'copied' : 'failed');

  return (
    <div class="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={onClick}
        class="inline-flex min-h-9 items-center gap-1.5 rounded-store px-2.5 text-sm font-medium text-brand ring-1 ring-slate-300 ring-inset hover:bg-slate-50"
      >
        {state === 'copied' ? (
          <Check class="size-4" aria-hidden />
        ) : (
          <Copy class="size-4" aria-hidden />
        )}
        {state === 'copied' ? 'Copied' : 'Copy'}
        <span class="sr-only">{label}</span>
      </button>
      <span role="status" aria-live="polite" class="text-xs text-slate-600">
        {state === 'copied' && <span class="sr-only">Copied to clipboard</span>}
        {state === 'failed' && 'Couldn’t copy automatically. Tap the number to select it, then copy.'}
      </span>
    </div>
  );
}
