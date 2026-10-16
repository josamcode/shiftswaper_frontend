import React, { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Reveal, useAutoCycle, useInView, useMediaQuery, useReducedMotion, useScrollProgress } from '../../motion';
import {
  AcceptVignette,
  ApprovalVignette,
  DayOffVignette,
  OffersVignette,
  RequestVignette,
} from '../product/Vignettes';

export const STEPS = [
  {
    title: 'Post a swap request',
    body: 'Pick the shift or day off you need to change, add a reason and the shift you’d rather work. It lands on your colleagues’ board straight away.',
    link: { label: 'Shift & day-off swaps', to: '/features#shift-swaps' },
    bg: 'linear-gradient(135deg, #EDEAFB 0%, #DCEEFF 100%)',
    tabs: ['Shift swap', 'Day-off swap'],
    media: (active, tab) =>
      tab === 0 ? <RequestVignette active={active} /> : <DayOffVignette active={active} />,
  },
  {
    title: 'Colleagues send offers',
    body: 'Teammates in the same position offer an alternative time on the same day. You get an email every time a new offer comes in.',
    link: { label: 'Counter-offers', to: '/features#counter-offers' },
    bg: 'linear-gradient(135deg, #FDEBDF 0%, #FCE7EA 100%)',
    tabs: ['Offers'],
    media: (active) => <OffersVignette active={active} />,
  },
  {
    title: 'Choose the offer that works',
    body: 'Accept one offer and the others are declined automatically. The agreed swap then moves to supervisors for sign-off.',
    link: { label: 'How offers work', to: '/how_it_works#employee' },
    bg: 'linear-gradient(135deg, #E2F4EE 0%, #DCEEFF 100%)',
    tabs: ['Accept'],
    media: (active) => <AcceptVignette active={active} />,
  },
  {
    title: 'Supervisors give the final say',
    body: 'Either supervisor involved can approve or reject. Both employees hear about the decision by email, and it stays on record.',
    link: { label: 'Supervisor approval', to: '/features#approvals' },
    bg: 'linear-gradient(135deg, #FCF3D7 0%, #E2F4EE 100%)',
    tabs: ['Approve'],
    media: (active) => <ApprovalVignette active={active} />,
  },
];

const pad = (n) => String(n).padStart(2, '0');

/** Numbered ring; `ringRef` lets the pinned version drive the arc per frame. */
const Counter = ({ n, ringRef, full = false }) => (
  <div className="relative flex h-[58px] w-[58px] items-center justify-center">
    <svg viewBox="0 0 60 60" className="absolute inset-0 -rotate-90" aria-hidden="true">
      <circle cx="30" cy="30" r="27" fill="none" stroke="rgba(32,28,68,0.1)" strokeWidth="2.5" />
      <circle
        ref={ringRef}
        cx="30"
        cy="30"
        r="27"
        fill="none"
        stroke="#201C44"
        strokeWidth="2.5"
        strokeLinecap="round"
        pathLength="100"
        strokeDasharray="100"
        strokeDashoffset={full ? 0 : 100}
      />
    </svg>
    <span className="font-display text-[19px] text-ink">{pad(n)}</span>
  </div>
);

const MediaStage = ({ step, active, rounded = 'rounded-[32px] lg:rounded-[48px]' }) => {
  const [tab, setTab] = useAutoCycle(step.tabs.length, 7000, active);
  return (
    <div className={`relative h-full w-full overflow-hidden ${rounded}`} style={{ background: step.bg }}>
      <Decor />
      <div className="absolute inset-0 flex items-center justify-center px-6 pb-14 pt-10 sm:px-10">{step.media(active, tab)}</div>
      <div className="absolute inset-x-0 bottom-5 flex justify-center gap-6" role={step.tabs.length > 1 ? 'tablist' : undefined}>
        {step.tabs.map((t, i) =>
          step.tabs.length > 1 ? (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === i}
              onClick={() => setTab(i)}
              className={`text-[14px] font-semibold transition-colors duration-300 ${tab === i ? 'text-ink' : 'text-ink/35 hover:text-ink/60'}`}
            >
              {t}
            </button>
          ) : (
            <span key={t} className="text-[14px] font-semibold text-ink/45">
              {t}
            </span>
          )
        )}
      </div>
    </div>
  );
};

const Decor = () => (
  <div aria-hidden="true">
    <span className="absolute left-[12%] top-[16%] h-2 w-2 rounded-full bg-white/80" />
    <span className="absolute right-[14%] top-[22%] h-3 w-3 rounded-full bg-white/60" />
    <span className="absolute bottom-[26%] left-[18%] h-2.5 w-2.5 rotate-45 rounded-[3px] bg-white/70" />
    <span className="absolute bottom-[20%] right-[22%] h-2 w-2 rounded-full bg-white/70" />
    <span className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/25 blur-2xl" />
    <span className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-white/30 blur-2xl" />
  </div>
);

