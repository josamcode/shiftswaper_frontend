import React, { useCallback, useRef } from 'react';
import { FileSpreadsheet, Globe, LockKeyhole, Rocket } from 'lucide-react';
import { easeOutCubic, Reveal, useEnterProgress, useReducedMotion } from '../../motion';
import { PhoneDashboardMock, PhoneFrame } from '../product/Mockups';

const CARDS = [
  {
    icon: Rocket,
    title: 'Set up without IT',
    body: 'Register your company, confirm your email and start onboarding your team — all in the browser.',
  },
  {
    icon: FileSpreadsheet,
    title: 'Import your roster',
    body: 'Upload employee IDs from an Excel or CSV file instead of typing them in one by one.',
  },
  {
    icon: Globe,
    title: 'Nothing to install',
    body: 'Shiftswaper runs in any modern browser on phones, tablets and desktops.',
  },
  {
    icon: LockKeyhole,
    title: 'Secure by default',
    body: 'Hashed passwords, signed sessions, and verification codes that lock after repeated wrong attempts.',
  },
];

const Card = ({ c, delay }) => (
  <Reveal delay={delay} className="card-sand flex flex-col p-7 sm:p-8">
    <span className="icon-tile">
      <c.icon className="h-5 w-5" aria-hidden="true" />
    </span>
    <h3 className="mt-auto pt-10 font-display text-[clamp(1.4rem,1.2rem+0.5vw,1.75rem)] leading-tight text-ink">{c.title}</h3>
    <p className="mt-2 text-[15px] leading-relaxed text-ink/55">{c.body}</p>
  </Reveal>
);

const QuickStartGrid = () => {
  const visualRef = useRef(null);
  const innerRef = useRef(null);
  const reduced = useReducedMotion();

  // The centre visual comes into focus as it scrolls into view.
  const onProgress = useCallback((p) => {
    const el = innerRef.current;
    if (!el) return;
    const t = easeOutCubic(p);
    el.style.filter = `blur(${(1 - t) * 10}px)`;
    el.style.transform = `scale(${1.08 - 0.08 * t})`;
  }, []);
  useEnterProgress(visualRef, onProgress, { endFraction: 0.45, enabled: !reduced });

  return (
    <section className="bg-canvas pb-24 lg:pb-32" aria-labelledby="quickstart-title">
      <div className="container-site">
        <Reveal>
          <h2 id="quickstart-title" className="type-h2 mx-auto max-w-[20ch] text-center">
            Simple to set up. Easy to live with.
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr] lg:grid-rows-2">
          <Card c={CARDS[0]} delay={0} />
          <div ref={visualRef} className="relative overflow-hidden rounded-[20px] bg-gradient-to-b from-brand-100 via-brand-200 to-brand-300 md:row-span-2 lg:col-start-2 lg:row-span-2 lg:row-start-1" aria-hidden="true">
            <div ref={innerRef} className="flex h-full min-h-[420px] items-end justify-center pt-12 will-change-transform">
              <PhoneFrame className="h-[440px] w-[230px] translate-y-16 rotate-[-4deg]">
                <PhoneDashboardMock />
              </PhoneFrame>
            </div>
          </div>
          <Card c={CARDS[2]} delay={80} />
          <Card c={CARDS[1]} delay={120} />
          <Card c={CARDS[3]} delay={180} />
        </div>
      </div>
    </section>
  );
};

export default QuickStartGrid;
