export function fmtPrice(v: number): string {
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(v % 1_000_000 === 0 ? 0 : 1) + ' млн';
  if (v >= 1_000) return (v / 1_000).toFixed(0) + ' хил';
  return String(v);
}
