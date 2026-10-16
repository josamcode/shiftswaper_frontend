import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeftRight, CalendarDays, Check, Clock, MousePointer2, Plus, Send } from 'lucide-react';
import { useReducedMotion } from '../../motion';
import { Face } from './People';
import { ApprovalCard, DayOffMock, EmailMock, person, StatusBadge } from './Mockups';

/*
 * Short looping product stories used in the "How it works" scroll sequence.
 * Each one only runs while `active` and freezes on its final frame when the
 * user prefers reduced motion.
 */

/** Advances through `durations` (ms per step) and loops while active. */
export function useSequence(durations, active) {
  const reduced = useReducedMotion();
  const last = durations.length - 1;
  const [step, setStep] = useState(0);
  const durationsRef = useRef(durations);
  durationsRef.current = durations;

  useEffect(() => {
    if (!active) {
      setStep(0);
      return undefined;
    }
    if (reduced) {
      setStep(last);
      return undefined;
    }
    const t = setTimeout(() => setStep((s) => (s >= last ? 0 : s + 1)), durationsRef.current[step]);
    return () => clearTimeout(t);
  }, [active, reduced, step, last]);

  return reduced && active ? last : step;
}

const Typed = ({ text, show, className = '' }) => {
  const reduced = useReducedMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!show) {
      setN(0);
      return undefined;
    }
    if (reduced) {
      setN(text.length);
      return undefined;
    }
    if (n >= text.length) return undefined;
    const t = setTimeout(() => setN((v) => v + 1), 38);
    return () => clearTimeout(t);
  }, [show, n, text, reduced]);
  return (
    <span className={className}>
      {text.slice(0, n)}
      {show && n < text.length && <span className="ml-px inline-block h-3.5 w-px animate-pulse bg-ink align-middle" />}
    </span>
  );
};

const Cursor = ({ visible, className = '' }) => (
  <MousePointer2
    aria-hidden="true"
    className={`pointer-events-none absolute h-5 w-5 fill-ink text-white drop-shadow transition-all duration-700 ease-out-expo ${
      visible ? 'opacity-100' : 'opacity-0'
    } ${className}`}
  />
);

const Field = ({ label, children, focus }) => (
  <div>
    <p className="mb-1 text-[10.5px] font-medium text-ink/50">{label}</p>
    <div
      className={`flex h-8 items-center rounded-lg border bg-white px-2.5 text-[12px] text-ink transition-all duration-300 ${
        focus ? 'border-brand-500 shadow-ring' : 'border-ink/[0.12]'
      }`}
    >
      {children}
    </div>
  </div>
);

