import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftRight,
  ArrowRight,
  BadgeCheck,
  BellRing,
  CalendarDays,
  Check,
  FileSpreadsheet,
  Fingerprint,
  Handshake,
  KeyRound,
  LockKeyhole,
  MailCheck,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';
import { Reveal, useInView } from '../motion';
import { ClosingCTA, PageHero } from '../components/marketing/Sections';
import { DayOffMock, EmailMock, EmployeeIdsMock, JoinRequestsMock, ShiftRequestCard } from '../components/product/Mockups';
import { ApprovalVignette, OffersVignette } from '../components/product/Vignettes';

const NAV = [
  ['shift-swaps', 'Shift swaps'],
  ['counter-offers', 'Counter-offers'],
  ['day-off-swaps', 'Day-off swaps'],
  ['approvals', 'Approvals'],
  ['join-requests', 'Join requests'],
  ['employee-ids', 'Employee IDs'],
  ['roles', 'Roles'],
  ['notifications', 'Notifications'],
  ['security', 'Security'],
];

const FEATURES = [
  {
    id: 'shift-swaps',
    icon: Handshake,
    label: 'Shift swaps',
    title: 'A shared board for every shift that needs a swap',
    body: 'Employees post the shift they need to change — date and time, a reason, the shift they’d prefer and any overtime. Colleagues in the same position see it on their board right away.',
    points: [
      'Urgent (within 24 hours), Soon (within 48 hours) and Available badges',
      'Search by name, email or reason, filter by date range, sort by urgency',
      'Edit or withdraw a request until offers start arriving',
    ],
    tone: 'linear-gradient(140deg, #EDEAFB, #DCEEFF)',
    visual: () => (
      <div className="w-full max-w-[400px] space-y-3">
        <ShiftRequestCard who="maya" urgency="urgent" date="Tomorrow" time="07:00 – 15:00" desired="15:00 – 23:00" />
        <div className="sm:translate-x-8">
          <ShiftRequestCard who="lina" urgency="soon" status="offers_received" offers={2} date="Thu, Oct 23" time="15:00 – 23:00" desired="07:00 – 15:00" reason="University exam that evening" />
        </div>
      </div>
    ),
  },
  {
    id: 'counter-offers',
    icon: ArrowLeftRight,
    label: 'Counter-offers',
    title: 'Colleagues offer what actually works for them',
    body: 'Instead of a simple yes or no, teammates propose an alternative time on the same day. The requester compares offers side by side and accepts the best one — the rest are declined automatically.',
    points: ['Offers stay on the same calendar day as the original shift', 'An email arrives with every new offer', 'Accepting one offer closes the others in one step'],
    tone: 'linear-gradient(140deg, #FDEBDF, #FCE7EA)',
    visual: (active) => <OffersVignette active={active} />,
  },
  {
    id: 'day-off-swaps',
    icon: CalendarDays,
    label: 'Day-off swaps',
    title: 'Trade a day off for the one you really need',
    body: 'Post your scheduled day off together with the day you’d like instead. Colleagues propose matches, you accept the one that fits, and a supervisor approves the change.',
    points: ['Filter the board by original date, requested date or either', 'Shift details are attached to the requested day', 'Same approval and notification trail as shift swaps'],
    tone: 'linear-gradient(140deg, #E2F4EE, #DCEEFF)',
    visual: () => <DayOffMock className="w-full max-w-[420px]" />,
  },
  {
    id: 'approvals',
    icon: BadgeCheck,
    label: 'Supervisor approval',
    title: 'Nothing changes until a supervisor signs off',
    body: 'Once both employees agree, the swap goes to their supervisors. Either supervisor involved can approve or reject it, and both employees are told the outcome by email.',
    points: ['Both shifts shown side by side before deciding', 'Pending swaps prioritised by how soon the shift starts', 'Decisions are kept on record for moderators to review'],
    tone: 'linear-gradient(140deg, #FCF3D7, #E2F4EE)',
    visual: (active) => <ApprovalVignette active={active} />,
  },
  {
    id: 'join-requests',
    icon: UserCheck,
    label: 'Join requests',
    title: 'You decide who joins your company',
    body: 'Employees choose your company and enter an employee ID you’ve already approved. You review each request, assign their supervisor and approve — or reject it with a reason they’ll see when they sign in.',
    points: ['Search and filter requests by status and position', 'Moderators can be approved without a supervisor', 'Employees confirm their email with a one-time code'],
    tone: 'linear-gradient(140deg, #E2F4EE, #F7F4F1)',
    visual: (active) => <JoinRequestsMock className="w-full max-w-[400px]" approvedIndex={active ? 0 : -1} />,
  },
  {
    id: 'employee-ids',
    icon: FileSpreadsheet,
    label: 'Employee IDs & import',
    title: 'Load your whole roster from a spreadsheet',
    body: 'Keep a whitelist of employee IDs so only real team members can register. Add IDs one at a time — with an auto-generate option — or upload a file.',
    points: ['Excel (.xlsx, .xls) and CSV files up to 10 MB', 'Columns for employee ID, name and position', 'Duplicates and invalid rows reported line by line'],
    tone: 'linear-gradient(140deg, #DCEEFF, #EDEAFB)',
    visual: (active) => <EmployeeIdsMock className="w-full max-w-[420px]" progress={active ? 1 : 0.12} />,
  },
];

