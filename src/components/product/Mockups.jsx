import React from 'react';
import {
  ArrowLeftRight,
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  Eye,
  FileSpreadsheet,
  Filter,
  Handshake,
  LayoutDashboard,
  Search,
  ShieldCheck,
  Upload,
  UserCheck,
  X,
} from 'lucide-react';
import { Face, PEOPLE } from './People';

/*
 * Product UI compositions. They mirror Shiftswaper's real screens, fields and
 * statuses (pending → offers received → approved / rejected, urgency badges,
 * join requests, employee IDs) with illustrative sample data.
 */

export const person = (id) => PEOPLE.find((p) => p.id === id) || PEOPLE[0];

const STATUS = {
  pending: { label: 'Pending', cls: 'bg-butter-200 text-butter-700' },
  offers_received: { label: 'Offers received', cls: 'bg-lavender-200 text-lavender-700' },
  matched: { label: 'Matched', cls: 'bg-lavender-200 text-lavender-700' },
  approved: { label: 'Approved', cls: 'bg-mint-200 text-mint-700' },
  rejected: { label: 'Rejected', cls: 'bg-rose-200 text-rose-700' },
  awaiting: { label: 'Awaiting approval', cls: 'bg-brand-100 text-brand-700' },
};

export const StatusBadge = ({ status, className = '' }) => {
  const s = STATUS[status] || STATUS.pending;
  return <span className={`chip whitespace-nowrap ${s.cls} ${className}`}>{s.label}</span>;
};

const URGENCY = {
  urgent: { label: 'Urgent', cls: 'border-rose-300 bg-rose-100 text-rose-700' },
  soon: { label: 'Soon', cls: 'border-peach-300 bg-peach-100 text-peach-700' },
  available: { label: 'Available', cls: 'border-mint-300 bg-mint-100 text-mint-700' },
};

export const UrgencyBadge = ({ level = 'available' }) => {
  const u = URGENCY[level];
  return <span className={`chip border ${u.cls}`}>{u.label}</span>;
};

/** Browser-style window chrome around app compositions. */
export const AppFrame = ({ children, url = 'shiftswaper.com/shift_swaps', className = '', bodyClassName = '' }) => (
  <div className={`flex flex-col overflow-hidden rounded-[18px] border border-ink/10 bg-white shadow-float ${className}`}>
    <div className="flex shrink-0 items-center gap-3 border-b border-ink/[0.07] bg-sand-100 px-4 py-2.5">
      <div className="flex gap-1.5" aria-hidden="true">
        <span className="h-2.5 w-2.5 rounded-full bg-[#F1665E]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#F7C548]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#4FC16E]" />
      </div>
      <div className="mx-auto flex h-6 max-w-[320px] flex-1 items-center justify-center rounded-md bg-white px-3 text-[11px] text-ink/45">
        {url}
      </div>
      <div className="w-10" />
    </div>
    <div className={`min-h-0 flex-1 ${bodyClassName}`}>{children}</div>
  </div>
);

