import React, { useEffect, useLayoutEffect, useRef } from 'react';

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Fades/slides its child in the first time it enters the viewport.
 * Content stays visible when JS is unavailable or the user prefers reduced
 * motion, and it never hides again once revealed.
 */
const Reveal = ({
  as: Tag = 'div',
  delay = 0,
  y = 28,
  scale = 1,
  rootMargin = '0px 0px -10% 0px',
  className = '',
  style,
  children,
  ...rest
}) => {
  const ref = useRef(null);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !('IntersectionObserver' in window)) return undefined;

    el.setAttribute('data-reveal', 'armed');
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          // Next frame so the armed state is painted before transitioning.
          requestAnimationFrame(() => el.setAttribute('data-reveal', 'in'));
          io.disconnect();
        }
      },
      { rootMargin, threshold: 0.01 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        '--reveal-delay': `${delay}ms`,
        '--reveal-y': `${y}px`,
        '--reveal-scale': scale,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export default Reveal;
