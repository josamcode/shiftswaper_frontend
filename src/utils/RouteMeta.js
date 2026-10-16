import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE = 'Shiftswaper';
const DEFAULT_TITLE = `${SITE} — Shift and day-off swaps, approved`;
const DEFAULT_DESCRIPTION =
  'Shiftswaper lets employees request, offer and accept shift and day-off swaps, with supervisor approval before anything changes.';

const META = {
  '/': { title: DEFAULT_TITLE },
  '/home': { title: DEFAULT_TITLE },
  '/features': {
    title: `Features — ${SITE}`,
    description: 'Shift swaps, counter-offers, day-off swaps, supervisor approval, join requests and employee-ID import in one place.',
  },
  '/how_it_works': {
    title: `How it works — ${SITE}`,
    description: 'How companies, supervisors and employees use Shiftswaper to request, offer, accept and approve shift and day-off swaps.',
  },
  '/about': {
    title: `About — ${SITE}`,
    description: 'Why we built Shiftswaper: a fair, visible way for shift-based teams to swap shifts and days off with supervisor approval.',
  },
  '/privacy': { title: `Privacy Policy — ${SITE}` },
  '/terms': { title: `Terms of Service — ${SITE}` },
  '/cookie_policy': { title: `Cookie Policy — ${SITE}` },
  '/get_started': { title: `Get started — ${SITE}` },
  '/company_register': { title: `Create a company account — ${SITE}` },
  '/company_verify_otp': { title: `Verify your email — ${SITE}` },
  '/company_login': { title: `Company login — ${SITE}` },
  '/employee_register': { title: `Join your company — ${SITE}` },
  '/employee_verify_otp': { title: `Verify your email — ${SITE}` },
  '/employee_login': { title: `Employee login — ${SITE}` },
  '/forgot-password': { title: `Forgot password — ${SITE}` },
  '/reset-password': { title: `Reset password — ${SITE}` },
  '/dashboard': { title: `Dashboard — ${SITE}` },
  '/shift_swaps': { title: `Shift swaps board — ${SITE}` },
  '/day_off_swaps': { title: `Day-off swaps board — ${SITE}` },
};

/** Keeps the document title and meta description in sync with the route. */
const RouteMeta = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const path = pathname.replace(/\/+$/, '') || '/';
    const meta = META[path] || { title: `Page not found — ${SITE}` };
    document.title = meta.title;
    const tag = document.querySelector('meta[name="description"]');
    if (tag) tag.setAttribute('content', meta.description || DEFAULT_DESCRIPTION);
  }, [pathname]);

  return null;
};

export default RouteMeta;
