import { prisma } from '@/lib/prisma';
import SettingsForm from '@/components/admin/SettingsForm';
import SellerForm from '@/components/admin/SellerForm';
import { getSeller } from '@/lib/seller';

export default async function SettingsPage() {
  const rows = await prisma.siteSettings.findMany();
  const settings: Record<string, string> = {};
  for (const r of rows) settings[r.key] = r.value;
  const seller = await getSeller();

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>Настройки</h1>
          <p>SEO, съдържание и достъп</p>
        </div>
      </div>
      <SettingsForm initialSettings={settings} />
      <SellerForm initial={seller} />
    </>
  );
}
