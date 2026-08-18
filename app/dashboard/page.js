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
