import Link from 'next/link';

export default function DealerPendingPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 480, textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 24 }}>⏳</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-.03em', marginBottom: 12 }}>
          Изчаква одобрение
        </h1>
        <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.6, marginBottom: 32 }}>
          Вашата заявка за дилърски акаунт е получена. Ще ви уведомим по имейл след като акаунтът бъде прегледан и одобрен от нашия екип.
        </p>
        <div className="dl-card" style={{ textAlign: 'left', marginBottom: 24 }}>
          <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Какво следва?</p>
          <ul style={{ fontSize: 13, color: '#6B7280', paddingLeft: 20, lineHeight: 2 }}>
            <li>Нашият екип преглежда заявката</li>
            <li>Получавате имейл с потвърждение</li>
            <li>Влизате в портала и виждате дилърски цени</li>
            <li>Правите поръчки директно от платформата</li>
          </ul>
        </div>
        <Link href="/dealers" style={{ color: '#6B7280', fontSize: 13 }}>← Обратно към вход</Link>
      </div>
    </div>
  );
}
