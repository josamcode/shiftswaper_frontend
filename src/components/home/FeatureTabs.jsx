import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BellRing,
  CalendarDays,
  Check,
  FileSpreadsheet,
  Handshake,
  UserCheck,
} from 'lucide-react';
import { Reveal, useInView, useReducedMotion } from '../../motion';
import { DayOffMock, EmailMock, EmployeeIdsMock, JoinRequestsMock, ShiftRequestCard } from '../product/Mockups';

const INTERVAL = 8000;

const TABS = [
  {
    id: 'shift',
    label: 'Shift swaps',
    icon: Handshake,
    title: 'Post it once. Let the right colleague pick it up.',
    body: 'Requests land on a shared board for colleagues in the same position, sorted by urgency, with search, filters and date ranges.',
    points: ['Urgent, Soon and Available badges at a glance', 'Desired shift and optional overtime on every request', 'Edit or withdraw a request until offers arrive'],
    link: '/features#shift-swaps',
    tone: 'bg-lavender-200',
    visual: () => (
      <div className="relative w-full max-w-[380px] space-y-3">
        <ShiftRequestCard who="maya" urgency="urgent" date="Tomorrow" time="07:00 – 15:00" desired="15:00 – 23:00" />
        <div className="translate-x-6 opacity-90">
          <ShiftRequestCard who="david" urgency="available" date="Mon, Oct 27" time="23:00 – 07:00" desired="15:00 – 23:00" compact />
        </div>
      </div>
    ),
  },
  {
    id: 'dayoff',
    label: 'Day-off swaps',
    icon: CalendarDays,
    title: 'Trade a day off for the day you actually need.',
    body: 'Offer your scheduled day off in exchange for another date. Colleagues propose matches, you accept one, and a supervisor approves.',
    points: ['Filter by the original or the requested date', 'Shift details attached to the requested day', 'The same approval trail as shift swaps'],
    link: '/features#day-off-swaps',
    tone: 'bg-peach-200',
    visual: () => <DayOffMock className="w-full max-w-[400px]" />,
  },
  {
    id: 'join',
    label: 'Join requests',
    icon: UserCheck,
    title: 'Only the right people get in.',
    body: 'Employees ask to join your company using an employee ID you’ve approved in advance. You review each request, assign a supervisor and approve — or reject with a reason.',
    points: ['Search and filter by status and position', 'Moderators can be approved without a supervisor', 'Rejected employees see your reason when they sign in'],
    link: '/features#join-requests',
    tone: 'bg-mint-200',
    visual: (active) => <JoinRequestsMock className="w-full max-w-[380px]" approvedIndex={active ? 0 : -1} />,
  },
  {
    id: 'ids',
    label: 'Employee IDs',
    icon: FileSpreadsheet,
    title: 'Bring your whole roster in at once.',
    body: 'Keep a whitelist of employee IDs. Add people one at a time with auto-generated IDs, or import a spreadsheet in one go.',
    points: ['.xlsx, .xls and .csv files up to 10 MB', 'Columns for employee ID, name and position', 'Duplicate and invalid rows reported line by line'],
    link: '/features#employee-ids',
    tone: 'bg-brand-100',
    visual: (active) => <EmployeeIdsMock className="w-full max-w-[400px]" progress={active ? 1 : 0.15} />,
  },
  {
    id: 'notify',
    label: 'Notifications',
    icon: BellRing,
    title: 'Everyone hears about what matters.',
    body: 'Shiftswaper emails people at the moments that need attention — a new offer, an accepted offer, and the supervisor’s final decision.',
    points: ['Clear, branded HTML emails', 'Supervisors receive a copy of every decision', 'One-time codes for sign-up and password reset'],
    link: '/features#notifications',
    tone: 'bg-butter-200',
    visual: () => (
      <div className="w-full max-w-[340px] space-y-3">
        <EmailMock title="New offer on your request" tone="brand" />
        <div className="translate-x-6">
          <EmailMock title="Your offer was accepted" tone="brand" />
        </div>
        <EmailMock title="Your swap request was approved" />
      </div>
    ),
  },
];

