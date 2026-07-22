import { isAdminAuthenticated } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import TableLoginForm from '@/components/table/TableLoginForm';
import ProductTable from '@/components/table/ProductTable';

export const dynamic = 'force-dynamic';

export default async function TablePage() {
  const auth = await isAdminAuthenticated();

  if (!auth) {
    return <TableLoginForm />;
  }

  const products = await prisma.product.findMany({
    include: { series: true, category: true },
    orderBy: { id: 'asc' },
  });

  const serialized = products.map(p => ({
    id: p.id,
    name: p.name,
    sku: p.sku ?? '',
    price: p.price,
    costPrice: p.costPrice ?? null,
    description: p.description,
    stock: p.stock,
    has3dModel: p.has3dModel,
    hasDrawing: p.hasDrawing,
    hasVisualization: p.hasVisualization,
    series: p.series.name,
    seriesColor: p.series.color,
    category: p.category.name,
  }));

  return <ProductTable products={serialized} />;
}
