import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import EditProductForm from '@/components/admin/EditProductForm';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, allSeries, allCategories] = await Promise.all([
    prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: { series: true, category: true },
    }),
    prisma.series.findMany({ orderBy: { name: 'asc' } }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ]);

  if (!product) notFound();

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>Редактирай продукт</h1>
          <p>{product.name}</p>
        </div>
      </div>
      <EditProductForm
        product={{
          id: product.id,
          name: product.name,
          nameEn: product.nameEn ?? null,
          slug: product.slug,
          sku: product.sku ?? '',
          description: product.description,
          descriptionEn: product.descriptionEn ?? null,
          price: product.price,
          originalPrice: product.originalPrice ?? null,
          stock: product.stock,
          badge: product.badge ?? '',
          featured: product.featured,
          archived: product.archived,
          image: product.image,
          images: product.images,
          seriesId: product.seriesId,
          categoryId: product.categoryId,
          dimensions: product.dimensions ?? null,
          weight: product.weight ?? null,
          colors: product.colors ?? null,
          colorsEn: product.colorsEn ?? null,
          material: product.material ?? null,
          materialEn: product.materialEn ?? null,
        }}
        series={allSeries}
        categories={allCategories}
      />
    </>
  );
}
