'use client';
import { useEffect, useRef } from 'react';

export default function AnimatedGrid({
  animKey,
  children,
}: {
  animKey: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.remove('products-fade');
    void el.offsetWidth; // force reflow
    el.classList.add('products-fade');
  }, [animKey]);

  return (
    <div ref={ref} className="products-fade">
      {children}
    </div>
  );
}
