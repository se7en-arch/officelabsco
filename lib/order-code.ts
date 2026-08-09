import { prisma } from './prisma';

function reverseStr(s: string) {
  return s.split('').reverse().join('');
}

/** Build the order code from a date and daily sequence number.
 *  Format: [year reversed][month reversed][day reversed][seq 2-digit]
 *  Example: 09.08.2026, seq 1 → 6202809001
 */
export function buildOrderCode(date: Date, dailySeq: number): string {
  const y   = reverseStr(String(date.getUTCFullYear()));
  const m   = reverseStr(String(date.getUTCMonth() + 1).padStart(2, '0'));
  const d   = reverseStr(String(date.getUTCDate()).padStart(2, '0'));
  const seq = String(dailySeq).padStart(2, '0');
  return y + m + d + seq;
}

/** Generate the next order code for right now (queries DB for today's count). */
export async function generateOrderCode(now = new Date()): Promise<string> {
  const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const endOfDay   = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));

  const [customerCount, dealerCount] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: startOfDay, lt: endOfDay } } }),
    prisma.dealerOrder.count({ where: { createdAt: { gte: startOfDay, lt: endOfDay } } }),
  ]);

  const dailySeq = customerCount + dealerCount + 1;
  return buildOrderCode(now, dailySeq);
}

/** Display helper — prepends # */
export function fmtCode(orderCode: string | null | undefined): string {
  return orderCode ? `#${orderCode}` : '—';
}
