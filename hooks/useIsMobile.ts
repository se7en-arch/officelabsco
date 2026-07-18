'use client';
import { useEffect, useState } from 'react';

export function useIsMobile(bp = 768) {
  const [v, setV] = useState(false);
  useEffect(() => {
    const fn = () => setV(window.innerWidth < bp);
    fn();
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, [bp]);
  return v;
}
