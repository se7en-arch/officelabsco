import { prisma } from '@/lib/prisma';

export async function GET() {
  const series = await prisma.series.findMany({ orderBy: { id: 'asc' } });
  return Response.json(series);
}
