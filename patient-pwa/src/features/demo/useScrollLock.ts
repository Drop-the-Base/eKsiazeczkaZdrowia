import { useEffect } from 'react';

/** Elements that may still scroll while the page is locked: the guide's card and open sheets. */
const SCROLLABLE = '[data-allow-scroll], [role="dialog"]';

/**
 * Freezes the page under the guide. The guide itself scrolls the lit element into place (programmatic
 * scrolling still works under `overflow: hidden`); the visitor's wheel and touch scrolling does not.
 */
export function useScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    const { documentElement: html, body } = document;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    const block = (e: Event) => {
      if (!(e.target instanceof Element) || !e.target.closest(SCROLLABLE)) e.preventDefault();
    };
    document.addEventListener('wheel', block, { passive: false });
    document.addEventListener('touchmove', block, { passive: false });
    return () => {
      html.style.overflow = '';
      body.style.overflow = '';
      document.removeEventListener('wheel', block);
      document.removeEventListener('touchmove', block);
    };
  }, [active]);
}