/* ------------------------------------------------------------------ */
/* Pinned (desktop)                                                    */
/* ------------------------------------------------------------------ */
const PinnedStory = () => {
  const trackRef = useRef(null);
  const fillRef = useRef(null);
  const dotRef = useRef(null);
  const ringRefs = useRef([]);
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const visible = useInView(trackRef, { rootMargin: '0px' });
  const n = STEPS.length;

  const onProgress = useCallback(
    (p) => {
      const scaled = p * n;
      const i = Math.min(n - 1, Math.floor(scaled));
      const within = Math.min(1, scaled - i);
      if (i !== indexRef.current) {
        indexRef.current = i;
        setIndex(i);
      }
      if (fillRef.current) fillRef.current.style.transform = `scaleY(${Math.max(0.04, p)})`;
      if (dotRef.current) dotRef.current.style.top = `calc(${Math.max(0.04, p) * 100}% - 6px)`;
      ringRefs.current.forEach((ring, k) => {
        if (!ring) return;
        const v = k < i ? 1 : k === i ? Math.max(0.06, within) : 0;
        ring.style.strokeDashoffset = String(100 - v * 100);
      });
    },
    [n]
  );

  useScrollProgress(trackRef, onProgress, { startOffset: 70 });

  return (
    <div ref={trackRef} className="relative" style={{ height: `calc(${n} * 75vh + 100vh - 70px)` }}>
      <div className="sticky top-[70px] flex h-[calc(100vh-70px)] items-center">
        <div className="container-site">
          <div className="grid grid-cols-[12px_minmax(0,0.6fr)_minmax(0,1fr)] items-center gap-x-10 xl:gap-x-14">
            {/* Progress line */}
            <div className="relative h-[min(520px,62vh)] w-3" aria-hidden="true">
              <span className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 rounded-full bg-ink/10" />
              <span ref={fillRef} className="absolute left-1/2 top-0 h-full w-0.5 origin-top -translate-x-1/2 rounded-full bg-ink" style={{ transform: 'scaleY(0.04)' }} />
              <span ref={dotRef} className="absolute left-0 h-3 w-3 rounded-full bg-ink" style={{ top: 'calc(4% - 6px)' }} />
            </div>

            {/* Step copy */}
            <div className="relative min-h-[340px]">
              {STEPS.map((s, i) => (
                <article
                  key={s.title}
                  aria-hidden={i !== index}
                  className={`absolute inset-x-0 top-1/2 duration-[550ms] ease-out-expo ${
                    i === index
                      ? 'visible translate-y-[-50%] opacity-100'
                      : `invisible opacity-0 ${i < index ? 'translate-y-[calc(-50%_-_24px)]' : 'translate-y-[calc(-50%_+_24px)]'}`
                  }`}
                  style={{ transitionProperty: 'opacity, transform, visibility', transitionDelay: i === index ? '120ms' : '0ms' }}
                >
                  <Counter n={i + 1} ringRef={(el) => (ringRefs.current[i] = el)} />
                  <h3 className="mt-7 font-display text-[clamp(1.75rem,1.2rem+1vw,2.15rem)] leading-tight text-ink">{s.title}</h3>
                  <p className="mt-4 max-w-[400px] text-[16px] leading-relaxed text-ink/55">{s.body}</p>
                  <Link to={s.link.to} className="link-arrow mt-5 text-[15px]" tabIndex={i === index ? 0 : -1}>
                    {s.link.label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </article>
              ))}
            </div>

            {/* Media */}
            <div className="relative aspect-[820/560] max-h-[calc(100vh-160px)] w-full">
              {STEPS.map((s, i) => (
                <div
                  key={s.title}
                  aria-hidden={i !== index}
                  className={`absolute inset-0 transition-[opacity,transform] duration-[650ms] ease-out-expo ${
                    i === index ? 'scale-100 opacity-100' : 'pointer-events-none scale-[0.985] opacity-0'
                  }`}
                >
                  <MediaStage step={s} active={visible && i === index} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Stacked (mobile, tablet, reduced motion)                            */
/* ------------------------------------------------------------------ */
const StackedItem = ({ step, i }) => {
  const ref = useRef(null);
  const visible = useInView(ref, { rootMargin: '-15% 0px -15% 0px' });
  return (
    <li className="grid items-center gap-8 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] md:gap-10">
      <Reveal>
        <Counter n={i + 1} full />
        <h3 className="mt-5 font-display text-[28px] leading-tight text-ink">{step.title}</h3>
        <p className="mt-3 max-w-[460px] text-[16px] leading-relaxed text-ink/60">{step.body}</p>
        <Link to={step.link.to} className="link-arrow mt-4 text-[15px]">
          {step.link.label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </Reveal>
      <Reveal delay={100}>
        <div ref={ref} className="relative h-[440px] sm:h-[460px]">
          <MediaStage step={step} active={visible} rounded="rounded-[28px]" />
        </div>
      </Reveal>
    </li>
  );
};

const ScrollStory = ({ id = 'how-it-works', title = 'From request to approval, in four steps', lead }) => {
  const isDesktop = useMediaQuery('(min-width: 1024px) and (min-height: 640px)');
  const reduced = useReducedMotion();
  const pinned = isDesktop && !reduced;

  return (
    <section id={id} className="relative bg-canvas" aria-labelledby={`${id}-title`}>
      <div className="container-site pt-8 lg:pt-16">
        <Reveal>
          <h2 id={`${id}-title`} className="type-h2 max-w-[16ch]">
            {title}
          </h2>
        </Reveal>
        <Reveal delay={80}>
          <p className="type-lead mt-6 max-w-[620px]">
            {lead || 'One shared workflow replaces scattered messages, so every change is agreed by both employees and signed off by a supervisor.'}
          </p>
        </Reveal>
      </div>
      {pinned ? (
        <PinnedStory />
      ) : (
        <div className="container-site pb-24 pt-14">
          <ol className="space-y-20">
            {STEPS.map((s, i) => (
              <StackedItem key={s.title} step={s} i={i} />
            ))}
          </ol>
        </div>
      )}
    </section>
  );
};

export default ScrollStory;
