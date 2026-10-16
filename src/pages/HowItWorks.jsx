import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Building2, ChevronDown, Mail, User } from 'lucide-react';
import { Reveal } from '../motion';
import { ClosingCTA, PageHero } from '../components/marketing/Sections';
import ScrollStory from '../components/home/ScrollStory';
import { CONTACT_EMAIL } from '../components/Footer';

const JOURNEYS = [
  {
    id: 'company',
    icon: Building2,
    role: 'For companies',
    tone: 'bg-mint-200 text-mint-700',
    title: 'Set up your team in an afternoon',
    body: 'You stay in control of who joins and who approves their swaps.',
    cta: { label: 'Create a company account', to: '/company_register' },
    steps: [
      ['Register your company', 'Add your company name, a short description, contact email, phone number and logo.'],
      ['Verify your email', 'Enter the 6-digit code we email you. Your company can sign in once it’s verified.'],
      ['Add employee IDs', 'Create IDs one by one — or auto-generate them — or import a whole roster from Excel or CSV.'],
      ['Approve join requests', 'Review each request, assign the employee’s supervisor and approve, or reject with a reason.'],
    ],
  },
  {
    id: 'supervisor',
    icon: BadgeCheck,
    role: 'For supervisors',
    tone: 'bg-butter-200 text-butter-700',
    title: 'Give the final say, with the full picture',
    body: 'Swaps only take effect once a supervisor approves them.',
    cta: { label: 'Supervisor login', to: '/employee_login' },
    steps: [
      ['Join your company', 'Request to join with your employee ID. Your company approves you as a supervisor.'],
      ['See what needs a decision', 'Pending swaps are ranked Critical, High or Normal by how soon the shift starts.'],
      ['Approve or reject', 'Compare both shifts side by side and decide. Either supervisor involved can make the call.'],
      ['Everyone is told', 'Both employees receive an email with your decision, and it stays on record.'],
    ],
  },
  {
    id: 'employee',
    icon: User,
    role: 'For employees',
    tone: 'bg-lavender-200 text-lavender-700',
    title: 'Swap a shift without chasing anyone',
    body: 'Post once, compare offers, and follow your request to approval.',
    cta: { label: 'Join your company', to: '/employee_register' },
    steps: [
      ['Request to join', 'Pick your company, enter the employee ID it gave you and confirm your email with a code.'],
      ['Post a swap request', 'Choose a shift or a day off, add your reason and the shift you’d prefer.'],
      ['Help a colleague', 'Browse requests from colleagues in your position and offer an alternative time on the same day.'],
      ['Accept and get approval', 'Accept the offer that suits you. A supervisor approves it and you’re notified by email.'],
    ],
  },
];

const FAQS = [
  {
    q: 'How do I get started as a company?',
    a: 'Register with your company details and logo, confirm your email with the 6-digit code, then add your employee IDs — one at a time or by importing an Excel or CSV file. Your team can then request to join, and you approve each request from your dashboard.',
  },
  {
    q: 'How do employees join our company?',
    a: 'They choose your company, enter an employee ID you’ve added, fill in their details and confirm their email. Once you approve the request and assign a supervisor, they can log in with their email address or employee ID.',
  },
  {
    q: 'Who can see my swap request?',
    a: 'Colleagues in the same company and the same position — Experts see Experts’ requests, SMEs see SMEs’ and Supervisors see Supervisors’. Moderators can review approved and rejected requests across the company.',
  },
  {
    q: 'What’s the difference between a shift swap and a day-off swap?',
    a: 'A shift swap changes when you work on a given day, so offers must be on the same calendar day. A day-off swap exchanges one of your days off for another date.',
  },
  {
    q: 'How does approval work?',
    a: 'After you accept an offer, the swap goes to the supervisors for approval. Either your supervisor or your colleague’s supervisor can approve or reject it, and you both receive an email with the decision.',
  },
  {
    q: 'Can I edit or delete a request after posting it?',
    a: 'You can edit or delete a shift request while nobody has made an offer and before the shift starts. Day-off requests can be deleted under the same conditions.',
  },
  {
    q: 'Which emails will I receive?',
    a: 'One-time codes for sign-up and password resets, an email when someone offers on your request, an email when your offer is accepted, and an email with the supervisor’s final decision.',
  },
  {
    q: 'What if my join request is rejected?',
    a: 'When you try to sign in you’ll see that the request was rejected, together with the reason your company gave.',
  },
  {
    q: 'I forgot my password — what now?',
    a: 'Employees can reset their password from the login page with a code sent to their email. Company accounts can’t reset their password themselves yet — contact us and we’ll help.',
  },
];

