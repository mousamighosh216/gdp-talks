import { useEffect, useState, type RefObject } from 'react';

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * 0..1 progress of a tall "sticky" section: 0 when its top reaches the top of the
 * viewport, 1 when its bottom reaches the bottom of the viewport.
 */
export function useScrollProgress(ref: RefObject<HTMLElement>): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const total = el.offsetHeight - window.innerHeight;
      setProgress(total > 0 ? clamp01(-el.getBoundingClientRect().top / total) : 0);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [ref]);

  return progress;
}
