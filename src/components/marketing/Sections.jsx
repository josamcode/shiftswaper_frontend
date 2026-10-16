import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Reveal, useInViewOnce } from '../../motion';
import { PEOPLE, PersonTile } from '../product/People';

/** Centered serif page intro used by secondary marketing pages. */
export const PageHero = ({ eyebrow, title, lead, actions = true, children, className = '' }) => (
  <section className={`relative overflow-hidden bg-canvas ${className}`}>
    <HeroArcs />
    <div className="container-site relative pb-14 pt-16 text-center sm:pt-20 lg:pb-20 lg:pt-24">
      {eyebrow && (
        <Reveal y={12}>
          <p className="eyebrow justify-center">{eyebrow}</p>
        </Reveal>
      )}
      <Reveal delay={60}>
        <h1 className="type-display mx-auto mt-4 max-w-[17ch]">{title}</h1>
      </Reveal>
      {lead && (
        <Reveal delay={140}>
          <p className="type-lead mx-auto mt-6 max-w-[640px]">{lead}</p>
        </Reveal>
      )}
      {actions && (
        <Reveal delay={220}>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/company_register" className="btn btn-primary btn-lg w-full sm:w-auto">
              Create a company account
            </Link>
            <Link to="/employee_register" className="btn btn-outline btn-lg w-full sm:w-auto">
              Join your company
            </Link>
          </div>
        </Reveal>
      )}
      {children}
    </div>
  </section>
);

/** Faint concentric arcs behind hero headlines. */
export const HeroArcs = ({ className = '' }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 1200 1200"
    className={`pointer-events-none absolute left-1/2 top-1/2 h-[1200px] w-[1200px] -translate-x-1/2 -translate-y-1/2 text-ink/[0.045] ${className}`}
    fill="none"
  >
    {[220, 340, 460, 580].map((r) => (
      <circle key={r} cx="600" cy="600" r={r} stroke="currentColor" strokeWidth="1.5" />
    ))}
  </svg>
);

/** Section heading block (serif title + muted lead). */
export const SectionIntro = ({ eyebrow, title, lead, align = 'center', className = '', titleClass = 'type-h2' }) => (
  <div className={`${align === 'center' ? 'mx-auto text-center' : ''} ${className}`}>
    {eyebrow && (
      <Reveal y={12}>
        <p className={`eyebrow ${align === 'center' ? 'justify-center' : ''}`}>{eyebrow}</p>
      </Reveal>
    )}
    <Reveal delay={50}>
      <h2 className={`${titleClass} ${eyebrow ? 'mt-3' : ''} ${align === 'center' ? 'mx-auto max-w-[20ch]' : 'max-w-[18ch]'}`}>{title}</h2>
    </Reveal>
    {lead && (
      <Reveal delay={120}>
        <p className={`type-lead mt-5 ${align === 'center' ? 'mx-auto max-w-[620px]' : 'max-w-[560px]'}`}>{lead}</p>
      </Reveal>
    )}
  </div>
);

const ARCH = [
  { p: 0, h: 'h-[150px] sm:h-[170px]', w: 'w-[118px] sm:w-[150px]', chip: 'Offer sent', hide: 'hidden md:block' },
  { p: 3, h: 'h-[230px] sm:h-[270px]', w: 'w-[118px] sm:w-[160px]', chip: 'Day off swapped', hide: 'hidden sm:block' },
  { p: 2, h: 'h-[190px] sm:h-[220px]', w: 'w-[118px] sm:w-[170px]', chip: 'Shift covered' },
  { p: 1, h: 'h-[250px] sm:h-[300px]', w: 'w-[128px] sm:w-[180px]', chip: 'Approved ✓' },
  { p: 4, h: 'h-[190px] sm:h-[220px]', w: 'w-[118px] sm:w-[170px]', chip: 'Offer accepted' },
  { p: 6, h: 'h-[230px] sm:h-[270px]', w: 'w-[118px] sm:w-[160px]', chip: 'Request posted', hide: 'hidden sm:block' },
  { p: 5, h: 'h-[150px] sm:h-[170px]', w: 'w-[118px] sm:w-[150px]', chip: 'Swap approved', hide: 'hidden md:block' },
];

/** Closing conversion section: serif statement, CTAs and a rising arch of people. */
export const ClosingCTA = ({
  title = (
    <>
      Less back-and-forth.
      <br />
      Every swap signed off.
    </>
  ),
  lead,
}) => {
  const ref = useRef(null);
  const inView = useInViewOnce(ref, { threshold: 0.2 });
  return (
    <section className="relative overflow-hidden bg-sand-200">
      <div className="container-site pt-20 text-center sm:pt-24 lg:pt-28">
        <Reveal>
          <h2 className="type-h2 mx-auto max-w-[22ch]">{title}</h2>
        </Reveal>
        {lead && (
          <Reveal delay={80}>
            <p className="type-lead mx-auto mt-5 max-w-[560px]">{lead}</p>
          </Reveal>
        )}
        <Reveal delay={140}>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/company_register" className="btn btn-primary btn-lg btn-arrow w-full sm:w-auto">
              Create a company account <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link to="/employee_register" className="btn btn-outline btn-lg w-full sm:w-auto">
              Join your company
            </Link>
          </div>
        </Reveal>
      </div>
      <div ref={ref} className="mx-auto mt-14 flex max-w-[1180px] items-end justify-center gap-3 px-4 sm:mt-16 sm:gap-4" aria-hidden="true">
        {ARCH.map((t, i) => {
          const fromCenter = Math.abs(i - 3);
          return (
            <div
              key={i}
              className={`${t.hide || ''} shrink-0 transition-[transform,opacity] duration-[1100ms] ease-out-expo`}
              style={{
                transform: inView ? 'translateY(0)' : 'translateY(70%)',
                opacity: inView ? 1 : 0,
                transitionDelay: `${fromCenter * 90}ms`,
              }}
            >
              <PersonTile person={PEOPLE[t.p]} chip={t.chip} className={`${t.h} ${t.w}`} rounded="rounded-t-[18px]" />
            </div>
          );
        })}
      </div>
    </section>
  );
};
