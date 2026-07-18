import { prisma } from '@/lib/prisma';
import SeriesManager from '@/components/admin/SeriesManager';

export default async function SeriesPage() {
  const series = await prisma.series.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  });

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>Серии</h1>
          <p>Управление на колекциите — {series.length} серии</p>
        </div>
      </div>
      <SeriesManager initialSeries={series} />
    </>
  );
}
