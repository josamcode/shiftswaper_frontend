import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Building2, LayoutGrid, Mail, UserRound } from 'lucide-react';
import { HeroArcs } from '../components/marketing/Sections';
import { CONTACT_EMAIL } from '../components/Footer';
import { Reveal } from '../motion';

const HELPFUL_LINKS = [
  { label: 'Features', hint: 'Everything Shiftswaper can do', to: '/features', icon: LayoutGrid, tint: 'bg-lavender-200 text-lavender-700' },
  { label: 'Company login', hint: 'Review join requests and employee IDs', to: '/company_login', icon: Building2, tint: 'bg-mint-200 text-mint-700' },
  { label: 'Employee login', hint: 'Post swaps and respond to offers', to: '/employee_login', icon: UserRound, tint: 'bg-peach-200 text-peach-700' },
  { label: 'Contact us', hint: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}`, icon: Mail, tint: 'bg-butter-200 text-butter-700' },
];

const cardClass =
  'group flex h-full items-center gap-3 rounded-2xl border border-ink/[0.07] bg-white px-4 py-3.5 text-left shadow-soft transition-[transform,box-shadow,border-color] duration-300 ease-out-expo hover:-translate-y-0.5 hover:border-ink/15 hover:shadow-lift';

const LinkCardBody = ({ link }) => {
  const Icon = link.icon;
  return (
    <>
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${link.tint}`}>
        <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold text-ink">{link.label}</span>
        <span className="block break-all text-[13px] leading-snug text-ink/55">{link.hint}</span>
      </span>
      <ArrowRight
        className="h-4 w-4 shrink-0 text-ink/35 transition-transform duration-300 ease-out-expo group-hover:translate-x-1 group-hover:text-ink/70"
        aria-hidden="true"
      />
    </>
  );
};

const NotFoundPage = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <section className="relative overflow-hidden bg-canvas">
      <HeroArcs className="top-[38%]" />

      <div className="container-site relative flex min-h-[calc(100svh-70px)] flex-col items-center justify-center py-16 text-center sm:py-20">
        <Reveal y={12}>
          <p className="eyebrow justify-center">Error 404 · Page not found</p>
        </Reveal>

        <Reveal delay={60} className="relative mt-4">
          <p
            aria-hidden="true"
            className="select-none font-display text-[clamp(6.5rem,3.5rem+13vw,12.5rem)] font-normal leading-[0.95] tracking-[-0.02em] text-ink"
          >
            4<span className="text-brand-500">0</span>4
          </p>
          <span
            aria-hidden="true"
            className="chip absolute -right-3 top-1 rotate-[6deg] bg-rose-200 text-rose-700 shadow-soft sm:-right-8 sm:top-3"
          >
            Not on the board
          </span>
        </Reveal>

        <Reveal delay={120}>
          <h1 className="type-h3 mx-auto mt-6 max-w-[18ch]">This shift doesn't exist</h1>
        </Reveal>

        <Reveal delay={180}>
          <p className="type-lead mx-auto mt-4 max-w-[560px]">
            The page you're looking for doesn't exist or has been moved. Check the address for typos, or pick up from
            one of the pages below.
          </p>
        </Reveal>

        <Reveal delay={240} className="w-full">
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/" className="btn btn-primary btn-lg btn-arrow w-full sm:w-auto">
              Back to home <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link to="/how_it_works" className="btn btn-outline btn-lg w-full sm:w-auto">
              How it works
            </Link>
          </div>
          <button type="button" onClick={handleGoBack} className="btn btn-ghost btn-md mt-3 text-ink/70 hover:text-ink">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Go back to the previous page
          </button>
        </Reveal>

        <Reveal delay={300} className="mt-12 w-full max-w-[680px] sm:mt-14">
          <nav aria-label="Helpful links">
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink/45">Helpful links</p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {HELPFUL_LINKS.map((link) => (
                <li key={link.label}>
                  {link.href ? (
                    <a href={link.href} className={cardClass}>
                      <LinkCardBody link={link} />
                    </a>
                  ) : (
                    <Link to={link.to} className={cardClass}>
                      <LinkCardBody link={link} />
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </Reveal>
      </div>
    </section>
  );
};

export default NotFoundPage;
