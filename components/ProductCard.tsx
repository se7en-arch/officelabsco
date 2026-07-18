'use client';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { useState } from 'react';
import { useCart } from '@/lib/cart-store';
import { useTranslations } from 'next-intl';

type Props = {
  id: number;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number | null;
  image: string;
  badge?: string | null;
  seriesName: string;
  categoryName: string;
  description?: string | null;
  stock?: number;
};

export default function ProductCard({
  id, name, slug, price, originalPrice, image, badge, seriesName, categoryName, description, stock = 1,
}: Props) {
  const t = useTranslations('product');
  const addItem = useCart((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const outOfStock = stock === 0;

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    if (outOfStock) return;
    addItem({ id, name, slug, price, image, seriesName, categoryName });
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  return (
    <Link href={`/shop/${slug}`} className="card">
      <div className="card__img">
        <Image
          src={image}
          alt={name}
          fill
          style={{ objectFit: 'contain', padding: '20px' }}
          sizes="(max-width: 600px) 100vw, (max-width: 1100px) 50vw, 33vw"
        />
        <span className="card__badge-series">{seriesName}</span>
        {badge && (
          <span className={`card__badge-promo${badge === 'SALE' ? '' : ' card__badge-new'}`}>
            {badge}
          </span>
        )}
      </div>

      <div className="card__body">
        <div className="card__name">{name}</div>
        <div className="card__cat">{categoryName}</div>
        {description && <p className="card__desc">{description}</p>}

        <div className={`card__stock${stock === 0 ? ' card__stock--out' : stock <= 3 ? ' card__stock--limited' : ''}`}>
          <span className="card__stock-dot" />
          {stock === 0 ? t('outOfStock') : stock <= 3 ? t('limitedStock') : t('inStock')}
        </div>

        <div className="card__footer">
          <div className="card__price-pill">
            {price} €
            {originalPrice && (
              <span className="card__price-orig">{originalPrice} €</span>
            )}
          </div>
          <button
            className={`card__buy-btn${added ? ' card__buy-btn--added' : ''}${outOfStock ? ' card__buy-btn--out' : ''}`}
            onClick={handleAdd}
            disabled={outOfStock}
            aria-disabled={outOfStock}
          >
            <span className="card__buy-btn__default">{outOfStock ? t('outOfStock') : `${t('addShort')} +`}</span>
            <span className="card__buy-btn__success">{t('addedShort')}</span>
          </button>
        </div>
      </div>
    </Link>
  );
}
