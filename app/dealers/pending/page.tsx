import Link from 'next/link';

export default function DealerPendingPage() {
  return (
    <>
      <style>{`
        .dl-pending-bg {
          position: fixed; inset: 0; z-index: 0;
          background: url('/images/Hero AboutUs 2.webp') center/cover no-repeat;
        }
        .dl-pending-bg::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(145deg, rgba(10,10,10,.82) 0%, rgba(28,28,28,.6) 50%, rgba(245,158,11,.18) 100%);
        }
        .dl-pending-scene {
          position: relative; z-index: 1;
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
        }
        .dl-pending-card {
          width: 100%; max-width: 500px; text-align: center;
          background: rgba(255,255,255,.09);
          backdrop-filter: blur(28px) saturate(1.6);
          -webkit-backdrop-filter: blur(28px) saturate(1.6);
          border: 1px solid rgba(255,255,255,.16);
          border-radius: 28px;
          padding: 48px 40px 40px;
          box-shadow: 0 8px 48px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.18);
        }
        .dl-pending-icon {
          width: 72px; height: 72px; border-radius: 50%;
          background: rgba(245,158,11,.12);
          border: 1px solid rgba(245,158,11,.25);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 24px;
          font-size: 32px;
        }
        .dl-pending-card h1 {
          font-size: 26px; font-weight: 800; letter-spacing: -.04em; color: #fff;
          margin-bottom: 10px;
        }
        .dl-pending-card p {
          font-size: 14px; color: rgba(255,255,255,.5); line-height: 1.65; margin-bottom: 32px;
        }
        .dl-pending-steps {
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 14px; padding: 20px 24px;
          text-align: left; margin-bottom: 28px;
        }
        .dl-pending-steps p {
          font-size: 12px; font-weight: 700; color: rgba(245,158,11,.8);
          text-transform: uppercase; letter-spacing: .08em;
          margin-bottom: 14px;
        }
        .dl-pending-steps ul {
          list-style: none; padding: 0;
        }
        .dl-pending-steps li {
          font-size: 13px; color: rgba(255,255,255,.55); padding: 7px 0;
          border-bottom: 1px solid rgba(255,255,255,.06);
          display: flex; align-items: center; gap: 10px;
        }
        .dl-pending-steps li:last-child { border-bottom: none; }
        .dl-pending-steps li::before {
          content: ''; width: 6px; height: 6px; border-radius: 50%;
          background: rgba(245,158,11,.5); flex-shrink: 0;
        }
        .dl-pending-back {
          font-size: 13px; color: rgba(255,255,255,.35); text-decoration: none;
          transition: color .15s;
        }
        .dl-pending-back:hover { color: rgba(255,255,255,.65); }
      `}</style>

      <div className="dl-pending-bg" />
      <div className="dl-pending-scene">
        <div className="dl-pending-card">
          <div className="dl-pending-icon">⏳</div>
          <h1>Изчаква одобрение</h1>
          <p>
            Вашата заявка за дилърски акаунт е получена. Ще ви уведомим по имейл
            след като акаунтът бъде прегледан и одобрен от нашия екип.
          </p>
          <div className="dl-pending-steps">
            <p>Какво следва?</p>
            <ul>
              <li>Нашият екип преглежда заявката</li>
              <li>Получавате имейл с потвърждение</li>
              <li>Влизате в портала и виждате дилърски цени</li>
              <li>Правите поръчки директно от платформата</li>
            </ul>
          </div>
          <Link href="/dealers" className="dl-pending-back">← Обратно към вход</Link>
        </div>
      </div>
    </>
  );
}