/* 1 — Employee posts a request ------------------------------------------- */
export const RequestVignette = ({ active, mode = 'shift' }) => {
  // 0 empty → 1 date → 2 times → 3 reason typing → 4 click submit → 5 posted
  const step = useSequence([700, 900, 900, 2200, 700, 2600], active);
  const isDayOff = mode === 'dayoff';
  return (
    <div className="relative mx-auto w-full max-w-[340px]">
      <div className="rounded-2xl border border-ink/[0.08] bg-white p-4 shadow-float">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-display text-[17px] text-ink">New request</p>
          <div className="flex rounded-full bg-sand-200 p-0.5 text-[10.5px] font-semibold">
            <span className={`rounded-full px-2.5 py-1 ${!isDayOff ? 'bg-white text-ink shadow-soft' : 'text-ink/50'}`}>Shift</span>
            <span className={`rounded-full px-2.5 py-1 ${isDayOff ? 'bg-white text-ink shadow-soft' : 'text-ink/50'}`}>Day off</span>
          </div>
        </div>
        <div className="space-y-2.5">
          {isDayOff ? (
            <div className="grid grid-cols-2 gap-2">
              <Field label="My day off" focus={step === 1}>
                {step >= 1 ? 'Sat, Oct 18' : <span className="text-ink/30">Select date</span>}
              </Field>
              <Field label="Day I want off" focus={step === 2}>
                {step >= 2 ? 'Tue, Oct 21' : <span className="text-ink/30">Select date</span>}
              </Field>
            </div>
          ) : (
            <>
              <Field label="Shift date" focus={step === 1}>
                <CalendarDays className="mr-1.5 h-3.5 w-3.5 text-ink/40" aria-hidden="true" />
                {step >= 1 ? 'Thu, Oct 23' : <span className="text-ink/30">Select date</span>}
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Current shift" focus={step === 2}>
                  {step >= 2 ? '07:00 – 15:00' : <span className="text-ink/30">--:--</span>}
                </Field>
                <Field label="Desired shift" focus={step === 2}>
                  {step >= 2 ? '15:00 – 23:00' : <span className="text-ink/30">--:--</span>}
                </Field>
              </div>
            </>
          )}
          <div>
            <p className="mb-1 text-[10.5px] font-medium text-ink/50">Reason</p>
            <div
              className={`min-h-[52px] rounded-lg border bg-white px-2.5 py-2 text-[12px] leading-snug text-ink transition-all duration-300 ${
                step === 3 ? 'border-brand-500 shadow-ring' : 'border-ink/[0.12]'
              }`}
            >
              <Typed text={isDayOff ? 'Family visit over the weekend' : 'Doctor’s appointment in the morning'} show={step >= 3} />
            </div>
          </div>
          <div
            className={`flex h-9 items-center justify-center gap-1.5 rounded-full text-[12px] font-semibold text-white transition-all duration-300 ${
              step === 4 ? 'scale-[0.97] bg-brand-600' : 'bg-brand-500'
            }`}
          >
            <Send className="h-3.5 w-3.5" aria-hidden="true" /> Post request
          </div>
        </div>
      </div>
      <Cursor visible={step === 4} className="bottom-3 right-16" />
      <div
        className={`absolute -right-3 -top-4 transition-all duration-500 ease-out-expo sm:-right-10 ${
          step >= 5 ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
        }`}
      >
        <span className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-[11px] font-semibold text-white shadow-lift">
          <Check className="h-3.5 w-3.5 text-mint-300" aria-hidden="true" /> Posted to the board
        </span>
      </div>
    </div>
  );
};

/* 2 — Colleagues send offers --------------------------------------------- */
const OFFERS = [
  { who: 'lina', time: '15:00 – 23:00' },
  { who: 'david', time: '11:00 – 19:00' },
  { who: 'sara', time: '13:00 – 21:00' },
];

export const OffersVignette = ({ active }) => {
  // 0 waiting → 1..3 offers arrive → 4 hold
  const step = useSequence([800, 900, 900, 900, 2600], active);
  const shown = Math.min(step, 3);
  return (
    <div className="relative mx-auto w-full max-w-[350px]">
      <div className="rounded-2xl border border-ink/[0.08] bg-white p-4 shadow-float">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Face person={person('maya')} className="h-8 w-8" />
            <div>
              <p className="text-[12.5px] font-semibold text-ink">Your request</p>
              <p className="flex items-center gap-1 text-[10.5px] text-ink/50">
                <Clock className="h-3 w-3" aria-hidden="true" /> Thu, Oct 23 · 07:00 – 15:00
              </p>
            </div>
          </div>
          <StatusBadge status={shown > 0 ? 'offers_received' : 'pending'} />
        </div>
        <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-wider text-ink/40">Offers · same day</p>
        <ul className="space-y-2">
          {OFFERS.map((o, i) => {
            const p = person(o.who);
            const visible = i < shown;
            return (
              <li
                key={o.who}
                className={`flex items-center gap-2.5 rounded-xl border border-ink/[0.07] bg-sand-50 p-2.5 transition-all duration-500 ease-out-expo ${
                  visible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
                }`}
              >
                <Face person={p} className="h-7 w-7" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-semibold text-ink">{p.name}</p>
                  <p className="text-[10.5px] text-ink/50">Offers {o.time}</p>
                </div>
                <span className="rounded-full bg-brand-500 px-2.5 py-1 text-[10.5px] font-semibold text-white">Accept</span>
              </li>
            );
          })}
        </ul>
      </div>
      <div
        className={`absolute -bottom-7 -left-3 transition-all duration-500 ease-out-expo sm:-left-12 ${
          shown > 0 ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
        }`}
      >
        <EmailMock title="New offer on your request" tone="brand" className="max-w-[230px] !p-2.5" />
      </div>
    </div>
  );
};

