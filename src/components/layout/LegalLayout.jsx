import React, { useEffect, useState } from 'react';
import { Clock, Mail } from 'lucide-react';
import { CONTACT_EMAIL } from '../Footer';
import { HeroArcs } from '../marketing/Sections';

/**
 * Long-form document layout for legal pages.
 *
 * `sections`: [{ id, title, content: ReactNode }]
 * Renders every section in a single readable column with a sticky table of
 * contents (desktop) / scrollable chip row (mobile) that tracks the section
 * currently in view.
 */
const LegalLayout = ({ eyebrow = 'Legal', title, intro, lastUpdated, sections }) => {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-90px 0px -65% 0px', threshold: 0 }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [sections]);

  const jump = (id) => (e) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 96, behavior: 'smooth' });
    window.history.replaceState(null, '', `#${id}`);
    setActive(id);
  };

  return (
    <div className="bg-canvas">
      <section className="relative overflow-hidden border-b border-ink/[0.06]">
        <HeroArcs className="top-[20%]" />
        <div className="container-site relative py-16 text-center sm:py-20">
          <p className="eyebrow justify-center">{eyebrow}</p>
          <h1 className="type-h2 mx-auto mt-3 max-w-[18ch]">{title}</h1>
          {intro && <p className="type-lead mx-auto mt-5 max-w-[640px]">{intro}</p>}
          {lastUpdated && (
            <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-ink/60 shadow-soft">
              <Clock className="h-4 w-4" aria-hidden="true" /> Last updated {lastUpdated}
            </p>
          )}
        </div>
      </section>

      {/* Mobile section chips */}
      <nav aria-label="Sections" className="sticky top-[70px] z-30 border-b border-ink/[0.06] bg-canvas/95 backdrop-blur lg:hidden">
        <div className="no-scrollbar container-site flex gap-2 overflow-x-auto py-3">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              onClick={jump(s.id)}
              aria-current={active === s.id ? 'true' : undefined}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                active === s.id ? 'bg-ink text-white' : 'bg-white text-ink/70 shadow-soft'
              }`}
            >
              {s.title}
            </a>
          ))}
        </div>
      </nav>

      <div className="container-site grid gap-10 py-12 lg:grid-cols-[260px_1fr] lg:gap-16 lg:py-16">
        <aside className="hidden lg:block">
          <nav aria-label="On this page" className="sticky top-[100px]">
            <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.12em] text-ink/40">On this page</p>
            <ul className="space-y-0.5 border-l border-ink/10">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    onClick={jump(s.id)}
                    aria-current={active === s.id ? 'true' : undefined}
                    className={`-ml-px block border-l-2 py-1.5 pl-4 text-[15px] transition-colors ${
                      active === s.id ? 'border-brand-500 font-medium text-ink' : 'border-transparent text-ink/55 hover:text-ink'
                    }`}
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-8 flex items-center gap-3 rounded-2xl bg-sand-200 p-4 text-sm text-ink transition-colors hover:bg-sand-300"
            >
              <Mail className="h-4 w-4 shrink-0 text-ink/60" aria-hidden="true" />
              <span>
                Questions? <span className="font-semibold">Email us</span>
              </span>
            </a>
          </nav>
        </aside>

        <article className="legal-prose min-w-0 max-w-[760px]">
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-28 border-b border-ink/[0.07] pb-10 pt-2 last:border-0 [&+section]:pt-10">
              <h2 className="type-h4 mb-5">{s.title}</h2>
              <div className="space-y-4 text-[16px] leading-[1.75] text-ink/70">{s.content}</div>
            </section>
          ))}
        </article>
      </div>
    </div>
  );
};

export default LegalLayout;
