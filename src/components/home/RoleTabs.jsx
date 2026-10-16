import React, { useState } from 'react';
import { Clock } from 'lucide-react';
import { Reveal } from '../../motion';
import { Face } from '../product/People';
import {
  ApprovalCard,
  AuditMock,
  EmailMock,
  EmployeeIdsMock,
  JoinRequestsMock,
  person,
  PhoneDashboardMock,
  PhoneFrame,
  ShiftRequestCard,
} from '../product/Mockups';

const Priority = () => (
  <div className="w-full max-w-[300px] rounded-2xl border border-ink/[0.08] bg-white p-3 shadow-lift">
    <p className="mb-2 px-1 font-display text-[16px] text-ink">Needs your decision</p>
    {[
      ['maya', 'Starts in 18h', 'Critical', 'bg-rose-200 text-rose-700'],
      ['lina', 'Starts in 40h', 'High', 'bg-peach-200 text-peach-700'],
      ['david', 'Starts in 5 days', 'Normal', 'bg-sand-200 text-ink/70'],
    ].map(([who, when, label, cls]) => (
      <div key={who} className="flex items-center gap-2.5 rounded-xl px-1.5 py-2">
        <Face person={person(who)} className="h-7 w-7" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-semibold text-ink">{person(who).name}</p>
          <p className="flex items-center gap-1 text-[10.5px] text-ink/50">
            <Clock className="h-3 w-3" aria-hidden="true" /> {when}
          </p>
        </div>
        <span className={`chip ${cls}`}>{label}</span>
      </div>
    ))}
  </div>
);

const ROLES = {
  company: {
    label: 'Company',
    cards: [
      {
        title: 'Decide who joins',
        body: 'Approve or reject every join request, and assign a supervisor as you approve.',
        tone: 'bg-mint-200',
        visual: <JoinRequestsMock className="w-[300px] origin-top scale-[0.92]" approvedIndex={0} />,
      },
      {
        title: 'Keep the roster tidy',
        body: 'Maintain your employee-ID whitelist — add, auto-generate or import IDs in bulk.',
        tone: 'bg-brand-100',
        visual: <EmployeeIdsMock className="w-[320px] origin-top scale-[0.88]" />,
      },
      {
        title: 'Add an extra pair of eyes',
        body: 'Moderators get a read-only view of every approved and rejected swap.',
        tone: 'bg-lavender-200',
        visual: <AuditMock className="w-[300px] origin-top scale-[0.92]" />,
      },
    ],
  },
  supervisor: {
    label: 'Supervisor',
    cards: [
      {
        title: 'Approve with context',
        body: 'See both employees and both shifts side by side before you approve or reject.',
        tone: 'bg-butter-200',
        visual: <ApprovalCard className="w-[310px] origin-top scale-[0.92]" />,
      },
      {
        title: 'Focus on what’s due',
        body: 'Pending swaps are flagged Critical, High or Normal by how soon the shift starts.',
        tone: 'bg-rose-200',
        visual: <Priority />,
      },
      {
        title: 'Keep everyone informed',
        body: 'Your decision is emailed to both employees, so nobody has to ask twice.',
        tone: 'bg-mint-200',
        visual: (
          <div className="w-[280px] space-y-2.5">
            <EmailMock title="Swap approved — Maya" />
            <div className="translate-x-5">
              <EmailMock title="Swap approved — Lina" />
            </div>
          </div>
        ),
      },
    ],
  },
  employee: {
    label: 'Employee',
    cards: [
      {
        title: 'Ask once',
        body: 'Post a shift or day-off swap with your reason and the shift you’d prefer.',
        tone: 'bg-lavender-200',
        visual: <ShiftRequestCard who="maya" urgency="soon" action={false} />,
      },
      {
        title: 'Lend a hand',
        body: 'Browse colleagues’ requests and offer an alternative time on the same day.',
        tone: 'bg-peach-200',
        visual: <ShiftRequestCard who="lina" urgency="available" compact date="Thu, Oct 23" />,
      },
      {
        title: 'Know where it stands',
        body: 'Follow each request from pending to approved on your own dashboard.',
        tone: 'bg-brand-100',
        visual: (
          <PhoneFrame className="h-[300px] w-[170px] translate-y-10">
            <PhoneDashboardMock />
          </PhoneFrame>
        ),
      },
    ],
  },
};

const ORDER = ['company', 'supervisor', 'employee'];

const RoleTabs = () => {
  const [role, setRole] = useState('company');

  const onKeyDown = (e) => {
    const i = ORDER.indexOf(role);
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const next = ORDER[(i + (e.key === 'ArrowRight' ? 1 : -1) + ORDER.length) % ORDER.length];
      setRole(next);
      document.getElementById(`role-tab-${next}`)?.focus();
    }
  };

  return (
    <section id="roles" className="bg-canvas py-24 lg:py-32" aria-labelledby="roles-title">
      <div className="container-site">
        <Reveal>
          <h2 id="roles-title" className="type-h2 mx-auto max-w-[24ch] text-center">
            Clear roles, calm handoffs, for everyone involved
          </h2>
        </Reveal>
        <Reveal delay={80}>
          <div role="tablist" aria-label="Roles" onKeyDown={onKeyDown} className="mt-8 flex justify-center gap-1.5 sm:gap-2.5">
            {ORDER.map((r) => (
              <button
                key={r}
                id={`role-tab-${r}`}
                type="button"
                role="tab"
                aria-selected={role === r}
                aria-controls="role-panel"
                tabIndex={role === r ? 0 : -1}
                onClick={() => setRole(r)}
                className="seg-tab"
              >
                {ROLES[r].label}
              </button>
            ))}
          </div>
        </Reveal>

        <div id="role-panel" role="tabpanel" aria-labelledby={`role-tab-${role}`} className="mt-12 grid gap-8 md:grid-cols-3 md:gap-6 lg:gap-8">
          {ROLES[role].cards.map((c, i) => (
            <article key={`${role}-${c.title}`} className="min-w-0 animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className={`relative flex aspect-[409/320] items-start justify-center overflow-hidden rounded-2xl pt-8 ${c.tone}`} aria-hidden="true">
                <span className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/40 blur-2xl" />
                <div className="relative origin-top scale-[0.84] px-4 min-[400px]:scale-100">{c.visual}</div>
              </div>
              <h3 className="mt-6 px-1 font-display text-[clamp(1.4rem,1.2rem+0.5vw,1.75rem)] text-ink lg:px-4">{c.title}</h3>
              <p className="mt-2 px-1 text-[15px] leading-relaxed text-ink/55 lg:px-4">{c.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoleTabs;
