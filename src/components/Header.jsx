import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import {
  ArrowLeftRight,
  ArrowRight,
  BadgeCheck,
  Bell,
  Building2,
  CalendarDays,
  ChevronDown,
  FileSpreadsheet,
  Handshake,
  Layers,
  LayoutDashboard,
  Menu,
  ShieldCheck,
  Sparkles,
  User,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import Logo from './brand/Logo';

const productMenu = {
  columns: [
    {
      title: 'Swapping',
      items: [
        { label: 'Shift swaps', href: '/features#shift-swaps', icon: Handshake },
        { label: 'Day-off swaps', href: '/features#day-off-swaps', icon: CalendarDays },
        { label: 'Counter-offers', href: '/features#counter-offers', icon: ArrowLeftRight },
        { label: 'Supervisor approval', href: '/features#approvals', icon: BadgeCheck },
      ],
    },
    {
      title: 'Team setup',
      items: [
        { label: 'Join requests', href: '/features#join-requests', icon: UserCheck },
        { label: 'Employee IDs & import', href: '/features#employee-ids', icon: FileSpreadsheet },
        { label: 'Roles & visibility', href: '/features#roles', icon: Users },
        { label: 'Email notifications', href: '/features#notifications', icon: Bell },
      ],
    },
  ],
  side: {
    title: 'Platform',
    items: [
      { label: 'How it works', href: '/how_it_works', icon: Sparkles },
      { label: 'Security', href: '/features#security', icon: ShieldCheck },
      { label: 'All features', href: '/features', icon: Layers },
    ],
  },
};

const solutionsMenu = [
  { label: 'For companies', desc: 'Onboard your team and keep control', href: '/how_it_works#company', icon: Building2 },
  { label: 'For supervisors', desc: 'Approve or reject every swap', href: '/how_it_works#supervisor', icon: BadgeCheck },
  { label: 'For employees', desc: 'Request, offer and accept swaps', href: '/how_it_works#employee', icon: User },
];

const loginMenu = [
  { label: 'Employee login', desc: 'Email or employee ID', href: '/employee_login', icon: User },
  { label: 'Company login', desc: 'Company admin account', href: '/company_login', icon: Building2 },
];

const getRole = () => {
  if (Cookies.get('company_token')) return 'company';
  if (Cookies.get('supervisor_token')) return 'supervisor';
  if (Cookies.get('employee_token')) return 'employee';
  if (Cookies.get('moderator_token')) return 'moderator';
  return null;
};

/* ------------------------------------------------------------------ */

const Dropdown = ({ id, label, openId, setOpenId, children, align = 'left', wide = false }) => {
  const open = openId === id;
  const timer = useRef(null);

  const show = () => {
    clearTimeout(timer.current);
    setOpenId(id);
  };
  const hide = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpenId((cur) => (cur === id ? null : cur)), 120);
  };
  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <div className={wide ? 'static' : 'relative'} onMouseEnter={show} onMouseLeave={hide}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`menu-${id}`}
        onClick={() => setOpenId(open ? null : id)}
        className={`group flex h-[70px] items-center gap-1 px-3 text-[15px] transition-colors duration-200 ${
          open ? 'text-brand-600' : 'text-ink/80 hover:text-ink'
        }`}
      >
        {label}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-300 ease-out-expo ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div
          id={`menu-${id}`}
          className={
            wide
              ? 'absolute inset-x-0 top-full z-50'
              : `absolute top-[calc(100%-6px)] z-50 ${align === 'right' ? 'right-0' : 'left-0'}`
          }
        >
          {children}
        </div>
      )}
    </div>
  );
};

const MenuLink = ({ item, onNavigate, withDesc = false }) => {
  const Icon = item.icon;
  return (
    <Link
      to={item.href}
      onClick={onNavigate}
      className="group flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors duration-200 hover:bg-sand-100"
    >
      <Icon className="mt-0.5 h-[18px] w-[18px] shrink-0 text-ink/45 transition-colors group-hover:text-brand-500" aria-hidden="true" />
      <span>
        <span className="block text-[15px] text-ink">{item.label}</span>
        {withDesc && <span className="mt-0.5 block text-[13px] text-ink/50">{item.desc}</span>}
      </span>
    </Link>
  );
};

/* ------------------------------------------------------------------ */

