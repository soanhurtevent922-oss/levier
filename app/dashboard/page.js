'use client';

import Link from 'next/link';
import { useDashboard } from './layout';
import { getBenchmark } from '../../lib/benchmarks';

export default function OverviewPage() {
  const { profile, history, expenses } = useDashboard();

  const [min, max] = getBenchmark(profile.job_category, profile.experience_level, profile.city_tier) || [null, null];
  const latestSalary = history[0]?.amount || null;
  const totalMonthlyExpenses = expenses.reduce((sum, e) => sum + e.monthly_amount, 0);
  const monthlyGrossEstimate = latestSalary ? Math.round(latestSalary / 12) : null;
  const resteAVivre = monthlyGrossEstimate !== null ? monthlyGrossEstimate - totalMonthlyExpenses : null;

  return (
    <div>
      <div className="summary-grid">
        <div className="summary-card">
          <span className="val">{min ? `${(min / 1000).toFixed(0)}k–${(max / 1000).toFixed(0)}k€` : '—'}</span>
          <span className="label">Fourchette de référence</span>
        </div>
        <div className="summary-card">
          <span className="val">{latestSalary ? `${latestSalary.toLocaleString('fr-FR')}€` : '—'}</span>
          <span className="label">Dernier salaire renseigné</span>
        </div>
        <div className="summary-card">
          <span className="val">{expenses.length ? `${totalMonthlyExpenses.toLocaleString('fr-FR')}€` : '—'}</span>
          <span className="label">Dépenses / mois</span>
        </div>
        <div className="summary-card">
          <span className={`val ${resteAVivre !== null && resteAVivre < 0 ? 'warn' : ''}`}>
            {resteAVivre !== null ? `${resteAVivre.toLocaleString('fr-FR')}€` : '—'}
          </span>
          <span className="label">Estimation reste à vivre / mois</span>
        </div>
      </div>

      {latestSalary && expenses.length > 0 && (
        <p className="benchmark-note" style={{ marginBottom: '28px' }}>
          Estimation basée sur ton dernier salaire brut annuel divisé par 12 — ce n&apos;est pas un vrai salaire net, juste un repère. Renseigne tes dépenses et ton salaire dans l&apos;onglet Finances pour affiner.
        </p>
      )}

      <h2 className="section-title">Accès rapide</h2>
      <div className="quick-links">
        <Link href="/dashboard/finances" className="quick-link-card">
          <span className="qlabel">Finances</span>
          <p>Salaire, charges, dépenses et ton évolution dans le temps.</p>
        </Link>
        <Link href="/dashboard/script" className="quick-link-card">
          <span className="qlabel">Script d&apos;entretien</span>
          <p>Génère ton argumentaire personnalisé pour ta prochaine négociation.</p>
        </Link>
        <Link href="/dashboard/entrainement" className="quick-link-card">
          <span className="qlabel">Entraînement</span>
          <p>Prépare-toi aux objections classiques d&apos;un manager.</p>
        </Link>
      </div>
    </div>
  );
}
