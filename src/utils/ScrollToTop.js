import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const HEADER_OFFSET = 86;

/**
 * Resets scroll on navigation. If the URL carries a hash, scrolls that
 * element into view below the sticky header once it has rendered.
 */
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      let tries = 0;
      let timer;
      const tryScroll = () => {
        const el = document.getElementById(decodeURIComponent(hash.slice(1)));
        if (el) {
          const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || HEADER_OFFSET;
          const top = el.getBoundingClientRect().top + window.scrollY - margin;
          window.scrollTo({ top, left: 0, behavior: 'smooth' });
        } else if (tries++ < 20) {
          timer = setTimeout(tryScroll, 50);
        }
      };
      tryScroll();
      return () => clearTimeout(timer);
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    return undefined;
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
