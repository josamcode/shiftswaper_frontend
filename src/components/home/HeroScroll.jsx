import React, { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import {
  easeInOutCubic,
  easeOutCubic,
  lerp,
  range,
  Reveal,
  useMediaQuery,
  useReducedMotion,
  useScrollProgress,
} from '../../motion';
import { PEOPLE, PersonBust, PersonTile } from '../product/People';
import { ApprovalCard, EmailMock, PhoneDashboardMock, PhoneFrame, SwapBoardMock } from '../product/Mockups';
import { HeroArcs } from '../marketing/Sections';

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const HEADLINE = 'Shift swaps your whole team can count on';
const LEAD =
  'Shiftswaper gives employees one place to request, offer and accept shift and day-off swaps — and gives supervisors the final say before anything changes.';

/*
 * Tile layout, mirrored left/right like the reference: inner tiles sit on the
 * top and bottom rows, outer tiles on the middle rows so they never cross the
 * headline. `dx`/`dy` is the direction each tile drifts as the page scrolls.
 */
const TILES = [
  { person: 0, side: 'L', col: 'inner', row: 0, dx: -0.6, dy: -1, chip: null },
  { person: 1, side: 'L', col: 'outer', row: 1, dx: -1, dy: -0.4, chip: 'Supervisor' },
  { person: 2, side: 'L', col: 'outer', row: 2, dx: -1, dy: 0.1, chip: null },
  { person: 3, side: 'L', col: 'inner', row: 3, dx: -0.7, dy: 0.5, chip: 'Day off ↔' },
  { person: 4, side: 'R', col: 'inner', row: 0, dx: 0.6, dy: -1, chip: 'Offer sent' },
  { person: 5, side: 'R', col: 'outer', row: 1, dx: 1, dy: -0.4, chip: null },
  { person: 6, side: 'R', col: 'outer', row: 2, dx: 1, dy: 0.1, chip: 'Approved ✓' },
];
const FEATURED = { person: 7, side: 'R', col: 'inner', row: 3 };
const ROWS = [0.07, 0.31, 0.545, 0.775];
const DESIGN_W = 1120;

const Ctas = ({ className = '' }) => (
  <div className={`flex flex-col items-center justify-center gap-3 sm:flex-row ${className}`}>
    <Link to="/company_register" className="btn btn-primary btn-lg btn-arrow w-full sm:w-auto">
      Create a company account <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </Link>
    <Link to="/employee_register" className="btn btn-outline btn-lg w-full sm:w-auto">
      Join your company
    </Link>
  </div>
);

/* ------------------------------------------------------------------ */
/* Desktop / tablet: pinned, scroll-scrubbed composition               */
/* ------------------------------------------------------------------ */
const PinnedHero = () => {
  const trackRef = useRef(null);
  const stageRef = useRef(null);
  const textRef = useRef(null);
  const tileRefs = useRef([]);
  const featRef = useRef(null);
  const featFaceRef = useRef(null);
  const featUiRef = useRef(null);
  const featUiInnerRef = useRef(null);
  const overlayRefs = useRef([]);
  const hintRef = useRef(null);
  const geo = useRef(null);
  const progress = useRef(0);

  const measure = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const W = stage.clientWidth;
    const H = stage.clientHeight;
    const gutter = W < 640 ? 20 : 24;
    const T = Math.round(Math.max(84, Math.min(158, W * 0.083, H * 0.19)));
    const outerX = Math.max(gutter, W * 0.045);
    const innerX = Math.max(outerX + T * 0.55, W * 0.135);
    const colX = (side, col) => {
      const x = col === 'outer' ? outerX : innerX;
      return side === 'L' ? x : W - x - T;
    };
    const rowY = (row) => Math.round(ROWS[row] * (H - T) + (row === 0 ? 4 : 0));

    const content = Math.min(W - gutter * 2, 1320);
    const margin = Math.max(40, H * 0.08);
    let endW = Math.min(content * 0.84, 1100);
    let endH = endW * 0.58;
    if (endH > H - margin * 2) {
      endH = H - margin * 2;
      endW = Math.min(endH / 0.58, content);
    }
    const endX = (W - endW) / 2;
    const endY = (H - endH) / 2;

    geo.current = {
      W,
      H,
      T,
      tiles: TILES.map((t) => ({ x: colX(t.side, t.col), y: rowY(t.row) })),
      feat: { x: colX(FEATURED.side, FEATURED.col), y: rowY(FEATURED.row) },
      end: { x: endX, y: endY, w: endW, h: endH },
    };

    // Static placement (left/top) once per resize; per-frame work is transforms only.
    tileRefs.current.forEach((el, i) => {
      if (!el) return;
      const { x, y } = geo.current.tiles[i];
      el.style.width = `${T}px`;
      el.style.height = `${T}px`;
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
    });
    // The window UI is laid out at a fixed design width and scaled to fit, so
    // it reads as the same crisp miniature at every viewport size.
    if (featUiInnerRef.current) {
      const designW = Math.max(endW, DESIGN_W);
      const scale = endW / designW;
      featUiInnerRef.current.style.width = `${designW}px`;
      featUiInnerRef.current.style.height = `${endH / scale}px`;
      featUiInnerRef.current.style.transform = `translateX(-50%) scale(${scale})`;
    }
    const [o1, o2] = overlayRefs.current;
    if (o1) {
      o1.style.left = `${Math.max(gutter, endX - 44)}px`;
      o1.style.top = `${endY + endH * 0.56}px`;
    }
    if (o2) {
      const w = 336;
      o2.style.width = `${w}px`;
      o2.style.left = `${Math.min(W - w - gutter, endX + endW - w + 56)}px`;
      o2.style.top = `${Math.min(endY + endH - 150, H - 230)}px`;
    }
  }, []);

  const render = useCallback((p) => {
    progress.current = p;
    const g = geo.current;
    if (!g) return;

    // Headline drifts up and fades first.
    const tText = range(p, 0, 0.26);
    if (textRef.current) {
      textRef.current.style.opacity = String(1 - easeOutCubic(range(p, 0.02, 0.2)));
      textRef.current.style.transform = `translate3d(0, ${-easeOutCubic(tText) * 140}px, 0)`;
    }
    if (hintRef.current) hintRef.current.style.opacity = String(1 - range(p, 0, 0.06));

    // Portrait tiles drift outward and up, then fade.
    const tTiles = easeOutCubic(range(p, 0.0, 0.42));
    const fade = range(p, 0.16, 0.38);
    tileRefs.current.forEach((el, i) => {
      if (!el) return;
      const t = TILES[i];
      const dist = g.W * 0.16;
      el.style.transform = `translate3d(${t.dx * dist * tTiles}px, ${(t.dy * 0.5 - 0.9) * dist * tTiles}px, 0) scale(${1 - 0.12 * tTiles})`;
      el.style.opacity = String(1 - fade);
    });

    // The featured tile grows into the product window.
    const f = easeInOutCubic(range(p, 0.06, 0.6));
    const s = g.feat;
    const e = g.end;
    const feat = featRef.current;
    if (feat) {
      feat.style.left = `${lerp(s.x, e.x, f)}px`;
      feat.style.top = `${lerp(s.y, e.y, f)}px`;
      feat.style.width = `${lerp(g.T, e.w, f)}px`;
      feat.style.height = `${lerp(g.T, e.h, f)}px`;
      feat.style.borderRadius = `${lerp(18, 24, f)}px`;
    }
    if (featFaceRef.current) featFaceRef.current.style.opacity = String(1 - range(f, 0.12, 0.42));
    if (featUiRef.current) featUiRef.current.style.opacity = String(range(f, 0.22, 0.55));

    // Floating context cards land once the window has opened.
    overlayRefs.current.forEach((el, i) => {
      if (!el) return;
      const t = easeOutCubic(range(p, 0.6 + i * 0.05, 0.76 + i * 0.05));
      el.style.opacity = String(t);
      el.style.transform = `translate3d(0, ${(1 - t) * 36}px, 0)`;
    });
  }, []);

  useIsoLayoutEffect(() => {
    measure();
    render(progress.current);
    const onResize = () => {
      measure();
      render(progress.current);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [measure, render]);

  useScrollProgress(trackRef, render, { startOffset: 70 });

  return (
    <section ref={trackRef} className="relative h-[260vh] bg-canvas" aria-labelledby="hero-title">
      <div ref={stageRef} className="sticky top-[70px] h-[calc(100vh-70px)] min-h-[560px] overflow-hidden">
        <HeroArcs />

        {/* Headline */}
        <div ref={textRef} className="absolute inset-0 z-10 flex items-center justify-center will-change-transform">
          <div className="mx-auto max-w-[540px] px-4 text-center lg:max-w-[760px] xl:max-w-[940px]">
            <h1 id="hero-title" className="hero-title font-display text-ink animate-fade-up">
              {HEADLINE}
            </h1>
            <p className="type-lead mx-auto mt-6 max-w-[620px] animate-fade-up [animation-delay:120ms]">{LEAD}</p>
            <div className="animate-fade-up [animation-delay:220ms]">
              <Ctas className="mt-9" />
            </div>
          </div>
        </div>

        {/* Portrait tiles */}
        {TILES.map((t, i) => (
          <div
            key={t.person}
            ref={(el) => (tileRefs.current[i] = el)}
            className="absolute will-change-transform"
            aria-hidden="true"
          >
            <div className="h-full w-full animate-scale-in" style={{ animationDelay: `${120 + i * 60}ms` }}>
              <PersonTile person={PEOPLE[t.person]} chip={t.chip} className="h-full w-full shadow-soft" rounded="rounded-[18px]" />
            </div>
          </div>
        ))}

        {/* Featured tile → product window */}
        <div
          ref={featRef}
          className="absolute z-20 overflow-hidden bg-white shadow-float"
          style={{ contain: 'layout paint' }}
        >
          <div ref={featUiRef} className="absolute inset-0 opacity-0">
            <div ref={featUiInnerRef} className="absolute left-1/2 top-0 origin-top">
              <SwapBoardMock dense className="h-full !rounded-none !border-0 !shadow-none" />
            </div>
          </div>
          <div ref={featFaceRef} className="absolute inset-0" style={{ background: PEOPLE[FEATURED.person].bg }} aria-hidden="true">
            <PersonBust person={PEOPLE[FEATURED.person]} />
          </div>
        </div>

        {/* Context cards */}
        <div ref={(el) => (overlayRefs.current[0] = el)} className="absolute z-30 opacity-0" aria-hidden="true">
          <EmailMock title="New offer on your request" tone="brand" className="w-[260px]" />
        </div>
        <div ref={(el) => (overlayRefs.current[1] = el)} className="absolute z-30 opacity-0" aria-hidden="true">
          <ApprovalCard className="shadow-float" decided="approved" />
        </div>

        {/* Scroll hint */}
        <div ref={hintRef} className="absolute inset-x-0 bottom-5 z-10 flex justify-center" aria-hidden="true">
          <span className="flex h-9 w-6 justify-center rounded-full border-2 border-ink/20 pt-1.5">
            <span className="h-2 w-1 animate-bounce rounded-full bg-ink/40" />
          </span>
        </div>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/* Mobile & reduced motion: static, intentionally composed              */
/* ------------------------------------------------------------------ */
const StaticHero = ({ wide }) => (
  <section className="relative overflow-hidden bg-canvas" aria-labelledby="hero-title">
    <HeroArcs className="top-[32%]" />
    <div className="container-site relative pb-16 pt-10 text-center sm:pt-14">
      <div className="mx-auto mb-8 flex max-w-[360px] items-end justify-center gap-2.5" aria-hidden="true">
        {[
          { p: 1, size: 'h-[84px] w-[84px]', chip: null, delay: 60 },
          { p: 4, size: 'h-[104px] w-[104px]', chip: 'Offer sent', delay: 0 },
          { p: 6, size: 'h-[84px] w-[84px]', chip: null, delay: 120 },
        ].map((t) => (
          <div key={t.p} className="animate-scale-in" style={{ animationDelay: `${t.delay}ms` }}>
            <PersonTile person={PEOPLE[t.p]} chip={t.chip} className={`${t.size} shadow-soft`} rounded="rounded-2xl" />
          </div>
        ))}
      </div>
      <h1 id="hero-title" className="hero-title mx-auto max-w-[15ch] font-display text-ink animate-fade-up">
        {HEADLINE}
      </h1>
      <p className="type-lead mx-auto mt-5 max-w-[560px] animate-fade-up [animation-delay:100ms]">{LEAD}</p>
      <div className="animate-fade-up [animation-delay:180ms]">
        <Ctas className="mx-auto mt-8 max-w-[420px]" />
      </div>

      <Reveal className="relative mx-auto mt-14 max-w-[1100px]" y={40}>
        {wide ? (
          <SwapBoardMock />
        ) : (
          <div className="relative mx-auto w-fit">
            <PhoneFrame className="h-[520px] w-[260px]">
              <PhoneDashboardMock />
            </PhoneFrame>
            <div className="absolute -left-5 top-16 w-[180px] animate-float min-[400px]:-left-10 min-[400px]:w-[200px] sm:-left-24 sm:w-[230px]" aria-hidden="true">
              <EmailMock title="New offer on your request" tone="brand" className="!p-2.5" />
            </div>
            <div className="absolute -right-3 bottom-24 min-[400px]:-right-8 sm:-right-20" aria-hidden="true">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-2 text-[12px] font-semibold text-white shadow-lift">
                <Check className="h-3.5 w-3.5 text-mint-300" aria-hidden="true" /> Swap approved
              </span>
            </div>
          </div>
        )}
      </Reveal>
    </div>
  </section>
);

const HeroScroll = () => {
  const isTabletUp = useMediaQuery('(min-width: 768px)');
  const isDesktop = useMediaQuery('(min-width: 1024px) and (min-height: 560px)');
  const reduced = useReducedMotion();
  if (isDesktop && !reduced) return <PinnedHero />;
  return <StaticHero wide={isTabletUp} />;
};

export default HeroScroll;
