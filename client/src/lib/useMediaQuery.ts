import { useEffect, useState } from 'react';

const supported = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function';

/** Tracks a CSS media query. `fallback` is used where matchMedia does not exist (e.g. tests). */
export function useMediaQuery(query: string, fallback = true): boolean {
  const [matches, setMatches] = useState<boolean>(() =>
    supported() ? window.matchMedia(query).matches : fallback
  );

  useEffect(() => {
    if (!supported()) return;
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}