const ROLES = [
  {
    role: 'Company',
    tone: 'bg-mint-200 text-mint-700',
    can: ['Register and verify the company by email', 'Manage the employee-ID whitelist and imports', 'Approve join requests and assign supervisors'],
  },
  {
    role: 'Supervisor',
    tone: 'bg-butter-200 text-butter-700',
    can: ['Approve or reject swaps they’re responsible for', 'See pending swaps ranked by urgency', 'Post their own swap requests'],
  },
  {
    role: 'Expert & SME',
    tone: 'bg-lavender-200 text-lavender-700',
    can: ['Post shift and day-off swap requests', 'Browse requests from colleagues in the same position', 'Send offers and accept the one that works'],
  },
  {
    role: 'Moderator',
    tone: 'bg-brand-100 text-brand-700',
    can: ['Read-only view of approved and rejected swaps', 'Search and filter across the company', 'No ability to change requests'],
  },
];

const SECURITY = [
  { icon: LockKeyhole, title: 'Hashed passwords', body: 'Passwords are hashed with bcrypt before they’re stored — never kept in plain text.' },
  { icon: Fingerprint, title: 'Signed sessions', body: 'Every signed-in request carries a signed token that expires after 24 hours.' },
  { icon: MailCheck, title: 'Verified emails', body: 'Companies and employees confirm their email address with a 6-digit code.' },
  { icon: KeyRound, title: 'Brute-force limits', body: 'Codes have a resend cooldown, and repeated wrong attempts lock verification for 30 minutes.' },
];

