import {Check} from 'lucide-preact';
import {storeConfig} from '../../../config/store';
import {formatShortDate} from '../../../lib/date';
import type {ProgressStep} from '../../../lib/order-status';

/** Compact four-step progress bar; fits a 360px screen without wrapping steps. */
export function ProgressSteps({steps}: {steps: ProgressStep[]}) {
  const lastReached = steps.reduce((acc, s, i) => (s.state === 'upcoming' ? acc : i), -1);

  return (
    <ol aria-label="Order progress" class="flex">
      {steps.map((step, i) => {
        const reached = step.state !== 'upcoming';
        const nextReached = steps[i + 1] && steps[i + 1].state !== 'upcoming';

        return (
          <li
            key={step.key}
            aria-current={i === lastReached ? 'step' : undefined}
            class="relative flex flex-1 flex-col items-center gap-1.5 text-center"
          >
            {i < steps.length - 1 && (
              <span
                aria-hidden
                class={`absolute top-3 left-1/2 h-0.5 w-full ${nextReached ? 'bg-brand' : 'bg-slate-200'}`}
              />
            )}
            <span
              class={`relative z-10 grid size-6 place-items-center rounded-full ${
                reached ? 'bg-brand text-on-brand' : 'bg-white ring-2 ring-slate-200 ring-inset'
              } ${i === lastReached ? 'ring-4 ring-brand-soft' : ''}`}
            >
              {reached && <Check class="size-3.5" aria-hidden />}
            </span>
            <span class={`px-1 text-xs leading-tight font-medium ${reached ? 'text-slate-900' : 'text-slate-500'}`}>
              {step.label}
              <span class="sr-only">{reached ? ', done' : ', not yet'}</span>
            </span>
            {step.at && (
              <time dateTime={step.at} class="-mt-1 text-[11px] text-slate-500">
                {formatShortDate(step.at, storeConfig)}
              </time>
            )}
          </li>
        );
      })}
    </ol>
  );
}
