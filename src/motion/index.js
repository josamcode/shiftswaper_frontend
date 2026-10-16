import { useEffect, useLayoutEffect, useRef, useState } from 'react';

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
export const lerp = (a, b, t) => a + (b - a) * t;
/** Maps `v` from [a, b] into [0, 1], clamped. */
export const range = (v, a, b) => clamp((v - a) / (b - a));
export const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
export const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(prefersReducedMotion);
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return undefined;
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);
  return reduced;
}

export function useMediaQuery(query) {
  const get = () => typeof window !== 'undefined' && !!window.matchMedia?.(query).matches;
  const [matches, setMatches] = useState(get);
  useEffect(() => {
    const mq = window.matchMedia?.(query);
    if (!mq) return undefined;
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, [query]);
  return matches;
}

/**
 * Calls `onProgress(p, rect)` on every animation frame in which the page
 * scrolled or resized. `p` is 0 when the element's top hits `startOffset`
 * (px from viewport top) and 1 when its bottom reaches the viewport bottom,
 * which is the natural range of a sticky "scroll track".
 *
 * Writes happen inside the callback (usually CSS variables / transforms),
 * so React never re-renders while scrolling.
 */
export function useScrollProgress(ref, onProgress, { startOffset = 0, enabled = true } = {}) {
  const cb = useRef(onProgress);
  cb.current = onProgress;

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return undefined;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height - (vh - startOffset);
      const p = total <= 0 ? (rect.top <= startOffset ? 1 : 0) : clamp((startOffset - rect.top) / total);
      cb.current(p, rect);
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', request);
      window.removeEventListener('resize', request);
    };
  }, [ref, startOffset, enabled]);
}

/**
 * Viewport-relative progress for a normal (non-sticky) element:
 * 0 when its top enters the bottom of the viewport, 1 when its top reaches
 * `endFraction` of the viewport height.
 */
export function useEnterProgress(ref, onProgress, { endFraction = 0.35, enabled = true } = {}) {
  const cb = useRef(onProgress);
  cb.current = onProgress;
  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return undefined;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      cb.current(clamp((vh - rect.top) / (vh * (1 - endFraction))), rect);
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', request);
      window.removeEventListener('resize', request);
    };
  }, [ref, endFraction, enabled]);
}

/** True once the element has entered the viewport (never flips back). */
export function useInViewOnce(ref, { rootMargin = '0px 0px -12% 0px', threshold = 0.15 } = {}) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return undefined;
    if (!('IntersectionObserver' in window)) {
      setInView(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin, threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin, threshold, inView]);
  return inView;
}

/** Live visibility (flips both ways) — used to pause looping vignettes offscreen. */
export function useInView(ref, { rootMargin = '0px', threshold = 0 } = {}) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (!('IntersectionObserver' in window)) {
      setInView(true);
      return undefined;
    }
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin, threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin, threshold]);
  return inView;
}

/**
 * Cycles 0..count-1 every `interval` ms while `active`.
 * Returns [index, setIndex].
 */
export function useAutoCycle(count, interval, active = true) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!active || count < 2) return undefined;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), interval);
    return () => clearInterval(id);
  }, [count, interval, active, index]);
  return [index, setIndex];
}

export { default as Reveal } from './Reveal';
