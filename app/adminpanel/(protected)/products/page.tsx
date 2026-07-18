import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import ProductsTable from '@/components/admin/ProductsTable';

export default async function ProductsPage() {
  const [allProducts, allSeries, allCategories] = await Promise.all([
    prisma.product.findMany({
      include: { series: true, category: true },
      orderBy: { name: 'asc' },
    }),
    prisma.series.findMany({ orderBy: { name: 'asc' } }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ]);

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>Продукти</h1>
          <p>Управление на инвентара — {allProducts.length} продукта</p>
        </div>
        <Link href="/adminpanel/products/new" className="admin-action-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Нов продукт
        </Link>
      </div>

      <div className="admin-card">
        <div className="admin-card__body">
          <ProductsTable products={allProducts} series={allSeries} categories={allCategories} />
        </div>
      </div>
    </>
  );
}
