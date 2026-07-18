import Image from 'next/image';
import Link from 'next/link';
import type { Property } from '@/types';
import BookmarkButton from './BookmarkButton';

interface Props {
  property: Property;
  id?: string;
}

export default function PropertyCard({ property, id = '1' }: Props) {
  return (
    <div className="card">
      <Link href={`/property/${id}`} style={{ display: 'contents' }}>
        <div className="card__img">
          <Image
            src={`/images/${property.img}`}
            alt={property.type}
            fill
            sizes="300px"
            style={{ objectFit: 'cover' }}
            loading="lazy"
          />
        </div>
        <div className="card__body">
          <div>
            <div className="card__type">{property.type}</div>
            <div className="card__desc">{property.desc}</div>
          </div>
          <div className="card__ft">
            <span className="card__price">{property.price} €</span>
          </div>
        </div>
      </Link>
      <div style={{ position: 'absolute', bottom: 14, right: 14, zIndex: 2 }}>
        <BookmarkButton />
      </div>
    </div>
  );
}
