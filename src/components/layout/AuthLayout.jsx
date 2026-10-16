import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, KeyRound, MailCheck } from 'lucide-react';
import Logo from '../brand/Logo';
import { AppFooter } from '../Footer';
import { EmailMock, JoinRequestsMock, PhoneDashboardMock, PhoneFrame } from '../product/Mockups';

const ASIDES = {
  company: {
    tone: 'bg-lavender-200',
    title: 'Fair, approved shift swaps for your whole team',
    points: [
      'Verify your company with a one-time email code',
      'Whitelist employee IDs — or import them from Excel or CSV',
      'Approve who joins and assign each person a supervisor',
    ],
    visual: <JoinRequestsMock className="w-full max-w-[340px]" approvedIndex={0} />,
  },
  employee: {
    tone: 'bg-brand-100',
    title: 'Swap shifts and days off with your colleagues',
    points: [
      'Post shift or day-off swap requests',
      'Offer alternative times on a colleague’s request',
      'Follow every request through to supervisor approval',
    ],
    visual: (
      <PhoneFrame className="h-[380px] w-[200px]">
        <PhoneDashboardMock />
      </PhoneFrame>
    ),
  },
  verify: {
    tone: 'bg-mint-200',
    title: 'One quick check and you’re in',
    points: ['We emailed you a 6-digit code', 'Codes can be resent after a short wait', 'Too many wrong attempts pause verification for 30 minutes'],
    visual: (
      <div className="w-full max-w-[320px] space-y-3">
        <EmailMock title="Your verification code" tone="brand" />
        <div className="flex justify-center gap-2" aria-hidden="true">
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} className="flex h-11 w-9 items-center justify-center rounded-lg border border-ink/10 bg-white text-ink/30 shadow-soft">
              <span className="h-2 w-2 rounded-full bg-current" />
            </span>
          ))}
        </div>
      </div>
    ),
    icon: MailCheck,
  },
  reset: {
    tone: 'bg-peach-200',
    title: 'Get back into your account',
    points: ['Request a code to your registered email', 'Enter the code to confirm it’s you', 'Choose a new, strong password'],
    visual: (
      <div className="flex h-28 w-28 items-center justify-center rounded-[28px] bg-white shadow-lift">
        <KeyRound className="h-12 w-12 text-peach-500" aria-hidden="true" />
      </div>
    ),
  },
};

/** Concentric arcs echoing the hero decoration. */
const Arcs = ({ className = '' }) => (
  <svg viewBox="0 0 400 400" className={className} aria-hidden="true" fill="none">
    {[60, 110, 160, 210, 260].map((r) => (
      <circle key={r} cx="200" cy="200" r={r} stroke="currentColor" strokeWidth="1.25" />
    ))}
  </svg>
);

export const AuthAside = ({ variant = 'company' }) => {
  const a = ASIDES[variant] || ASIDES.company;
  return (
    <div className={`relative hidden overflow-hidden lg:flex lg:flex-col ${a.tone} p-10`}>
      <Arcs className="pointer-events-none absolute -left-24 -top-24 h-[420px] w-[420px] text-white/70" />
      <Arcs className="pointer-events-none absolute -bottom-40 -right-40 h-[480px] w-[480px] text-white/60" />
      <div className="relative">
        <p className="font-display text-[28px] leading-tight text-ink">{a.title}</p>
        <ul className="mt-5 space-y-2.5">
          {a.points.map((pt) => (
            <li key={pt} className="flex items-start gap-2.5 text-[15px] text-ink/70">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-ink">
                <Check className="h-3 w-3" aria-hidden="true" />
              </span>
              {pt}
            </li>
          ))}
        </ul>
      </div>
      <div className="relative mt-auto flex justify-center pt-10 animate-fade-up">{a.visual}</div>
    </div>
  );
};

/**
 * Focused, chrome-light layout for sign-up, login, OTP and password flows.
 *
 * - `aside`: 'company' | 'employee' | 'verify' | 'reset' | false
 * - `topLink`: { label, to } shown at the top right
 * - `back`: { label, to } rendered above the title
 */
const AuthLayout = ({
  title,
  subtitle,
  children,
  aside = 'company',
  topLink,
  back,
  footer,
  wide = false,
}) => (
  <div className="flex min-h-screen flex-col bg-canvas">
    <header className="container-site flex h-[70px] items-center justify-between">
      <Link to="/" aria-label="Shiftswaper home" className="rounded-lg">
        <Logo />
      </Link>
      {topLink && (
        <Link to={topLink.to} className="text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700">
          {topLink.label}
        </Link>
      )}
    </header>

    <main id="main" className="container-site flex flex-1 items-start justify-center pb-12 pt-2 sm:pt-6 lg:items-center">
      <div
        className={`grid w-full overflow-hidden rounded-[28px] border border-ink/[0.06] bg-white shadow-lift animate-scale-in ${
          aside ? `${wide ? 'max-w-[1180px]' : 'max-w-[1040px]'} lg:grid-cols-[0.92fr_1fr]` : 'max-w-[560px]'
        }`}
      >
        {aside && <AuthAside variant={aside} />}
        <div className="px-5 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
          {back && (
            <Link
              to={back.to}
              className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink/55 transition-colors hover:text-ink"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {back.label}
            </Link>
          )}
          {title && <h1 className="font-display text-[30px] leading-tight text-ink sm:text-[34px]">{title}</h1>}
          {subtitle && <p className="mt-2 text-[15px] leading-relaxed text-ink/60">{subtitle}</p>}
          <div className={title || subtitle ? 'mt-7' : ''}>{children}</div>
          {footer && <div className="mt-8 border-t border-ink/[0.07] pt-6 text-center text-sm text-ink/60">{footer}</div>}
        </div>
      </div>
    </main>

    <AppFooter />
  </div>
);

export default AuthLayout;
