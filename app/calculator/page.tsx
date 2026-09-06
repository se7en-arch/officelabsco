import { isAdminAuthenticated } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import TableLoginForm from '@/components/table/TableLoginForm';
import CostCalculator from '@/components/calculator/CostCalculator';
import { COLOR_VARIANTS } from '@/lib/color-variants';
import { buildModuleSeeds, reconcileModules } from '@/lib/calculator-modules';

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
      select: { id: true, name: true, slug: true, series: { select: { name: true } }, category: { select: { name: true } } },
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

  // One module card per product — or one per color for products with multiple
  // color variants (see lib/color-variants.ts), so each color can be costed separately.
  const moduleSeeds = buildModuleSeeds(
    products.map(p => ({ id: p.id, name: p.name.trim(), slug: p.slug, seriesName: p.series.name, categoryName: p.category.name })),
    COLOR_VARIANTS,
  );

  // Reconcile server-side so the very first render (and any fresh visitor) already
  // sees the right cards, no client round-trip needed.
  if (initial) {
    const existingModules = Array.isArray(initial.modules) ? initial.modules : [];
    const { modules, changed } = reconcileModules(existingModules, moduleSeeds);
    if (changed) {
      initial = { ...initial, modules };
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
      moduleSeeds={moduleSeeds}
    />
  );
}
