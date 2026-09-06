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

  const [series, saved, vatSetting] = await Promise.all([
    prisma.series.findMany({ select: { name: true, materials: true }, orderBy: { name: 'asc' } }),
    prisma.siteSettings.findUnique({ where: { key: 'cost_calculator' } }),
    prisma.siteSettings.findUnique({ where: { key: 'vat_rate' } }),
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

  return (
    <CostCalculator
      initial={initial}
      seriesMaterials={seriesMaterials}
      defaultVat={vatSetting ? parseFloat(vatSetting.value) || 20 : 20}
    />
  );
}
