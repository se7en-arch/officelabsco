import { prisma } from '@/lib/prisma';
import ReviewsManager from '@/components/admin/ReviewsManager';

export const dynamic = 'force-dynamic';

export default async function ReviewsPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
    include: { product: { select: { id: true, name: true, slug: true } } },
  });

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Рецензии</h1>
          <p className="admin-page__subtitle">{reviews.length} рецензии общо</p>
        </div>
      </div>
      <ReviewsManager initialReviews={reviews} />
    </div>
  );
}
