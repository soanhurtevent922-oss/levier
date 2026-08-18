'use client';

import { useState } from 'react';
import { useDashboard } from '../layout';
import { supabase } from '../../../lib/supabaseClient';

export default function FinancesPage() {
  const { userId, history, setHistory, expenses, setExpenses } = useDashboard();
  const [expenseError, setExpenseError] = useState('');

  async function handleAddHistory(e) {
    e.preventDefault();
    const amount = parseInt(e.target.histAmount.value, 10);
    const company = e.target.histCompany.value.trim();
    const entry_date = e.target.histDate.value || new Date().toISOString().slice(0, 10);
    if (!amount) return;
    const { data } = await supabase.from('salary_history')
      .insert({ user_id: userId, amount, company, entry_date }).select().single();
    setHistory([data, ...history].sort((a, b) => new Date(b.entry_date) - new Date(a.entry_date)));
    e.target.reset();
  }

  async function handleAddExpense(e) {
    e.preventDefault();
    setExpenseError('');
    const label = e.target.expLabel.value.trim();
    const monthly_amount = parseInt(e.target.expAmount.value, 10);
    if (!label || !monthly_amount) return;
    const { data, error } = await supabase.from('expense_categories')
      .insert({ user_id: userId, label, monthly_amount }).select().single();
    if (error) { setExpenseError(error.message); return; }
    setExpenses([...expenses, data]);
    e.target.reset();
  }

  async function handleRemoveExpense(id) {
    await supabase.from('expense_categories').delete().eq('id', id);
    setExpenses(expenses.filter((e) => e.id !== id));
  }

  async function handleRemoveHistory(id) {
    await supabase.from('salary_history').delete().eq('id', id);
    setHistory(history.filter((h) => h.id !== id));
  }

  const totalMonthlyExpenses = expenses.reduce((sum, e) => sum + e.monthly_amount, 0);
  const latestSalary = history[0]?.amount || null;
  const monthlyGrossEstimate = latestSalary ? Math.round(latestSalary / 12) : null;
  const resteAVivre = monthlyGrossEstimate !== null ? monthlyGrossEstimate - totalMonthlyExpenses : null;

  return (
    <div>
      <h2 className="section-title" style={{ marginTop: 0 }}>Tes dépenses fixes, par mois</h2>
      <p className="benchmark-note" style={{ marginBottom: '14px' }}>
        Renseigne-les une seule fois — le calcul de ton reste à vivre se met à jour tout seul chaque mois, sans que tu aies à revenir les ressaisir.
      </p>
      <div className="panel">
        <form onSubmit={handleAddExpense}>
          <div>
            <label htmlFor="expLabel">Type de dépense</label>
            <input id="expLabel" name="expLabel" type="text" required placeholder="Ex. Loyer, Transport, Abonnements..." />
          </div>
          <div>
            <label htmlFor="expAmount">Montant mensuel (€)</label>
            <input id="expAmount" name="expAmount" type="number" required placeholder="Ex. 650" />
          </div>
          {expenseError && <p className="auth-error">{expenseError}</p>}
          <button type="submit" className="btn-primary">Ajouter cette dépense</button>
        </form>
      </div>

      <div className="history-list" style={{ marginBottom: '28px' }}>
        {expenses.length === 0 ? (
          <p className="empty-note">Aucune dépense renseignée pour l&apos;instant.</p>
        ) : (
          expenses.map((e) => (
            <div className="history-row" key={e.id}>
              <span className="history-amount">{e.monthly_amount.toLocaleString('fr-FR')}€</span>
              <span className="history-meta">{e.label}</span>
              <button className="btn-ghost" onClick={() => handleRemoveExpense(e.id)}>Retirer</button>
            </div>
          ))
        )}
      </div>

      <div className="summary-grid">
        <div className="summary-card">
          <span className="val">{totalMonthlyExpenses.toLocaleString('fr-FR')}€</span>
          <span className="label">Total dépenses / mois</span>
        </div>
        <div className="summary-card">
          <span className={`val ${resteAVivre !== null && resteAVivre < 0 ? 'warn' : ''}`}>
            {resteAVivre !== null ? `${resteAVivre.toLocaleString('fr-FR')}€` : '—'}
          </span>
          <span className="label">Reste à vivre estimé / mois</span>
        </div>
      </div>
      <p className="benchmark-note" style={{ marginBottom: '28px' }}>
        Estimation à partir de ton salaire brut annuel divisé par 12 — pas ton vrai net après impôts et cotisations. Un vrai repère, pas un chiffre exact.
      </p>

      <h2 className="section-title">Ajouter un salaire à ton historique</h2>
      <div className="panel">
        <form onSubmit={handleAddHistory}>
          <div>
            <label htmlFor="histAmount">Montant brut annuel (€)</label>
            <input id="histAmount" name="histAmount" type="number" required placeholder="Ex. 38000" />
          </div>
          <div>
            <label htmlFor="histCompany">Entreprise (optionnel)</label>
            <input id="histCompany" name="histCompany" type="text" placeholder="Ex. Mon employeur" />
          </div>
          <div>
            <label htmlFor="histDate">Date</label>
            <input id="histDate" name="histDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
          </div>
          <button type="submit" className="btn-primary">Ajouter</button>
        </form>
      </div>

      <h2 className="section-title">Ton évolution <span className="n">{history.length} entrées</span></h2>
      <div className="history-list">
        {history.length === 0 ? (
          <p className="empty-note">Aucune entrée pour l&apos;instant. Ajoute ton salaire actuel pour commencer ton historique.</p>
        ) : (
          history.map((h) => (
            <div className="history-row" key={h.id}>
              <span className="history-amount">{h.amount.toLocaleString('fr-FR')}€</span>
              <span className="history-meta">{h.company || 'Sans précision'} — {new Date(h.entry_date).toLocaleDateString('fr-FR')}</span>
              <button className="btn-ghost" onClick={() => handleRemoveHistory(h.id)}>Retirer</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
