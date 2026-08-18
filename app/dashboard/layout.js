'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { JOB_CATEGORIES, EXPERIENCE_LEVELS, CITY_TIERS } from '../../lib/benchmarks';

const DashboardContext = createContext(null);
export function useDashboard() {
  return useContext(DashboardContext);
}

const SKIP_PAYWALL = process.env.NEXT_PUBLIC_SKIP_PAYWALL === 'true';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [subLoading, setSubLoading] = useState(false);
  const [subError, setSubError] = useState('');

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      setUserId(session.user.id);

      let { data: prof } = await supabase
        .from('profiles').select('*').eq('user_id', session.user.id).maybeSingle();

      // En mode test (paiement désactivé), on crée quand même une ligne de profil
      // pour que le reste du parcours (configuration métier, etc.) fonctionne normalement.
      if (!prof && SKIP_PAYWALL) {
        const { data: newProf } = await supabase.from('profiles')
          .insert({ user_id: session.user.id, payment_status: 'lifetime' })
          .select().single();
        prof = newProf;
      }

      setProfile(prof);

      if (prof) {
        await loadHistoryAndExpenses(session.user.id);
      }
      setLoading(false);
    }
    init();
  }, [router]);

  async function loadHistoryAndExpenses(uid) {
    const { data: hist } = await supabase
      .from('salary_history').select('*').eq('user_id', uid).order('entry_date', { ascending: false });
    setHistory(hist || []);
    const { data: exp } = await supabase
      .from('expense_categories').select('*').eq('user_id', uid).order('created_at', { ascending: true });
    setExpenses(exp || []);
  }

  async function refreshProfile() {
    const { data: prof } = await supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle();
    setProfile(prof);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  async function handleManageSubscription() {
    setSubLoading(true);
    setSubError('');
    try {
      const res = await fetch('/api/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stripeCustomerId: profile.stripe_customer_id }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else { setSubError(data.error || 'Erreur inconnue.'); setSubLoading(false); }
    } catch (err) {
      setSubError(err.message);
      setSubLoading(false);
    }
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    const job_category = e.target.jobCategory.value;
    const experience_level = e.target.experienceLevel.value;
    const city_tier = e.target.cityTier.value;
    const next_review_date = e.target.nextReviewDate.value || null;

    const { data } = await supabase.from('profiles')
      .update({ job_category, experience_level, city_tier, next_review_date }).eq('id', profile.id).select().single();
    setProfile(data);
    if (history.length === 0 && expenses.length === 0) {
      await loadHistoryAndExpenses(userId);
    }
    setShowEditProfile(false);
  }

  if (loading) {
    return <div className="wrap"><p className="sr-loading">Chargement…</p></div>;
  }

  const isPaid = SKIP_PAYWALL || (profile && ['lifetime', 'active_subscription'].includes(profile.payment_status));

  if (!isPaid) {
    return (
      <div className="wrap">
        <div className="setup-wrap">
          <h2>Débloque ton espace Levier</h2>
          <p className="sub">Un accès actif (à vie ou mensuel) est nécessaire pour continuer.</p>
          <a href="/" className="btn-primary" style={{ textAlign: 'center', textDecoration: 'none', display: 'block' }}>
            Voir les formules
          </a>
          <p style={{ marginTop: '16px', fontSize: '0.85rem' }}>
            <button className="edit-link" onClick={handleSignOut}>Se déconnecter</button>
          </p>
        </div>
      </div>
    );
  }

  if (!profile.job_category || showEditProfile) {
    return (
      <div className="wrap">
        <div className="setup-wrap">
          <h2>Configure ton profil</h2>
          <p className="sub">Ça nous permet de te donner une fourchette de salaire pertinente.</p>
          <form onSubmit={handleSaveProfile}>
            <div>
              <label htmlFor="jobCategory">Métier</label>
              <select id="jobCategory" name="jobCategory" defaultValue={profile?.job_category || JOB_CATEGORIES[0]}>
                {JOB_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="experienceLevel">Expérience</label>
              <select id="experienceLevel" name="experienceLevel" defaultValue={profile?.experience_level || 'junior'}>
                {EXPERIENCE_LEVELS.map((l) => <option key={l.key} value={l.key}>{l.label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="cityTier">Zone géographique</label>
              <select id="cityTier" name="cityTier" defaultValue={profile?.city_tier || 'paris'}>
                {CITY_TIERS.map((z) => <option key={z.key} value={z.key}>{z.label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="nextReviewDate">Date de ton prochain entretien/évaluation (optionnel)</label>
              <input id="nextReviewDate" name="nextReviewDate" type="date" defaultValue={profile?.next_review_date || ''} />
            </div>
            <button type="submit" className="btn-primary">Enregistrer</button>
          </form>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: '/dashboard', label: "Vue d'ensemble" },
    { href: '/dashboard/finances', label: 'Finances' },
    { href: '/dashboard/script', label: 'Script' },
    { href: '/dashboard/entrainement', label: 'Entraînement' },
  ];

  return (
    <DashboardContext.Provider value={{ profile, userId, history, setHistory, expenses, setExpenses, refreshProfile, setShowEditProfile }}>
      <div className="wrap">
        <header className="top">
          <div className="brand">
            <h1>Levier</h1>
            <p>Le bon argument, au bon moment.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div className="user-tag">
              {profile.job_category}
              <button className="edit-link" onClick={() => setShowEditProfile(true)}>modifier</button>
            </div>
            {profile.payment_status === 'active_subscription' ? (
              <button className="btn-ghost" onClick={handleManageSubscription} disabled={subLoading}>
                {subLoading ? 'Un instant…' : 'Gérer mon abonnement'}
              </button>
            ) : SKIP_PAYWALL ? (
              <span className="user-tag" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>Mode test — paiement désactivé</span>
            ) : (
              <span className="user-tag">Accès à vie</span>
            )}
            <button className="btn-ghost" onClick={handleSignOut}>Déconnexion</button>
          </div>
        </header>
        {subError && <p className="auth-error" style={{ marginTop: '-18px', marginBottom: '20px' }}>{subError}</p>}

        <nav className="dash-nav">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={`dash-nav-link ${pathname === item.href ? 'active' : ''}`}>
              {item.label}
            </Link>
          ))}
        </nav>

        {children}
      </div>
    </DashboardContext.Provider>
  );
}
