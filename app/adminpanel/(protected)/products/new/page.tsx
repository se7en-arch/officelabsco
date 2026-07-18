import { prisma } from '@/lib/prisma';
import NewProductForm from '@/components/admin/NewProductForm';

export default async function NewProductPage() {
  const [series, categories] = await Promise.all([
    prisma.series.findMany({ orderBy: { name: 'asc' } }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ]);

  return (
    <>
      <div className="admin-page-header">
        <h1>Нов продукт</h1>
        <p>Попълни данните за новия артикул</p>
      </div>
      <NewProductForm series={series} categories={categories} />
    </>
  );
}
