import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

function IconInstagram() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}

export default async function Footer() {
  const t = await getTranslations('footer');

  return (
    <footer>
      <div className="ftr__top">
        <div>
          <div className="ftr__logo">OfficeLabs Co</div>
          <p className="ftr__tagline">{t('tagline')}</p>
        </div>

        <div className="ftr__col">
          <p className="ftr__col-title">{t('aboutUs')}</p>
          <ul>
            <li><Link href="/about">{t('aboutUs')}</Link></li>
            <li><Link href="/contact">{t('contacts')}</Link></li>
          </ul>
        </div>

        <div className="ftr__col">
          <p className="ftr__col-title">{t('support')}</p>
          <ul>
            <li><Link href="/terms#delivery">{t('delivery')}</Link></li>
            <li><Link href="/terms#returns">{t('returns')}</Link></li>
            <li><Link href="/faq">{t('faq')}</Link></li>
          </ul>
        </div>

        <div className="ftr__social">
          <p className="ftr__col-title">{t('social')}</p>
          <div className="ftr__social-icons">
            <a href="https://www.instagram.com/officelabsco/" target="_blank" rel="noopener noreferrer" className="ftr__soc-btn" aria-label="Instagram"><IconInstagram /></a>
          </div>
        </div>
      </div>

      <div className="ftr__btm">
        <span className="ftr__copy">{t('copyright')}</span>
        <div className="ftr__legal">
          <Link href="/terms">{t('terms')}</Link>
          <Link href="/privacy">{t('privacy')}</Link>
        </div>
      </div>
    </footer>
  );
}
