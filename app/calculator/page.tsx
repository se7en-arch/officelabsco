import { isAdminAuthenticated } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import TableLoginForm from '@/components/table/TableLoginForm';
import CostCalculator from '@/components/calculator/CostCalculator';

export const dynamic = 'force-dynamic';

export default async function CalculatorPage() {
  const auth = await isAdminAuthenticated();

  if (!auth) {
    return <TableLoginForm title="Калкулатор на себестойност" />;
  }

  const [series, saved, vatSetting, products] = await Promise.all([
    prisma.series.findMany({ select: { name: true, materials: true }, orderBy: { name: 'asc' } }),
    prisma.siteSettings.findUnique({ where: { key: 'cost_calculator' } }),
    prisma.siteSettings.findUnique({ where: { key: 'vat_rate' } }),
    prisma.product.findMany({
      where: { archived: false },
      select: { id: true, name: true, series: { select: { name: true } }, category: { select: { name: true } } },
      orderBy: { id: 'asc' },
    }),
  ]);

  const seriesMaterials: Record<string, string[]> = {};
  for (const s of series) {
    if (s.materials) {
      try { seriesMaterials[s.name] = JSON.parse(s.materials); } catch { /* ignore */ }
    }
  }

  let initial = null;
  if (saved) {
    try { initial = JSON.parse(saved.value); } catch { /* ignore */ }
  }

  const productList = products.map(p => ({
    id: p.id,
    name: p.name.trim(),
    seriesName: p.series.name,
    categoryName: p.category.name,
  }));

  // Make sure every shop product has a module card — seed missing ones server-side
  // so the very first render (and any fresh visitor) already sees them, no client round-trip needed.
  if (initial) {
    const existingModules = Array.isArray(initial.modules) ? initial.modules : [];
    const existingIds = new Set(existingModules.filter((m: { productId?: number }) => m.productId != null).map((m: { productId?: number }) => m.productId));
    const missing = productList.filter(p => !existingIds.has(p.id));
    if (missing.length > 0) {
      initial = {
        ...initial,
        modules: [
          ...existingModules,
          ...missing.map(p => ({
            id: `p${p.id}-${Math.random().toString(36).slice(2, 8)}`,
            productId: p.id, name: p.name, seriesName: p.seriesName, categoryName: p.categoryName, qty: {},
          })),
        ],
      };
      await prisma.siteSettings.upsert({
        where: { key: 'cost_calculator' },
        update: { value: JSON.stringify(initial) },
        create: { key: 'cost_calculator', value: JSON.stringify(initial) },
      });
    }
  }

  return (
    <CostCalculator
      initial={initial}
      seriesMaterials={seriesMaterials}
      defaultVat={vatSetting ? parseFloat(vatSetting.value) || 20 : 20}
      products={productList}
    />
  );
}
