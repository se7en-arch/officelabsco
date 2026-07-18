const KEY = 'fairspace_listings';

export interface PublishedListing {
  id: string;
  type: string;
  desc: string;
  price: number;
  img: string;
  city: string;
  district: string;
  dealType: string;
  area: string;
  rooms: string;
  createdAt: number;
}

export function getListings(): PublishedListing[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function addListing(data: Omit<PublishedListing, 'id' | 'createdAt'>): PublishedListing {
  const listing: PublishedListing = {
    ...data,
    id: Math.random().toString(36).slice(2),
    createdAt: Date.now(),
  };
  const all = getListings();
  localStorage.setItem(KEY, JSON.stringify([listing, ...all]));
  return listing;
}