const FeatureTabs = () => {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [userPicked, setUserPicked] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { threshold: 0.25 });
  const reduced = useReducedMotion();
  const running = inView && !paused && !userPicked && !reduced;

  useEffect(() => {
    if (!running) return undefined;
    const t = setTimeout(() => setActive((a) => (a + 1) % TABS.length), INTERVAL);
    return () => clearTimeout(t);
  }, [running, active]);

  const pick = (i) => {
    setUserPicked(true);
    setActive((i + TABS.length) % TABS.length);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      pick(active + 1);
      document.getElementById(`ftab-${TABS[(active + 1) % TABS.length].id}`)?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      pick(active - 1);
      document.getElementById(`ftab-${TABS[(active - 1 + TABS.length) % TABS.length].id}`)?.focus();
    }
  };

  return (
    <section ref={ref} id="features" className="bg-canvas pt-24 lg:pt-32" aria-labelledby="features-title">
      <div className="container-site">
        <Reveal>
          <h2 id="features-title" className="type-h2 max-w-[22ch]">
            One workspace for every change to the rota
          </h2>
        </Reveal>

        <div className="mt-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <Reveal delay={80} className="min-w-0">
            <div
              role="tablist"
              aria-label="Product areas"
              onKeyDown={onKeyDown}
              className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
            >
              {TABS.map((t, i) => (
                <button
                  key={t.id}
                  id={`ftab-${t.id}`}
                  role="tab"
                  type="button"
                  aria-selected={i === active}
                  aria-controls={`fpanel-${t.id}`}
                  tabIndex={i === active ? 0 : -1}
                  onClick={() => pick(i)}
                  className="pill-tab shrink-0"
                >
                  <t.icon className="h-4 w-4" aria-hidden="true" />
                  {t.label}
                </button>
              ))}
            </div>
            {/* Progress track */}
            <div className="mt-5 hidden h-0.5 w-full max-w-[420px] gap-1 sm:flex" aria-hidden="true">
              {TABS.map((t, i) => (
                <span key={t.id} className="relative h-full flex-1 overflow-hidden rounded-full bg-ink/10">
                  {i < active && <span className="absolute inset-0 bg-ink" />}
                  {i === active && (
                    <span
                      key={`${active}-${running}`}
                      className="absolute inset-0 origin-left bg-ink"
                      style={
                        running
                          ? { animation: `tab-progress ${INTERVAL}ms linear both` }
                          : { transform: 'scaleX(1)' }
                      }
                    />
                  )}
                </span>
              ))}
            </div>
          </Reveal>
          <div className="hidden gap-2 lg:flex">
            <button type="button" onClick={() => pick(active - 1)} className="flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5" aria-label="Previous feature">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => pick(active + 1)} className="flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5" aria-label="Next feature">
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Full-bleed panel */}
      <div
        className="relative mt-8 overflow-hidden bg-ink text-white"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-brand-500/20 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-48 left-1/4 h-[420px] w-[420px] rounded-full bg-lavender-500/20 blur-3xl" />
        <div className="container-site relative grid">
          {TABS.map((t, i) => {
            const on = i === active;
            return (
              <div
                key={t.id}
                id={`fpanel-${t.id}`}
                role="tabpanel"
                aria-labelledby={`ftab-${t.id}`}
                aria-hidden={!on}
                className={`col-start-1 row-start-1 grid items-center gap-10 py-14 transition-opacity duration-500 ease-out lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:gap-16 lg:py-20 ${
                  on ? 'visible opacity-100' : 'invisible opacity-0'
                }`}
              >
                <div className={`transition-transform duration-700 ease-out-expo ${on ? 'translate-y-0' : 'translate-y-4'}`}>
                  <span className="chip bg-white/10 text-white/80">
                    <t.icon className="h-3.5 w-3.5" aria-hidden="true" /> {t.label}
                  </span>
                  <h3 className="mt-5 max-w-[18ch] font-display text-[clamp(1.85rem,1.3rem+1.6vw,2.75rem)] leading-[1.15] text-white">{t.title}</h3>
                  <p className="mt-4 max-w-[520px] text-[16px] leading-relaxed text-white/70 sm:text-[17px]">{t.body}</p>
                  <ul className="mt-6 space-y-2.5">
                    {t.points.map((pt) => (
                      <li key={pt} className="flex items-start gap-2.5 text-[15px] text-white/85">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10">
                          <Check className="h-3 w-3 text-mint-300" aria-hidden="true" />
                        </span>
                        {pt}
                      </li>
                    ))}
                  </ul>
                  <Link to={t.link} className="mt-7 inline-flex items-center gap-1.5 font-semibold text-brand-300 transition-colors hover:text-white" tabIndex={on ? 0 : -1}>
                    Explore {t.label.toLowerCase()} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
                <div
                  className={`relative flex min-h-[340px] items-center justify-center overflow-hidden rounded-[28px] p-6 transition-[transform,opacity] duration-700 ease-out-expo sm:min-h-[400px] sm:p-10 ${t.tone} ${
                    on ? 'scale-100' : 'scale-[0.97]'
                  }`}
                  aria-hidden="true"
                >
                  <span className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/40 blur-2xl" />
                  <div className="relative flex w-full justify-center">{t.visual(on)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeatureTabs;
