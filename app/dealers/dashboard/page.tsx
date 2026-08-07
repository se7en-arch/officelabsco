import { redirect } from 'next/navigation';
import { getDealerSession } from '@/lib/dealer-auth';
import { prisma } from '@/lib/prisma';
import { COLOR_VARIANTS } from '@/lib/color-variants';
import DealerNav from '@/components/dealers/DealerNav';
import DealerDashboard from '@/components/dealers/DealerDashboard';

export default async function DashboardPage() {
  const session = await getDealerSession();
  if (!session) redirect('/dealers');
  if (session.status === 'PENDING') redirect('/dealers/pending');
  if (session.status === 'REJECTED') redirect('/dealers');

  const [dealer, products] = await Promise.all([
    prisma.dealer.findUnique({
      where: { id: session.id },
      select: { companyName: true, contactName: true, discountPercent: true },
    }),
    prisma.product.findMany({
      where: { archived: false },
      include: { series: { select: { name: true } }, category: { select: { name: true } } },
      orderBy: [{ seriesId: 'asc' }, { name: 'asc' }],
    }),
  ]);

  if (!dealer) redirect('/dealers');

  const serialized = products.map(p => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    price: p.price,
    image: p.image,
    series: p.series.name,
    category: p.category.name,
    colorVariants: COLOR_VARIANTS[p.slug] ?? null,
  }));

  return (
    <>
      <DealerNav companyName={dealer.companyName} discount={dealer.discountPercent} active="dashboard" />
      <DealerDashboard
        products={serialized}
        discount={dealer.discountPercent}
        companyName={dealer.companyName}
      />
    </>
  );
}
