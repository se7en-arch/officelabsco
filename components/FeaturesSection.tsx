export default function FeaturesSection() {
  return (
    <section className="feats">
      <div className="feats__in">
        <div className="feat">
          <div className="feat__ico">
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="7" y="7" width="30" height="30" rx="4" />
              <polyline points="15,22 19,26 29,16" />
            </svg>
          </div>
          <div className="feat__title">Без комисионна</div>
          <div className="feat__desc">Директни сделки без такса към брокер.</div>
        </div>
        <div className="feat">
          <div className="feat__ico">
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M29 37v-2a9 9 0 0 0-18 0v2" />
              <circle cx="20" cy="16" r="7" />
              <polyline points="31,24 33,26 38,21" />
            </svg>
          </div>
          <div className="feat__title">Верифицирани собственици</div>
          <div className="feat__desc">Преминали през система за одобрение.</div>
        </div>
        <div className="feat">
          <div className="feat__ico">
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M28 7H13a2 2 0 0 0-2 2v26a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V14L28 7z" />
              <polyline points="28,7 28,14 33,14" />
              <polyline points="16,24 19,27 26,20" />
            </svg>
          </div>
          <div className="feat__title">Прозрачни условия</div>
          <div className="feat__desc">Чист процес от началото до финала.</div>
        </div>
      </div>
    </section>
  );
}
