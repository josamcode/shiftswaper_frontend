import React from 'react';
import { ArrowLeftRight, BellRing, Check, Mail, Scale, ShieldCheck } from 'lucide-react';
import { Reveal } from '../motion';
import { ClosingCTA, PageHero } from '../components/marketing/Sections';
import { PEOPLE, PersonTile } from '../components/product/People';
import { CONTACT_EMAIL } from '../components/Footer';

const PRINCIPLES = [
  {
    icon: Scale,
    title: 'Fair by default',
    body: 'Everyone in the same position sees the same board, and every request follows the same steps — no favourites, no side deals.',
    tone: 'bg-lavender-200 text-lavender-700',
  },
  {
    icon: ArrowLeftRight,
    title: 'Agreement before approval',
    body: 'A swap only reaches a supervisor once both employees have agreed to it, so decisions are quick and well-informed.',
    tone: 'bg-peach-200 text-peach-700',
  },
  {
    icon: BellRing,
    title: 'Nothing changes silently',
    body: 'People are emailed at the moments that matter — new offers, accepted offers and final decisions.',
    tone: 'bg-butter-200 text-butter-700',
  },
  {
    icon: ShieldCheck,
    title: 'Your team, your rules',
    body: 'Companies decide who joins, using employee IDs they control, and who supervises whom.',
    tone: 'bg-mint-200 text-mint-700',
  },
];

const TODAY = [
  'Company sign-up with email verification',
  'Employee-ID whitelist with Excel and CSV import',
  'Join requests with supervisor assignment',
  'Shift swap requests with same-day counter-offers',
  'Day-off swap requests and matches',
  'Approval by either supervisor involved',
  'Email notifications at key moments',
  'Read-only moderator view of decisions',
  'Login with email or employee ID',
  'Employee password reset by email code',
];

const About = () => {
  return (
    <div className="bg-canvas">
      <PageHero
        eyebrow="About Shiftswaper"
        title="Built for the people who keep the doors open"
        lead="Shift workers swap shifts all the time — usually through group chats, phone calls and paper forms. Shiftswaper turns that into one fair, visible process with a supervisor’s sign-off."
        actions={false}
      >
        <div className="mx-auto mt-14 flex max-w-[760px] items-end justify-center gap-3 sm:gap-4" aria-hidden="true">
          {[
            [2, 'h-[110px] w-[92px] sm:h-[150px] sm:w-[124px]', 0],
            [0, 'h-[150px] w-[110px] sm:h-[200px] sm:w-[150px]', 80],
            [1, 'h-[180px] w-[120px] sm:h-[240px] sm:w-[170px]', 160],
            [3, 'h-[150px] w-[110px] sm:h-[200px] sm:w-[150px]', 80],
            [4, 'h-[110px] w-[92px] sm:h-[150px] sm:w-[124px]', 0],
          ].map(([p, size, delay], i) => (
            <Reveal key={p} delay={delay + 200} y={40} className={i === 0 || i === 4 ? 'hidden sm:block' : ''}>
              <PersonTile person={PEOPLE[p]} className={size} rounded="rounded-[20px]" />
            </Reveal>
          ))}
        </div>
      </PageHero>

      {/* Story */}
      <section className="py-20 lg:py-28" aria-labelledby="story-title">
        <div className="container-site grid gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <h2 id="story-title" className="type-h3 max-w-[18ch]">
              A swap is a small favour between colleagues. It deserves a process that respects everyone’s time.
            </h2>
          </Reveal>
          <Reveal delay={100} className="space-y-5 text-[17px] leading-relaxed text-ink/65">
            <p>
              In shift-based teams, plans change: an appointment, an exam, a family visit. The usual fix is a message to the group and a lot of
              back-and-forth — and supervisors often only find out once the change has already happened.
            </p>
            <p>
              Shiftswaper gives that conversation a home. An employee posts the shift or day off they need to change, colleagues in the same
              position respond with offers, the requester picks one, and a supervisor approves it before anything is final.
            </p>
            <p>
              Companies stay in charge of the basics: who can join, which employee IDs are valid, and who supervises whom.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Principles */}
      <section className="pb-20 lg:pb-28" aria-labelledby="principles-title">
        <div className="container-site">
          <Reveal>
            <h2 id="principles-title" className="type-h2 max-w-[16ch]">
              What we believe
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PRINCIPLES.map((p, i) => (
              <Reveal key={p.title} delay={i * 70} className="surface flex flex-col p-7">
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${p.tone}`}>
                  <p.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-8 font-display text-[24px] leading-tight text-ink">{p.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink/60">{p.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* What it does today */}
      <section className="pb-20 lg:pb-28" aria-labelledby="today-title">
        <div className="container-site">
          <div className="grid gap-10 overflow-hidden rounded-[32px] bg-ink p-8 text-white sm:p-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:p-16">
            <Reveal>
              <h2 id="today-title" className="max-w-[14ch] font-display text-[clamp(1.85rem,1.3rem+1.6vw,2.75rem)] leading-[1.15]">
                What Shiftswaper does today
              </h2>
              <p className="mt-4 max-w-[380px] text-[16px] leading-relaxed text-white/65">
                A focused web app that works on phones, tablets and desktops — no installation needed.
              </p>
            </Reveal>
            <Reveal delay={100}>
              <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {TODAY.map((t) => (
                  <li key={t} className="flex items-start gap-3 text-[15px] text-white/85">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10">
                      <Check className="h-3 w-3 text-mint-300" aria-hidden="true" />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="pb-24 lg:pb-32" aria-labelledby="contact-title">
        <div className="container-site">
          <Reveal className="card-sand flex flex-col items-start gap-6 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <div>
              <h2 id="contact-title" className="font-display text-[28px] leading-tight text-ink">
                Questions, ideas or feedback?
              </h2>
              <p className="mt-2 text-[16px] text-ink/60">We’d love to hear from you — drop us an email any time.</p>
            </div>
            <a href={`mailto:${CONTACT_EMAIL}`} className="btn btn-ink btn-lg shrink-0">
              <Mail className="h-4 w-4" aria-hidden="true" /> Email us
            </a>
          </Reveal>
        </div>
      </section>

      <ClosingCTA />
    </div>
  );
};

export default About;
