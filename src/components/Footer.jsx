import React from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import Logo from './brand/Logo';

export const CONTACT_EMAIL = 'gergessamuel100@gmail.com';

const columns = [
  {
    title: 'Product',
    links: [
      { label: 'Shift swaps', href: '/features#shift-swaps' },
      { label: 'Day-off swaps', href: '/features#day-off-swaps' },
      { label: 'Supervisor approval', href: '/features#approvals' },
      { label: 'Employee IDs & import', href: '/features#employee-ids' },
      { label: 'All features', href: '/features' },
    ],
  },
  {
    title: 'Get started',
    links: [
      { label: 'Create a company account', href: '/company_register' },
      { label: 'Join your company', href: '/employee_register' },
      { label: 'Company login', href: '/company_login' },
      { label: 'Employee login', href: '/employee_login' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'How it works', href: '/how_it_works' },
      { label: 'Contact us', href: `mailto:${CONTACT_EMAIL}`, external: true },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookie_policy' },
    ],
  },
];

const FooterLink = ({ link }) =>
  link.external ? (
    <a href={link.href} className="text-[15px] text-ink/80 transition-colors duration-200 hover:text-brand-600">
      {link.label}
    </a>
  ) : (
    <Link to={link.href} className="text-[15px] text-ink/80 transition-colors duration-200 hover:text-brand-600">
      {link.label}
    </Link>
  );

const year = new Date().getFullYear();

/** Full marketing footer. */
const Footer = () => (
  <footer className="border-t border-ink/[0.06] bg-canvas">
    <div className="container-site pb-10 pt-16 lg:pt-20">
      <div className="grid gap-12 lg:grid-cols-[1.1fr_2fr] lg:gap-16">
        <div className="max-w-sm">
          <Link to="/" aria-label="Shiftswaper home" className="inline-block rounded-lg">
            <Logo />
          </Link>
          <p className="mt-4 text-[15px] leading-relaxed text-ink/60">
            Shift and day-off swaps for teams that work in shifts — requested by employees, approved by supervisors.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link to="/company_register" className="btn btn-primary btn-sm">
              Create company account
            </Link>
            <Link to="/employee_register" className="btn btn-sm border border-ink/80 text-ink hover:bg-ink hover:text-white">
              Join your team
            </Link>
          </div>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="mt-8 inline-flex items-center gap-2 text-[15px] text-ink transition-colors hover:text-brand-600"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-lavender-200 text-lavender-700">
              <Mail className="h-4 w-4" aria-hidden="true" />
            </span>
            <span>
              <span className="block font-semibold">Contact us</span>
              <span className="block text-[13px] text-ink/55 underline decoration-ink/20 underline-offset-2">{CONTACT_EMAIL}</span>
            </span>
          </a>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="mb-4 text-[17px] font-semibold text-ink">{col.title}</p>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <FooterLink link={link} />
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="mt-16 flex flex-col gap-3 border-t border-ink/[0.08] pt-6 text-[13px] text-ink/50 sm:flex-row sm:items-center sm:justify-between">
        <p>© {year} Shiftswaper. All rights reserved.</p>
        <p>Built for teams that run on shifts.</p>
      </div>
    </div>
  </footer>
);

/** Slim footer used inside the signed-in app and auth flows. */
export const AppFooter = () => (
  <footer className="border-t border-ink/[0.06] bg-canvas">
    <div className="container-site flex flex-col gap-3 py-6 text-[13px] text-ink/55 sm:flex-row sm:items-center sm:justify-between">
      <p>© {year} Shiftswaper</p>
      <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-2">
        <Link to="/privacy" className="hover:text-ink">Privacy</Link>
        <Link to="/terms" className="hover:text-ink">Terms</Link>
        <Link to="/cookie_policy" className="hover:text-ink">Cookies</Link>
        <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-ink">Contact</a>
      </nav>
    </div>
  </footer>
);

export default Footer;
