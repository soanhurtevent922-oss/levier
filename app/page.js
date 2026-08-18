import Link from 'next/link';

export const metadata = {
  title: 'Levier — Négocie ton salaire avec un vrai argument',
};

const FEATURES = [
  {
    label: 'Fourchette de référence',
    desc: "Sais ce que vaut vraiment ton poste — par métier, niveau d'expérience et zone géographique.",
  },
  {
    label: 'Script sur mesure',
    desc: "Un argumentaire généré à partir de tes réussites récentes et de l'augmentation que tu vises.",
  },
  {
    label: 'Entraînement aux objections',
    desc: "Prépare-toi aux réponses classiques d'un manager, avant de te retrouver face à elles en vrai.",
  },
  {
    label: 'Rappel automatique',
    desc: "Un email avant ton entretien, pour ne jamais arriver au dépourvu faute d'y avoir pensé à temps.",
  },
  {
    label: 'Suivi dans le temps',
    desc: 'Toute ton évolution de salaire au même endroit, entretien après entretien.',
  },
];

export default function LandingPage() {
  return (
    <div className="landing">
      <header className="l-header">
        <span className="l-logo">LEVIER</span>
      </header>

      <section className="l-hero">
        <div className="l-hero-text">
          <span className="l-eyebrow">Préparation salariale</span>
          <h1>Arrête de demander une augmentation.<br />Négocie-la.</h1>
          <p className="l-sub">
            Fourchette de salaire, script sur mesure, entraînement aux objections —
            tout ce qu&apos;il faut pour ton prochain entretien, au même endroit.
          </p>
          <Link href="/login?plan=lifetime" className="l-cta">
            Préparer mes entretiens
            <span className="l-cta-arrow">→</span>
          </Link>
        </div>

        <div className="l-lever-wrap" aria-hidden="true">
          <svg viewBox="0 0 420 320" className="l-lever-svg">
            <line x1="30" y1="280" x2="390" y2="280" className="l-baseline" />
            <polygon points="210,240 185,290 235,290" className="l-fulcrum" />
            <g className="l-bar-group">
              <rect x="60" y="180" width="300" height="10" rx="2" className="l-bar" />
              <circle cx="75" cy="185" r="16" className="l-weight-low" />
              <circle cx="345" cy="185" r="22" className="l-weight-high" />
              <text x="75" y="230" className="l-tag l-tag-low">avant</text>
              <text x="345" y="145" className="l-tag l-tag-high">après</text>
            </g>
          </svg>
        </div>
      </section>

      <section className="l-features">
        <h2 className="l-section-title">Ce que tu débloques</h2>
        <div className="l-feature-grid">
          {FEATURES.map((f) => (
            <div className="l-feature-card" key={f.label}>
              <span className="l-feature-label">{f.label}</span>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="l-pricing">
        <h2 className="l-section-title">Choisis ta formule</h2>
        <div className="l-pricing-grid">
          <div className="l-price-card">
            <span className="l-price-tag">Accès à vie</span>
            <span className="l-price-amount">300€</span>
            <span className="l-price-note">Paiement unique — accès conservé pour toujours.</span>
            <Link href="/login?plan=lifetime" className="l-price-cta">Choisir cette formule</Link>
          </div>
          <div className="l-price-card l-price-card--accent">
            <span className="l-price-tag">Mensuel</span>
            <span className="l-price-amount">50€<span className="l-price-period">/mois</span></span>
            <span className="l-price-note">Sans engagement — résiliable à tout moment.</span>
            <Link href="/login?plan=monthly" className="l-price-cta l-price-cta--accent">Choisir cette formule</Link>
          </div>
        </div>
      </section>

      <footer className="l-footer">Levier — le bon argument, au bon moment.</footer>

      <style>{`
        :root {
          --l-bg: #060A14;
          --l-panel: #0D1526;
          --l-border: #1E2A42;
          --l-ink: #E7ECF5;
          --l-ink-soft: #8B96AC;
          --l-blue: #3B82F6;
          --l-cyan: #22D3EE;
        }
        .landing {
          background: var(--l-bg);
          color: var(--l-ink);
          font-family: 'IBM Plex Sans', sans-serif;
          min-height: 100vh;
        }
        .l-header {
          max-width: 1100px; margin: 0 auto; padding: 28px 24px 0;
        }
        .l-logo {
          font-family: 'Sora', sans-serif; font-weight: 700; font-size: 1.1rem;
          letter-spacing: 0.12em;
        }
        .l-hero {
          max-width: 1100px; margin: 0 auto; padding: 60px 24px 40px;
          display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 40px; align-items: center;
        }
        @media (max-width: 860px) { .l-hero { grid-template-columns: 1fr; } }
        .l-eyebrow {
          font-family: 'IBM Plex Mono', monospace; font-size: 0.78rem; text-transform: uppercase;
          letter-spacing: 0.14em; color: var(--l-cyan);
        }
        .l-hero-text h1 {
          font-family: 'Sora', sans-serif; font-weight: 700; font-size: 2.9rem;
          line-height: 1.12; margin: 14px 0 18px; letter-spacing: -0.01em;
        }
        .l-sub { color: var(--l-ink-soft); font-size: 1.05rem; line-height: 1.6; max-width: 480px; margin: 0 0 30px; }
        .l-cta {
          display: inline-flex; align-items: center; gap: 10px;
          background: linear-gradient(90deg, var(--l-blue), var(--l-cyan));
          color: #061018; font-weight: 700; text-decoration: none;
          padding: 14px 22px; border-radius: 4px; font-size: 0.98rem;
          box-shadow: 0 0 32px rgba(59,130,246,0.35);
        }
        .l-cta-arrow { transition: transform 0.2s ease; }
        .l-cta:hover .l-cta-arrow { transform: translateX(4px); }

        .l-lever-wrap { display: flex; justify-content: center; }
        .l-lever-svg { width: 100%; max-width: 420px; height: auto; }
        .l-baseline { stroke: var(--l-border); stroke-width: 2; }
        .l-fulcrum { fill: var(--l-panel); stroke: var(--l-border); stroke-width: 2; }
        .l-bar-group {
          transform-origin: 210px 240px;
          animation: l-tilt 1.6s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        @keyframes l-tilt {
          from { transform: rotate(0deg); }
          to { transform: rotate(-13deg); }
        }
        .l-bar { fill: var(--l-border); }
        .l-weight-low { fill: var(--l-panel); stroke: var(--l-border); stroke-width: 2; }
        .l-weight-high { fill: var(--l-cyan); filter: drop-shadow(0 0 14px rgba(34,211,238,0.7)); }
        .l-tag {
          font-family: 'IBM Plex Mono', monospace; font-size: 12px; fill: var(--l-ink-soft);
          text-anchor: middle;
        }
        .l-tag-high { fill: var(--l-cyan); }

        .l-section-title {
          font-family: 'Sora', sans-serif; font-weight: 700; font-size: 1.5rem;
          text-align: center; margin: 0 0 32px;
        }
        .l-features { max-width: 1100px; margin: 40px auto; padding: 40px 24px; }
        .l-feature-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;
        }
        .l-feature-card {
          background: var(--l-panel); border: 1px solid var(--l-border); border-radius: 6px;
          padding: 20px;
        }
        .l-feature-label {
          font-family: 'IBM Plex Mono', monospace; font-size: 0.78rem; text-transform: uppercase;
          letter-spacing: 0.06em; color: var(--l-cyan); display: block; margin-bottom: 10px;
        }
        .l-feature-card p { color: var(--l-ink-soft); font-size: 0.9rem; line-height: 1.5; margin: 0; }

        .l-pricing { max-width: 900px; margin: 20px auto 60px; padding: 40px 24px; }
        .l-pricing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 640px) { .l-pricing-grid { grid-template-columns: 1fr; } }
        .l-price-card {
          background: var(--l-panel); border: 1px solid var(--l-border); border-radius: 8px;
          padding: 28px; display: flex; flex-direction: column; gap: 6px;
        }
        .l-price-card--accent { border-color: var(--l-blue); box-shadow: 0 0 40px rgba(59,130,246,0.12); }
        .l-price-tag {
          font-family: 'IBM Plex Mono', monospace; font-size: 0.78rem; text-transform: uppercase;
          letter-spacing: 0.08em; color: var(--l-ink-soft);
        }
        .l-price-amount {
          font-family: 'Sora', sans-serif; font-weight: 700; font-size: 2.6rem; margin: 4px 0;
        }
        .l-price-period { font-size: 1.1rem; color: var(--l-ink-soft); font-weight: 500; }
        .l-price-note { color: var(--l-ink-soft); font-size: 0.88rem; margin-bottom: 18px; }
        .l-price-cta {
          text-align: center; text-decoration: none; padding: 12px; border-radius: 4px;
          font-weight: 700; font-size: 0.92rem;
          background: transparent; border: 1px solid var(--l-border); color: var(--l-ink);
        }
        .l-price-cta--accent {
          background: linear-gradient(90deg, var(--l-blue), var(--l-cyan));
          border: none; color: #061018;
        }

        .l-footer {
          text-align: center; color: var(--l-ink-soft); font-size: 0.8rem;
          font-family: 'IBM Plex Mono', monospace; padding: 30px 24px 50px;
        }

        @media (prefers-reduced-motion: reduce) {
          .l-bar-group { animation: none; transform: rotate(-13deg); }
        }
      `}</style>
    </div>
  );
}
