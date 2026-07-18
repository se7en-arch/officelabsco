import { prisma } from '@/lib/prisma';
import CategoriesManager from '@/components/admin/CategoriesManager';

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  });

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>Категории</h1>
          <p>Управление на категориите — {categories.length} категории</p>
        </div>
      </div>
      <CategoriesManager initialCategories={categories} />
    </>
  );
}