/* 3 — Requester picks one offer ------------------------------------------ */
export const AcceptVignette = ({ active }) => {
  // 0 list → 1 cursor → 2 accepted (others auto-rejected) → 3 hold
  const step = useSequence([900, 900, 700, 2800], active);
  return (
    <div className="relative mx-auto w-full max-w-[350px]">
      <div className="rounded-2xl border border-ink/[0.08] bg-white p-4 shadow-float">
        <p className="mb-3 font-display text-[17px] text-ink">Choose an offer</p>
        <ul className="space-y-2">
          {OFFERS.map((o, i) => {
            const p = person(o.who);
            const chosen = i === 0;
            const decided = step >= 2;
            return (
              <li
                key={o.who}
                className={`flex items-center gap-2.5 rounded-xl border p-2.5 transition-all duration-500 ${
                  decided && chosen
                    ? 'border-mint-300 bg-mint-100'
                    : decided
                      ? 'border-ink/[0.06] bg-sand-50 opacity-60'
                      : 'border-ink/[0.07] bg-sand-50'
                }`}
              >
                <Face person={p} className="h-7 w-7" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-semibold text-ink">{p.name}</p>
                  <p className="text-[10.5px] text-ink/50">{o.time}</p>
                </div>
                {decided ? (
                  <span
                    className={`chip ${chosen ? 'bg-mint-500 text-white' : 'bg-rose-200 text-rose-700'}`}
                  >
                    {chosen ? (
                      <>
                        <Check className="h-3 w-3" aria-hidden="true" /> Accepted
                      </>
                    ) : (
                      'Not selected'
                    )}
                  </span>
                ) : (
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10.5px] font-semibold text-white transition-all duration-300 ${
                      chosen && step === 1 ? 'scale-95 bg-brand-600' : 'bg-brand-500'
                    }`}
                  >
                    Accept
                  </span>
                )}
              </li>
            );
          })}
        </ul>
        <div
          className={`mt-3 flex items-center gap-2 rounded-xl bg-brand-50 p-2.5 text-[11px] text-brand-800 transition-all duration-500 ${
            step >= 2 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <ArrowLeftRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Sent to supervisors for approval
        </div>
      </div>
      <Cursor visible={step === 1} className="right-6 top-[74px]" />
    </div>
  );
};

/* 4 — Supervisor decides ------------------------------------------------- */
export const ApprovalVignette = ({ active }) => {
  // 0 awaiting → 1 cursor → 2 approved → 3 emails → 4 hold
  const step = useSequence([1000, 900, 700, 900, 2600], active);
  return (
    <div className="relative mx-auto w-full max-w-[350px]">
      <ApprovalCard decided={step >= 2 ? 'approved' : null} className="shadow-float" />
      <Cursor visible={step === 1} className="bottom-6 left-24" />
      <div className="absolute -bottom-6 -right-3 space-y-2 sm:-right-12">
        <div className={`transition-all duration-500 ease-out-expo ${step >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`}>
          <EmailMock title="Swap approved — Maya" className="max-w-[230px] !p-2.5" />
        </div>
      </div>
    </div>
  );
};

/* Day-off variant used in step 1 sub-tab --------------------------------- */
export const DayOffVignette = ({ active }) => {
  const step = useSequence([900, 1600, 2400], active);
  return (
    <div className="relative mx-auto w-full max-w-[360px]">
      <DayOffMock swapped={step >= 1} />
      <div
        className={`mx-auto mt-3 flex w-fit items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-[11px] font-semibold text-white shadow-lift transition-all duration-500 ${
          step >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
        }`}
      >
        <Plus className="h-3.5 w-3.5 text-mint-300" aria-hidden="true" /> Day-off request posted
      </div>
    </div>
  );
};
