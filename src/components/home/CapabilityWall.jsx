import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftRight,
  BadgeCheck,
  BellRing,
  CalendarClock,
  FileSpreadsheet,
  Fingerprint,
  IdCard,
  KeyRound,
  MailCheck,
  MonitorSmartphone,
  ScrollText,
  Users,
} from 'lucide-react';
import { Reveal } from '../../motion';

const CAPABILITIES = [
  { icon: MailCheck, label: 'Email code verification' },
  { icon: IdCard, label: 'Employee-ID whitelist' },
  { icon: FileSpreadsheet, label: 'Excel & CSV import' },
  { icon: ArrowLeftRight, label: 'Same-day counter-offers' },
  { icon: BadgeCheck, label: 'Supervisor approval' },
  { icon: CalendarClock, label: 'Urgency sorting' },
  { icon: BellRing, label: 'Email notifications' },
  { icon: ScrollText, label: 'Read-only audit view' },
  { icon: Fingerprint, label: 'Log in with email or ID' },
  { icon: KeyRound, label: 'Password reset by code' },
  { icon: Users, label: 'Role-based visibility' },
  { icon: MonitorSmartphone, label: 'Works on any device' },
];

/** Value statement + a "logo wall" of real capabilities (no invented social proof). */
const CapabilityWall = () => (
  <section className="relative bg-canvas pb-24 pt-20 sm:pb-28 lg:pt-28" aria-labelledby="capabilities-title">
    <div className="container-site text-center">
      <Reveal>
        <h2 id="capabilities-title" className="type-h3 mx-auto max-w-[24ch]">
          From group-chat swaps to one clear workflow
        </h2>
      </Reveal>
      <Reveal delay={80}>
        <p className="mx-auto mt-3 max-w-[560px] font-display text-[19px] leading-snug text-ink/70 sm:text-[22px]">
          every request has an owner, a status and a decision
        </p>
      </Reveal>
      <Reveal delay={140}>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/company_register" className="btn btn-primary btn-md w-full sm:w-auto">
            Create a company account
          </Link>
          <Link to="/how_it_works" className="btn btn-outline btn-md w-full sm:w-auto">
            See how it works
          </Link>
        </div>
      </Reveal>

      <ul className="mx-auto mt-16 grid max-w-[1180px] grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 lg:gap-y-10">
        {CAPABILITIES.map(({ icon: Icon, label }, i) => (
          <Reveal as="li" key={label} delay={(i % 6) * 60 + Math.floor(i / 6) * 90} y={16} className="group flex flex-col items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-ink/70 shadow-soft ring-1 ring-ink/[0.05] transition-all duration-300 ease-out-expo group-hover:-translate-y-0.5 group-hover:text-brand-600 group-hover:shadow-lift">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="max-w-[16ch] text-[14px] font-medium leading-snug text-ink/70">{label}</span>
          </Reveal>
        ))}
      </ul>
    </div>
  </section>
);

export default CapabilityWall;