const Header = ({ variant = 'marketing' }) => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [openId, setOpenId] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const role = isLoggedIn ? getRole() : null;
  const headerRef = useRef(null);

  const closeAll = useCallback(() => {
    setOpenId(null);
    setMobileOpen(false);
  }, []);

  // Close menus on route change.
  useEffect(() => {
    closeAll();
  }, [location.pathname, location.hash, closeAll]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') closeAll();
    };
    const onClick = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) setOpenId(null);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [closeAll]);

  // Lock page scroll while the mobile drawer is open.
  useEffect(() => {
    if (!mobileOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const appLinks = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ...(role === 'employee' || role === 'supervisor'
      ? [
          { label: 'Shift swaps', href: '/shift_swaps', icon: Handshake },
          { label: 'Day-off swaps', href: '/day_off_swaps', icon: CalendarDays },
        ]
      : []),
  ];

  const isApp = variant === 'app';
  const megaOpen = openId === 'product';

  return (
    <>
      <header
        ref={headerRef}
        className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${
          scrolled || megaOpen ? 'shadow-[0_1px_0_rgba(32,28,68,0.08)]' : ''
        }`}
      >
        <div className="container-site flex h-[70px] items-center justify-between gap-4">
          <div className="flex items-center gap-6 xl:gap-8">
            <Link to="/" aria-label="Shiftswaper home" className="rounded-lg">
              <Logo />
            </Link>

            {/* Desktop navigation */}
            <nav aria-label="Main" className="hidden items-center lg:flex">
              {isApp || isLoggedIn ? (
                appLinks.map((l) => (
                  <NavLink
                    key={l.href}
                    to={l.href}
                    className={({ isActive }) =>
                      `relative flex h-[70px] items-center px-3 text-[15px] transition-colors duration-200 ${
                        isActive ? 'text-ink after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-brand-500' : 'text-ink/70 hover:text-ink'
                      }`
                    }
                  >
                    {l.label}
                  </NavLink>
                ))
              ) : (
                <>
                  <Dropdown id="product" label="Product" openId={openId} setOpenId={setOpenId} wide>
                    <div className="container-site">
                      <div className="animate-slide-down rounded-b-[24px] bg-white px-6 pb-7 pt-3 shadow-[0_30px_60px_-30px_rgba(32,28,68,0.35)] xl:px-8">
                        <div className="grid grid-cols-[1fr_1fr_0.9fr] gap-8">
                          <div className="col-span-2">
                            <div className="mb-4 flex items-center gap-3 rounded-xl bg-lavender-200 px-2 py-2">
                              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
                                <Sparkles className="h-4 w-4 text-ink" aria-hidden="true" />
                              </span>
                              <span className="font-display text-xl text-ink">Features</span>
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                              {productMenu.columns.map((col) => (
                                <div key={col.title}>
                                  <p className="mx-3 mb-2 border-b border-ink/10 pb-2 text-[15px] text-ink/70">{col.title}</p>
                                  {col.items.map((item) => (
                                    <MenuLink key={item.href} item={item} onNavigate={closeAll} />
                                  ))}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div className="mb-4 flex items-center gap-3 rounded-xl bg-mint-200 px-2 py-2">
                              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
                                <Layers className="h-4 w-4 text-ink" aria-hidden="true" />
                              </span>
                              <span className="font-display text-xl text-ink">{productMenu.side.title}</span>
                            </div>
                            {productMenu.side.items.map((item) => (
                              <MenuLink key={item.href} item={item} onNavigate={closeAll} />
                            ))}
                            <Link
                              to="/company_register"
                              onClick={closeAll}
                              className="group mt-4 block rounded-2xl bg-ink p-4 text-white"
                            >
                              <span className="font-display text-lg">Set up your company</span>
                              <span className="mt-1 flex items-center gap-1 text-sm text-white/70">
                                Create an account <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                              </span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Dropdown>
                  <Dropdown id="solutions" label="Solutions" openId={openId} setOpenId={setOpenId}>
                    <div className="w-[340px] animate-slide-down rounded-2xl border border-ink/[0.06] bg-white p-2 shadow-lift">
                      {solutionsMenu.map((item) => (
                        <MenuLink key={item.href} item={item} onNavigate={closeAll} withDesc />
                      ))}
                    </div>
                  </Dropdown>
                  <NavLink
                    to="/how_it_works"
                    className={({ isActive }) =>
                      `flex h-[70px] items-center px-3 text-[15px] transition-colors duration-200 ${isActive ? 'text-brand-600' : 'text-ink/80 hover:text-ink'}`
                    }
                  >
                    How it works
                  </NavLink>
                  <NavLink
                    to="/about"
                    className={({ isActive }) =>
                      `flex h-[70px] items-center px-3 text-[15px] transition-colors duration-200 ${isActive ? 'text-brand-600' : 'text-ink/80 hover:text-ink'}`
                    }
                  >
                    About
                  </NavLink>
                </>
              )}
            </nav>
          </div>

          {/* Desktop actions */}
          <div className="hidden items-center gap-2 lg:flex">
            {isLoggedIn ? (
              !isApp && (
                <button type="button" onClick={() => navigate('/dashboard')} className="btn btn-primary btn-md">
                  <LayoutDashboard className="h-4 w-4" aria-hidden="true" /> Dashboard
                </button>
              )
            ) : (
              <>
                <Dropdown id="login" label={<span className="flex items-center gap-1.5"><User className="h-4 w-4" aria-hidden="true" />Log in</span>} openId={openId} setOpenId={setOpenId} align="right">
                  <div className="w-[280px] animate-slide-down rounded-2xl border border-ink/[0.06] bg-white p-2 shadow-lift">
                    {loginMenu.map((item) => (
                      <MenuLink key={item.href} item={item} onNavigate={closeAll} withDesc />
                    ))}
                  </div>
                </Dropdown>
                <Link to="/company_register" className="btn btn-primary btn-md">
                  Create company account
                </Link>
                <Link to="/employee_register" className="btn btn-outline btn-md hidden xl:inline-flex">
                  Join your team
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5 lg:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div
            id="mobile-menu"
            className="fixed inset-x-0 bottom-0 top-[70px] z-50 flex animate-fade-in flex-col overflow-y-auto border-t border-ink/[0.08] bg-white lg:hidden"
          >
            <nav aria-label="Mobile" className="container-site flex-1 py-4">
              {isLoggedIn ? (
                appLinks.map((l) => (
                  <Link key={l.href} to={l.href} className="flex items-center gap-3 border-b border-ink/[0.07] py-4 text-lg text-ink">
                    <l.icon className="h-5 w-5 text-ink/50" aria-hidden="true" /> {l.label}
                  </Link>
                ))
              ) : (
                <>
                  {[
                    {
                      id: 'm-product',
                      label: 'Product',
                      items: [...productMenu.columns.flatMap((c) => c.items), ...productMenu.side.items],
                    },
                    { id: 'm-solutions', label: 'Solutions', items: solutionsMenu },
                  ].map((section) => {
                    const open = mobileSection === section.id;
                    return (
                      <div key={section.id} className="border-b border-ink/[0.07]">
                        <button
                          type="button"
                          className="flex w-full items-center justify-between py-4 text-left text-lg text-ink"
                          aria-expanded={open}
                          onClick={() => setMobileSection(open ? null : section.id)}
                        >
                          {section.label}
                          <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${open ? 'rotate-180 text-brand-500' : 'text-ink/50'}`} aria-hidden="true" />
                        </button>
                        <div className={`grid transition-[grid-template-rows] duration-300 ease-out-expo ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                          <div className="overflow-hidden">
                            <div className="pb-3">
                              {section.items.map((item) => (
                                <MenuLink key={item.href} item={item} onNavigate={closeAll} />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <Link to="/how_it_works" className="flex border-b border-ink/[0.07] py-4 text-lg text-ink">
                    How it works
                  </Link>
                  <Link to="/about" className="flex border-b border-ink/[0.07] py-4 text-lg text-ink">
                    About
                  </Link>
                  <p className="mb-1 mt-6 text-[13px] font-semibold uppercase tracking-[0.12em] text-ink/40">Log in</p>
                  {loginMenu.map((item) => (
                    <MenuLink key={item.href} item={item} onNavigate={closeAll} withDesc />
                  ))}
                </>
              )}
            </nav>
            <div className="container-site sticky bottom-0 grid gap-2 border-t border-ink/[0.07] bg-white py-4">
              {isLoggedIn ? (
                <Link to="/dashboard" className="btn btn-primary btn-lg w-full">
                  Open dashboard
                </Link>
              ) : (
                <>
                  <Link to="/company_register" className="btn btn-primary btn-lg w-full">
                    Create company account
                  </Link>
                  <Link to="/employee_register" className="btn btn-outline btn-lg w-full">
                    Join your team
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Dim + blur the page behind the mega menu */}
      <div
        aria-hidden="true"
        onClick={() => setOpenId(null)}
        className={`fixed inset-0 top-[70px] z-40 bg-ink/10 backdrop-blur-[6px] transition-opacity duration-300 ${
          megaOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
    </>
  );
};

export default Header;