export const ShiftRequestCard = ({
  who = 'maya',
  date = 'Thu, Oct 23',
  time = '07:00 – 15:00',
  desired = '15:00 – 23:00',
  reason = 'Family appointment in the morning',
  urgency = 'soon',
  status = 'pending',
  offers = 0,
  compact = false,
  action = true,
  highlight = false,
}) => {
  const p = person(who);
  return (
    <div
      className={`rounded-xl border bg-white transition-shadow duration-300 ${
        highlight ? 'border-brand-300 shadow-lift' : 'border-ink/[0.08] shadow-soft'
      }`}
    >
      <div className="flex items-start justify-between gap-2 p-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <Face person={p} className="h-8 w-8" />
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-ink">{p.name}</p>
            <p className="truncate text-[11px] text-ink/45">{p.role} · Shift swap</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <UrgencyBadge level={urgency} />
          {!compact && <StatusBadge status={status} />}
        </div>
      </div>
      {!compact && (
        <div className="px-3 pb-3">
          <p className="mb-2 line-clamp-1 text-[12px] text-ink/60">{reason}</p>
          <div className="space-y-1 rounded-lg bg-sand-100 p-2.5 text-[11.5px] text-ink/70">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-ink/40" aria-hidden="true" />
              <span className="font-medium text-ink">{date}</span>
              <span>{time}</span>
            </div>
            {desired && (
              <div className="flex items-center gap-1.5">
                <ArrowLeftRight className="h-3 w-3 text-ink/40" aria-hidden="true" />
                <span>Desired {desired}</span>
              </div>
            )}
          </div>
        </div>
      )}
      {action && (
        <div className="flex items-center justify-between border-t border-ink/[0.06] px-3 py-2">
          <span className="text-[11px] text-ink/45">{offers > 0 ? `${offers} offer${offers > 1 ? 's' : ''} received` : 'Posted today'}</span>
          <div className="flex gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-sand-200 px-2.5 py-1 text-[11px] font-semibold text-ink">
              <Eye className="h-3 w-3" aria-hidden="true" /> View
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-500 px-2.5 py-1 text-[11px] font-semibold text-white">
              Make offer
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

/** The Shift Swaps Board, as a full product window. */
export const SwapBoardMock = ({ className = '', dense = false }) => (
  <AppFrame className={className} url="shiftswaper.com/shift_swaps">
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="hidden w-[188px] shrink-0 border-r border-ink/[0.07] bg-sand-50 p-3 md:block" aria-hidden="true">
        <div className="mb-4 flex items-center gap-2 px-1.5 pt-1">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-ink text-white">
            <ArrowLeftRight className="h-3.5 w-3.5" />
          </span>
          <span className="text-[13px] font-extrabold tracking-tight">Shiftswaper</span>
        </div>
        {[
          [LayoutDashboard, 'Dashboard'],
          [Handshake, 'Shift swaps', true],
          [CalendarDays, 'Day-off swaps'],
          [UserCheck, 'My requests'],
        ].map(([Icon, label, active]) => (
          <div
            key={label}
            className={`mb-0.5 flex items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] ${
              active ? 'bg-white font-semibold text-ink shadow-soft' : 'text-ink/55'
            }`}
          >
            <Icon className="h-3.5 w-3.5" /> {label}
          </div>
        ))}
        <div className="mt-6 rounded-xl bg-lavender-200 p-3">
          <p className="text-[11px] font-semibold text-lavender-700">Your supervisor</p>
          <div className="mt-2 flex items-center gap-2">
            <Face person={person('omar')} className="h-6 w-6" />
            <span className="text-[11px] font-medium text-ink">Omar K.</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="min-w-0 flex-1 bg-canvas p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-display text-[19px] leading-tight text-ink sm:text-[22px]">Shift Swaps Board</p>
            <p className="text-[11.5px] text-ink/50">Find shifts to swap with your colleagues</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-ink px-2.5 py-1 text-[11px] font-semibold text-white">Available</span>
            <span className="inline-flex items-center gap-1 rounded-full border border-ink/15 bg-white px-2.5 py-1 text-[11px] font-medium text-ink/70">All</span>
            <span className="hidden items-center gap-1 rounded-full border border-ink/15 bg-white px-2.5 py-1 text-[11px] font-medium text-ink/70 sm:inline-flex">
              Most urgent <ChevronDown className="h-3 w-3" />
            </span>
          </div>
        </div>
        {dense && (
          <div className="mb-4 grid grid-cols-4 gap-3" aria-hidden="true">
            {[
              ['Open requests', '6', 'bg-white text-ink'],
              ['Urgent', '1', 'bg-rose-100 text-rose-700'],
              ['Your offers', '2', 'bg-lavender-100 text-lavender-700'],
              ['Awaiting approval', '1', 'bg-brand-50 text-brand-700'],
            ].map(([label, n, cls]) => (
              <div key={label} className={`rounded-xl border border-ink/[0.06] px-3 py-2.5 ${cls}`}>
                <p className="font-display text-[22px] leading-none">{n}</p>
                <p className="mt-1 text-[11px] opacity-70">{label}</p>
              </div>
            ))}
          </div>
        )}
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-ink/10 bg-white px-3 py-2 text-[12px] text-ink/40">
          <Search className="h-3.5 w-3.5" aria-hidden="true" /> Search by name, email or reason
          <Filter className="ml-auto h-3.5 w-3.5" aria-hidden="true" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <ShiftRequestCard who="maya" urgency="urgent" status="pending" date="Tomorrow" time="07:00 – 15:00" desired="15:00 – 23:00" />
          <ShiftRequestCard who="lina" urgency="soon" status="offers_received" offers={2} date="Thu, Oct 23" time="15:00 – 23:00" desired="07:00 – 15:00" reason="University exam that evening" />
          <div className="hidden lg:block">
            <ShiftRequestCard who="david" urgency="available" status="pending" date="Mon, Oct 27" time="23:00 – 07:00" desired="15:00 – 23:00" reason="Switching to days for a week" />
          </div>
          {dense && (
            <>
              <ShiftRequestCard who="sara" urgency="available" status="pending" date="Wed, Oct 29" time="07:00 – 15:00" desired="11:00 – 19:00" reason="Volunteering in the morning" />
              <ShiftRequestCard who="hana" urgency="soon" status="offers_received" offers={1} date="Fri, Oct 24" time="15:00 – 23:00" desired="07:00 – 15:00" reason="Childcare change this week" />
            </>
          )}
        </div>
      </div>
    </div>
  </AppFrame>
);

/** Two-month calendar pair showing a day-off exchange. */
export const DayOffMock = ({ className = '', swapped = true }) => {
  const days = Array.from({ length: 35 }, (_, i) => i - 2);
  const Cal = ({ title, mark, tone }) => (
    <div className="rounded-xl border border-ink/[0.08] bg-white p-3 shadow-soft">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink/45">{title}</p>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-ink/40">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <span key={i}>{d}</span>
        ))}
        {days.map((d, i) => (
          <span
            key={i}
            className={`flex aspect-square items-center justify-center rounded-md text-[10.5px] transition-colors duration-500 ${
              d < 1 || d > 31 ? 'text-transparent' : d === mark ? `${tone} font-bold` : 'text-ink/70'
            }`}
          >
            {d}
          </span>
        ))}
      </div>
    </div>
  );
  return (
    <div className={`relative grid grid-cols-2 gap-3 ${className}`}>
      <Cal title="Original day off" mark={swapped ? 18 : 18} tone="bg-peach-200 text-peach-700" />
      <Cal title="Requested day off" mark={22} tone="bg-mint-200 text-mint-700" />
      <span className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-ink text-white shadow-lift">
        <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
      </span>
    </div>
  );
};

/** Company view of pending join requests. */
export const JoinRequestsMock = ({ className = '', approvedIndex = -1 }) => {
  const rows = [
    { who: 'sara', id: 'EMP-ACME-EXP-10482', pos: 'Expert' },
    { who: 'nora', id: 'EMP-ACME-SME-20931', pos: 'SME' },
    { who: 'karim', id: 'EMP-ACME-SUP-31877', pos: 'Supervisor' },
  ];
  return (
    <div className={`rounded-2xl border border-ink/[0.08] bg-white p-4 shadow-lift ${className}`}>
      <div className="mb-3 flex items-center justify-between">
        <p className="font-display text-[17px] text-ink">Join requests</p>
        <span className="chip bg-butter-200 text-butter-700">3 pending</span>
      </div>
      <ul className="space-y-2">
        {rows.map((r, i) => {
          const p = person(r.who);
          const approved = i === approvedIndex;
          return (
            <li key={r.id} className="flex items-center gap-2.5 rounded-xl bg-sand-100 p-2.5">
              <Face person={p} className="h-8 w-8" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-semibold text-ink">{p.name}</p>
                <p className="truncate font-mono text-[10.5px] text-ink/45">
                  {r.id} · {r.pos}
                </p>
              </div>
              <span
                className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all duration-500 ${
                  approved ? 'bg-mint-200 text-mint-700' : 'bg-brand-500 text-white'
                }`}
              >
                {approved ? (
                  <>
                    <Check className="h-3 w-3" aria-hidden="true" /> Approved
                  </>
                ) : (
                  'Review'
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

/** Employee ID whitelist with spreadsheet import. */
export const EmployeeIdsMock = ({ className = '', progress = 1 }) => (
  <div className={`rounded-2xl border border-ink/[0.08] bg-white p-4 shadow-lift ${className}`}>
    <div className="mb-3 flex items-center justify-between gap-2">
      <p className="font-display text-[17px] text-ink">Employee IDs</p>
      <span className="inline-flex items-center gap-1 rounded-full bg-ink px-2.5 py-1 text-[11px] font-semibold text-white">
        <Upload className="h-3 w-3" aria-hidden="true" /> Import
      </span>
    </div>
    <div className="mb-3 flex items-center gap-2.5 rounded-xl border border-dashed border-brand-300 bg-brand-50 p-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-mint-200 text-mint-700">
        <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] font-semibold text-ink">team-roster.xlsx</p>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white">
          <div className="h-full origin-left rounded-full bg-brand-500 transition-transform duration-700 ease-out-expo" style={{ transform: `scaleX(${progress})` }} />
        </div>
      </div>
      <span className="text-[11px] font-semibold text-ink/50">{Math.round(progress * 48)} IDs</span>
    </div>
    <div className="overflow-hidden rounded-xl border border-ink/[0.07]">
      <div className="grid grid-cols-[1.4fr_1fr_0.8fr] bg-sand-100 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink/45">
        <span>Employee ID</span>
        <span>Name</span>
        <span>Position</span>
      </div>
      {[
        ['EMP-ACME-EXP-10482', 'Sara A.', 'Expert'],
        ['EMP-ACME-SUP-31877', 'Karim H.', 'Supervisor'],
        ['EMP-ACME-SME-20931', 'Nora T.', 'SME'],
      ].map(([id, n, pos]) => (
        <div key={id} className="grid grid-cols-[1.4fr_1fr_0.8fr] border-t border-ink/[0.06] px-3 py-2 text-[11px]">
          <span className="truncate font-mono text-ink/70">{id}</span>
          <span className="truncate text-ink">{n}</span>
          <span className="truncate text-ink/60">{pos}</span>
        </div>
      ))}
    </div>
  </div>
);

/** Moderator's read-only audit list. */
export const AuditMock = ({ className = '' }) => (
  <div className={`rounded-2xl border border-ink/[0.08] bg-white p-4 shadow-lift ${className}`}>
    <div className="mb-3 flex items-center justify-between">
      <p className="font-display text-[17px] text-ink">All decisions</p>
      <span className="chip bg-sand-200 text-ink/70">
        <ShieldCheck className="h-3 w-3" aria-hidden="true" /> Read-only
      </span>
    </div>
    <ul className="divide-y divide-ink/[0.06]">
      {[
        ['maya', 'lina', 'Shift swap', 'approved'],
        ['david', 'sara', 'Day-off swap', 'approved'],
        ['nora', 'ali', 'Shift swap', 'rejected'],
      ].map(([a, b, kind, status]) => (
        <li key={a + b} className="flex items-center gap-2 py-2">
          <div className="flex -space-x-2">
            <Face person={person(a)} className="h-7 w-7" />
            <Face person={person(b)} className="h-7 w-7" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-semibold text-ink">
              {person(a).name.split(' ')[0]} ↔ {person(b).name.split(' ')[0]}
            </p>
            <p className="text-[10.5px] text-ink/45">{kind}</p>
          </div>
          <StatusBadge status={status} />
        </li>
      ))}
    </ul>
  </div>
);

/** A transactional email preview (Shiftswaper sends these on key events). */
export const EmailMock = ({ className = '', title = 'Your swap request was approved', tone = 'mint' }) => (
  <div className={`flex items-start gap-3 rounded-2xl border border-ink/[0.08] bg-white p-3 shadow-float ${className}`}>
    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone === 'mint' ? 'bg-mint-200 text-mint-700' : 'bg-brand-100 text-brand-700'}`}>
      <Check className="h-4 w-4" aria-hidden="true" />
    </span>
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-ink/40">Email · Shiftswaper</p>
      <p className="truncate text-[13px] font-semibold text-ink">{title}</p>
    </div>
  </div>
);

/** Supervisor decision card (static state). */
export const ApprovalCard = ({ className = '', decided = null }) => (
  <div className={`rounded-2xl border border-ink/[0.08] bg-white p-4 shadow-lift ${className}`}>
    <div className="mb-3 flex items-center justify-between gap-2">
      <p className="font-display text-[17px] text-ink">
        {decided === 'approved' ? 'Swap approved' : decided === 'rejected' ? 'Swap rejected' : 'Swap awaiting approval'}
      </p>
      <StatusBadge status={decided || 'awaiting'} />
    </div>
    <div className="flex items-center gap-3 rounded-xl bg-sand-100 p-3">
      <div className="flex flex-1 items-center gap-2">
        <Face person={person('maya')} className="h-9 w-9" />
        <div className="min-w-0">
          <p className="truncate text-[12px] font-semibold">Maya R.</p>
          <p className="whitespace-nowrap text-[10.5px] text-ink/50">07:00 – 15:00</p>
        </div>
      </div>
      <ArrowLeftRight className="h-4 w-4 shrink-0 text-brand-500" aria-hidden="true" />
      <div className="flex flex-1 items-center justify-end gap-2 text-right">
        <div className="min-w-0">
          <p className="truncate text-[12px] font-semibold">Lina S.</p>
          <p className="whitespace-nowrap text-[10.5px] text-ink/50">15:00 – 23:00</p>
        </div>
        <Face person={person('lina')} className="h-9 w-9" />
      </div>
    </div>
    <div className="mt-3 flex gap-2">
      <span
        className={`inline-flex flex-1 items-center justify-center gap-1 rounded-full py-2 text-[12px] font-semibold transition-all duration-300 ${
          decided === 'approved' ? 'bg-mint-500 text-white' : 'bg-ink text-white'
        }`}
      >
        <Check className="h-3.5 w-3.5" aria-hidden="true" /> {decided === 'approved' ? 'Approved' : 'Approve'}
      </span>
      <span className="inline-flex flex-1 items-center justify-center gap-1 rounded-full border border-ink/15 py-2 text-[12px] font-semibold text-ink/70">
        <X className="h-3.5 w-3.5" aria-hidden="true" /> Reject
      </span>
    </div>
  </div>
);

/** A phone frame for mobile compositions. */
export const PhoneFrame = ({ children, className = '' }) => (
  <div className={`relative rounded-[34px] border-[7px] border-ink bg-ink shadow-float ${className}`}>
    <div className="absolute left-1/2 top-1.5 z-10 h-4 w-20 -translate-x-1/2 rounded-full bg-ink" aria-hidden="true" />
    <div className="h-full overflow-hidden rounded-[27px] bg-canvas">{children}</div>
  </div>
);

/** Employee home on a phone. */
export const PhoneDashboardMock = () => {
  const p = person('maya');
  return (
    <div className="flex h-full flex-col px-3.5 pb-4 pt-8 text-ink">
      <div className="mb-4 flex items-center gap-2">
        <Face person={p} className="h-9 w-9" />
        <div>
          <p className="text-[10px] text-ink/45">Good morning</p>
          <p className="text-[13px] font-bold">Maya R.</p>
        </div>
      </div>
      <div className="mb-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-brand-100 p-2.5">
          <p className="text-[18px] font-bold text-brand-700">2</p>
          <p className="text-[9.5px] text-brand-700/80">Offers received</p>
        </div>
        <div className="rounded-xl bg-mint-200 p-2.5">
          <p className="text-[18px] font-bold text-mint-700">1</p>
          <p className="text-[9.5px] text-mint-700/80">Approved swap</p>
        </div>
      </div>
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink/40">My requests</p>
      <div className="space-y-2">
        {[
          ['Shift · Thu', 'offers_received'],
          ['Day off · Sat', 'pending'],
          ['Shift · Mon', 'approved'],
        ].map(([t, s]) => (
          <div key={t} className="flex items-center justify-between gap-2 rounded-xl bg-white p-2.5 shadow-soft">
            <span className="truncate text-[11px] font-medium">{t}</span>
            <StatusBadge status={s} className="shrink-0 whitespace-nowrap !px-2 !py-0.5 !text-[9.5px]" />
          </div>
        ))}
      </div>
      <div className="mt-auto rounded-full bg-brand-500 py-2 text-center text-[11px] font-semibold text-white">New request</div>
    </div>
  );
};
