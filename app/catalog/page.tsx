import { isAdminAuthenticated } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import TableLoginForm from '@/components/table/TableLoginForm';
import CatalogGenerator from '@/components/catalog/CatalogGenerator';

export const dynamic = 'force-dynamic';

export default async function CatalogPage() {
  const auth = await isAdminAuthenticated();

  if (!auth) {
    return <TableLoginForm />;
  }

  const [products, seriesList] = await Promise.all([
    prisma.product.findMany({
      where: { archived: false },
      include: { series: true, category: true },
      orderBy: [{ seriesId: 'asc' }, { name: 'asc' }],
    }),
    prisma.series.findMany({ orderBy: { id: 'asc' } }),
  ]);

  const serialized = products.map(p => ({
    id: p.id,
    name: p.name,
    nameEn: p.nameEn ?? null,
    sku: p.sku ?? null,
    price: p.price,
    description: p.description,
    descriptionEn: p.descriptionEn ?? null,
    dimensions: p.dimensions ?? null,
    weight: p.weight ?? null,
    colors: p.colors ?? null,
    colorsEn: p.colorsEn ?? null,
    material: p.material ?? null,
    materialEn: p.materialEn ?? null,
    image: p.image,
    images: (() => { try { return JSON.parse(p.images) as string[]; } catch { return [] as string[]; } })(),
    series: p.series.name,
    seriesSlug: p.series.slug,
    seriesColor: p.series.color,
    category: p.category.name,
    categoryEn: p.category.nameEn ?? null,
  }));

  const serializedSeries = seriesList.map(s => ({
    name: s.name,
    slug: s.slug,
    tagline: s.tagline,
    taglineEn: s.taglineEn ?? s.tagline,
    color: s.color,
  }));

  return <CatalogGenerator products={serialized} seriesList={serializedSeries} />;
}