const Journey = ({ j, index }) => (
  <section id={j.id} className="scroll-mt-24 border-t border-ink/[0.07] py-16 first:border-0 lg:py-24" aria-labelledby={`${j.id}-title`}>
    <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
      <Reveal className="lg:sticky lg:top-[110px] lg:self-start">
        <span className={`chip ${j.tone}`}>
          <j.icon className="h-3.5 w-3.5" aria-hidden="true" /> {j.role}
        </span>
        <h2 id={`${j.id}-title`} className="type-h3 mt-5 max-w-[16ch]">
          {j.title}
        </h2>
        <p className="mt-4 max-w-[420px] text-[17px] leading-relaxed text-ink/60">{j.body}</p>
        <Link to={j.cta.to} className={`btn btn-md btn-arrow mt-7 ${index === 0 ? 'btn-primary' : 'btn-outline'}`}>
          {j.cta.label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </Reveal>
      <ol className="relative">
        <span aria-hidden="true" className="absolute bottom-8 left-[27px] top-8 w-px bg-ink/10" />
        {j.steps.map(([title, body], i) => (
          <Reveal as="li" key={title} delay={i * 80} className="relative flex gap-6 pb-10 last:pb-0">
            <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-ink/10 bg-white font-display text-[19px] text-ink shadow-soft">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="card-sand flex-1 p-6">
              <h3 className="font-display text-[22px] leading-tight text-ink">{title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink/60">{body}</p>
            </div>
          </Reveal>
        ))}
      </ol>
    </div>
  </section>
);

const FaqItem = ({ item, open, onToggle, id }) => (
  <div className="border-b border-ink/10">
    <h3>
      <button
        type="button"
        id={`${id}-q`}
        aria-expanded={open}
        aria-controls={`${id}-a`}
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-6 py-6 text-left"
      >
        <span className="font-display text-[clamp(1.15rem,1rem+0.4vw,1.4rem)] leading-snug text-ink">{item.q}</span>
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
            open ? 'rotate-180 border-ink bg-ink text-white' : 'border-ink/20 text-ink'
          }`}
        >
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </span>
      </button>
    </h3>
    <div
      id={`${id}-a`}
      role="region"
      aria-labelledby={`${id}-q`}
      className={`grid transition-[grid-template-rows] duration-500 ease-out-expo ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
    >
      <div className="overflow-hidden">
        <p className="max-w-[720px] pb-6 pr-12 text-[16px] leading-relaxed text-ink/60">{item.a}</p>
      </div>
    </div>
  </div>
);

const HowItWorks = () => {
  const [open, setOpen] = useState(0);

  return (
    <div className="bg-canvas">
      <PageHero
        eyebrow="How it works"
        title="From request to approval, without the chase"
        lead="One shared process for companies, supervisors and employees — so every swap is agreed by both people and signed off before anything changes."
      >
        <Reveal delay={300}>
          <div className="mt-12 flex flex-wrap justify-center gap-2">
            {JOURNEYS.map((j) => (
              <Link key={j.id} to={`#${j.id}`} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-ink shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift">
                <j.icon className="h-4 w-4 text-ink/50" aria-hidden="true" /> {j.role}
              </Link>
            ))}
          </div>
        </Reveal>
      </PageHero>

      <ScrollStory id="flow" title="Every swap follows the same four steps" />

      <div className="container-site pt-10">
        {JOURNEYS.map((j, i) => (
          <Journey key={j.id} j={j} index={i} />
        ))}
      </div>

      <section className="bg-sand-100 py-20 lg:py-28" aria-labelledby="faq-title">
        <div className="container-site grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          <Reveal>
            <h2 id="faq-title" className="type-h3 max-w-[12ch]">
              Questions, answered
            </h2>
            <p className="mt-4 max-w-[360px] text-[16px] leading-relaxed text-ink/60">Can’t find what you’re looking for? We’re happy to help.</p>
            <a href={`mailto:${CONTACT_EMAIL}`} className="btn btn-white btn-md mt-6">
              <Mail className="h-4 w-4" aria-hidden="true" /> Email us
            </a>
          </Reveal>
          <Reveal delay={100}>
            <div className="border-t border-ink/10">
              {FAQS.map((f, i) => (
                <FaqItem key={f.q} id={`faq-${i}`} item={f} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <ClosingCTA />
    </div>
  );
};

export default HowItWorks;
