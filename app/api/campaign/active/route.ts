import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { getActiveCampaignPromo } from '@/lib/campaign-badge';

export const dynamic = 'force-dynamic';

// Polled once per visit (see CampaignAutoApply) to auto-apply the running
// campaign's discount to the cart, without requiring the visitor to see
// the popup or type the code themselves.
const getCached = unstable_cache(getActiveCampaignPromo, ['campaign-active-promo'], { revalidate: 60 });

export async function GET() {
  const promo = await getCached();
  return NextResponse.json(promo ?? { code: null, discountPercent: 0 });
}