const FeatureRow = ({ f, i }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { rootMargin: '-10% 0px -10% 0px' });
  const flip = i % 2 === 1;
  return (
    <section id={f.id} className="scroll-mt-32 py-14 lg:py-20" aria-labelledby={`${f.id}-title`}>
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
        <Reveal className={`min-w-0 ${flip ? 'lg:order-2' : ''}`}>
          <span className="chip bg-white text-ink/70 shadow-soft">
            <f.icon className="h-3.5 w-3.5" aria-hidden="true" /> {f.label}
          </span>
          <h2 id={`${f.id}-title`} className="type-h3 mt-5 max-w-[18ch]">
            {f.title}
          </h2>
          <p className="mt-4 max-w-[540px] text-[17px] leading-relaxed text-ink/60">{f.body}</p>
          <ul className="mt-6 space-y-3">
            {f.points.map((pt) => (
              <li key={pt} className="flex items-start gap-3 text-[15px] text-ink/75">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mint-200 text-mint-700">
                  <Check className="h-3 w-3" aria-hidden="true" />
                </span>
                {pt}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={100} className={`min-w-0 ${flip ? 'lg:order-1' : ''}`}>
          <div
            ref={ref}
            className="relative flex min-h-[380px] items-center justify-center overflow-hidden rounded-[32px] p-6 sm:min-h-[460px] sm:p-12"
            style={{ background: f.tone }}
            aria-hidden="true"
          >
            <span className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/35 blur-2xl" />
            <span className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-white/30 blur-2xl" />
            <div className="relative flex w-full justify-center">{f.visual(inView)}</div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

const Features = () => {
  return (
    <div className="bg-canvas">
      <PageHero
        eyebrow="Features"
        title="Everything a fair shift swap needs"
        lead="From the first join request to the final supervisor decision, Shiftswaper keeps every swap in one clear, approved flow."
      />

      <nav aria-label="Feature sections" className="sticky top-[70px] z-30 border-y border-ink/[0.06] bg-canvas/90 backdrop-blur">
        <div className="no-scrollbar container-site flex gap-2 overflow-x-auto py-3">
          {NAV.map(([id, label]) => (
            <Link key={id} to={`#${id}`} className="shrink-0 rounded-full bg-white px-3.5 py-1.5 text-sm text-ink/70 shadow-soft transition-colors hover:bg-ink hover:text-white">
              {label}
            </Link>
          ))}
        </div>
      </nav>

      <div className="container-site pt-6">
        {FEATURES.map((f, i) => (
          <FeatureRow key={f.id} f={f} i={i} />
        ))}
      </div>

      {/* Roles */}
      <section id="roles" className="scroll-mt-32 bg-sand-100 py-20 lg:py-28" aria-labelledby="roles-title">
        <div className="container-site">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <Reveal>
              <span className="chip bg-white text-ink/70 shadow-soft">
                <Users className="h-3.5 w-3.5" aria-hidden="true" /> Roles & visibility
              </span>
              <h2 id="roles-title" className="type-h3 mt-5 max-w-[16ch]">
                Everyone sees exactly what they need
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <p className="max-w-[560px] text-[17px] leading-relaxed text-ink/60 lg:justify-self-end">
                Employees only see requests from colleagues in the same position, supervisors see the swaps that need their decision, and companies stay in charge of who’s on the team.
              </p>
            </Reveal>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ROLES.map((r, i) => (
              <Reveal key={r.role} delay={i * 70} className="surface p-6">
                <span className={`chip ${r.tone}`}>{r.role}</span>
                <ul className="mt-5 space-y-3">
                  {r.can.map((c) => (
                    <li key={c} className="flex items-start gap-2.5 text-[15px] leading-snug text-ink/75">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-ink/40" aria-hidden="true" />
                      {c}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Notifications */}
      <div className="container-site">
        <section id="notifications" className="scroll-mt-32 py-20 lg:py-28" aria-labelledby="notifications-title">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
            <Reveal className="min-w-0">
              <span className="chip bg-white text-ink/70 shadow-soft">
                <BellRing className="h-3.5 w-3.5" aria-hidden="true" /> Email notifications
              </span>
              <h2 id="notifications-title" className="type-h3 mt-5 max-w-[18ch]">
                The right email at the moment it matters
              </h2>
              <p className="mt-4 max-w-[540px] text-[17px] leading-relaxed text-ink/60">
                Shiftswaper sends clear, branded emails when someone needs to know: a new offer on your request, your offer being accepted, and the supervisor’s final decision — plus one-time codes for sign-up and password resets.
              </p>
            </Reveal>
            <Reveal delay={100} className="min-w-0">
              <div className="relative flex min-h-[380px] items-center justify-center overflow-hidden rounded-[32px] bg-butter-200 p-8" aria-hidden="true">
                <span className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/40 blur-2xl" />
                <div className="relative w-full max-w-[360px] space-y-3">
                  <EmailMock title="New offer on your request" tone="brand" />
                  <div className="sm:translate-x-8">
                    <EmailMock title="Your offer was accepted" tone="brand" />
                  </div>
                  <EmailMock title="Your swap request was approved" />
                  <div className="sm:translate-x-8">
                    <EmailMock title="Your verification code" tone="brand" />
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </div>

      {/* Security */}
      <section id="security" className="scroll-mt-32 pb-24 lg:pb-32" aria-labelledby="security-title">
        <div className="container-site">
          <Reveal>
            <span className="chip bg-white text-ink/70 shadow-soft">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Security
            </span>
            <h2 id="security-title" className="type-h3 mt-5 max-w-[20ch]">
              Sensible protection, built in from the start
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {SECURITY.map((s, i) => (
              <Reveal key={s.title} delay={i * 70} className="card-sand flex flex-col p-7">
                <span className="icon-tile">
                  <s.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-10 font-display text-[24px] leading-tight text-ink">{s.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink/55">{s.body}</p>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-12">
            <Link to="/how_it_works" className="link-arrow text-[16px]">
              See the full workflow <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </section>

      <ClosingCTA
        title={
          <>
            Ready to retire the
            <br />
            swap group chat?
          </>
        }
        lead="Create your company account, import your employee IDs and invite your team to join."
      />
    </div>
  );
};

export default Features;
