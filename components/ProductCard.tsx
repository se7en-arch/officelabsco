'use client';
import { Link } from '@/i18n/navigation';
import { COLOR_VARIANTS } from '@/lib/color-variants';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
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
  id, name, slug, price, image, seriesName, categoryName, description,
}: Props) {
  const t = useTranslations('product');
  const addItem = useCart((s) => s.addItem);
  const [added, setAdded] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const footerRef = useRef<HTMLDivElement>(null);

  const variants = COLOR_VARIANTS[slug];
  const hasColors = !!variants && variants.length > 0;

  // Close the colour picker when clicking anywhere outside it.
  useEffect(() => {
    if (!pickerOpen) return;
    function onDown(e: MouseEvent) {
      if (footerRef.current && !footerRef.current.contains(e.target as Node)) setPickerOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [pickerOpen]);

  function flashAdded() {
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    // Products with colours: open the picker, never add without a colour.
    if (hasColors) {
      setPickerOpen((o) => !o);
      return;
    }
    addItem({ id, name, slug, price, image, seriesName, categoryName });
    flashAdded();
  }

  // Colour picked: add that colour with its own photo.
  function handlePick(e: React.MouseEvent, variant: { name: string; images: string[] }) {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id, name, slug, price, seriesName, categoryName,
      image: variant.images[0] ?? image,
      selectedColor: variant.name,
    });
    setPickerOpen(false);
    flashAdded();
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
      </div>

      <div className="card__body">
        <div className="card__name">{name}</div>
        <div className="card__cat">{categoryName}</div>
        {description && <p className="card__desc">{description}</p>}

        <div className="card__footer" ref={footerRef}>
          <div className="card__price-pill">
            {price} €
          </div>
          <button
            className={`card__buy-btn${added ? ' card__buy-btn--added' : ''}`}
            onClick={handleAdd}
          >
            <span className="card__buy-btn__default">{t('addShort')}</span>
            <span className="card__buy-btn__success">{t('addedShort')}</span>
          </button>

          {hasColors && pickerOpen && (
            <div className="card__color-pop" role="menu">
              <div className="card__color-pop__title">{t('pickColor')}</div>
              {variants.map((v, i) => (
                <button
                  key={v.name}
                  type="button"
                  role="menuitem"
                  className="card__color-opt"
                  style={{ animationDelay: `${i * 70}ms` }}
                  onClick={(e) => handlePick(e, v)}
                >
                  <span className="card__color-opt__dot" style={{ background: v.color }} />
                  <span>{v.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
