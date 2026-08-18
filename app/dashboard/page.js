'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { JOB_CATEGORIES, EXPERIENCE_LEVELS, CITY_TIERS, getBenchmark } from '../../lib/benchmarks';
import { OBJECTIONS } from '../../lib/objections';

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [script, setScript] = useState('');
  const [objectionIndex, setObjectionIndex] = useState(0);
  const [subLoading, setSubLoading] = useState(false);
  const [subError, setSubError] = useState('');

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      setUserId(session.user.id);

      const { data: prof } = await supabase
        .from('profiles').select('*').eq('user_id', session.user.id).maybeSingle();

      if (prof) {
        setProfile(prof);
        const { data: hist } = await supabase
          .from('salary_history').select('*').eq('user_id', session.user.id).order('entry_date', { ascending: false });
        setHistory(hist || []);
      }
      setLoading(false);
    }
    init();
  }, [router]);

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
      if (data.url) {
        window.location.href = data.url;
      } else {
        setSubError(data.error || 'Erreur inconnue côté serveur.');
        setSubLoading(false);
      }
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

    if (profile) {
      const { data } = await supabase.from('profiles')
        .update({ job_category, experience_level, city_tier, next_review_date }).eq('id', profile.id).select().single();
      setProfile(data);
    } else {
      const { data } = await supabase.from('profiles')
        .insert({ user_id: userId, job_category, experience_level, city_tier, next_review_date }).select().single();
      setProfile(data);
    }
    setShowEditProfile(false);
  }

  async function handleAddHistory(e) {
    e.preventDefault();
    const amount = parseInt(e.target.histAmount.value, 10);
    const company = e.target.histCompany.value.trim();
    const entry_date = e.target.histDate.value || new Date().toISOString().slice(0, 10);
    if (!amount) return;
    const { data } = await supabase.from('salary_history')
      .insert({ user_id: userId, amount, company, entry_date }).select().single();
    setHistory([data, ...history]);
    e.target.reset();
  }

  function generateScript(e) {
    e.preventDefault();
    const achievement = e.target.achievement.value.trim();
    const targetPct = e.target.targetPct.value;
    const [min, max] = getBenchmark(profile.job_category, profile.experience_level, profile.city_tier) || [null, null];
    const target = max ? Math.round((max * (1 + targetPct / 100)) / 100) * 100 : null;

    const lines = [
      `Merci de prendre le temps d'échanger sur ma rémunération.`,
      achievement
        ? `Depuis ma dernière évaluation, j'ai notamment : ${achievement}.`
        : `Je voulais faire un point sur mes responsabilités actuelles et leur évolution.`,
      min && max
        ? `D'après les données de marché pour un poste comparable au mien, la fourchette se situe plutôt entre ${min.toLocaleString('fr-FR')}€ et ${max.toLocaleString('fr-FR')}€ brut annuel.`
        : `D'après mes recherches sur le marché actuel, ma rémunération me semble en retrait par rapport à des postes comparables.`,
      target
        ? `Vu mes responsabilités et ce contexte, je vise une rémunération autour de ${target.toLocaleString('fr-FR')}€ brut annuel.`
        : `Je souhaiterais qu'on évoque une revalorisation cohérente avec ces éléments.`,
      `Si le budget ne permet pas de bouger sur le fixe pour l'instant, je suis ouvert(e) à en discuter — jours de télétravail, prime variable, formation prise en charge.`,
    ];
    setScript(lines.join('\n\n'));
  }

  if (loading) {
    return <div className="wrap"><p className="sr-loading">Chargement…</p></div>;
  }

  const isPaid = profile && ['lifetime', 'active_subscription'].includes(profile.payment_status);

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
            <button type="submit" className="btn-primary">
              {profile ? 'Enregistrer' : 'Créer mon espace'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const [min, max] = getBenchmark(profile.job_category, profile.experience_level, profile.city_tier) || [null, null];

  return (
    <div className="wrap">
      <header className="top">
        <div className="brand">
          <h1>Levier</h1>
          <p>Le bon argument, au bon moment.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="user-tag">
            {profile.job_category}
            <button className="edit-link" onClick={() => setShowEditProfile(true)}>modifier</button>
          </div>
          {profile.payment_status === 'active_subscription' ? (
            <button className="btn-ghost" onClick={handleManageSubscription} disabled={subLoading}>
              {subLoading ? 'Un instant…' : 'Gérer mon abonnement'}
            </button>
          ) : (
            <span className="user-tag">Accès à vie</span>
          )}
          <button className="btn-ghost" onClick={handleSignOut}>Déconnexion</button>
        </div>
      </header>
      {subError && <p className="auth-error" style={{ marginTop: '-18px', marginBottom: '20px' }}>{subError}</p>}

      <div className="panel">
        <h2 className="section-title" style={{ margin: 0 }}>Ta fourchette de référence</h2>
        {min && max ? (
          <>
            <span className="benchmark-range">{min.toLocaleString('fr-FR')}€ – {max.toLocaleString('fr-FR')}€</span>
            <span className="benchmark-note">Brut annuel indicatif, pour ton profil ({EXPERIENCE_LEVELS.find(l => l.key === profile.experience_level)?.label}, {CITY_TIERS.find(z => z.key === profile.city_tier)?.label}). Croise avec Glassdoor/LinkedIn pour affiner.</span>
          </>
        ) : (
          <p className="empty-note">Pas de donnée pour ce profil précis — ajuste ton métier dans les paramètres.</p>
        )}
      </div>

      <h2 className="section-title">Prépare ta négociation</h2>
      <div className="panel">
        <form onSubmit={generateScript}>
          <div>
            <label htmlFor="achievement">Une réussite récente à mettre en avant (optionnel)</label>
            <textarea id="achievement" name="achievement" rows={2} placeholder="Ex. j'ai piloté le lancement de X, augmenté Y de 20%..." />
          </div>
          <div>
            <label htmlFor="targetPct">Augmentation visée (%)</label>
            <input id="targetPct" name="targetPct" type="number" min="0" max="100" defaultValue={10} />
          </div>
          <button type="submit" className="btn-primary">Générer mon script</button>
        </form>
        {script && <div className="script-box">{script}</div>}
      </div>

      <h2 className="section-title">Mode entraînement</h2>
      <div className="panel">
        <p className="benchmark-note" style={{ marginBottom: '14px' }}>
          Un(e) recruteur/manager répond rarement "oui" du premier coup. Entraîne-toi à répondre à ces objections classiques.
        </p>
        <p style={{ fontWeight: 600, marginBottom: '10px' }}>
          &ldquo;{OBJECTIONS[objectionIndex].objection}&rdquo;
        </p>
        <div className="script-box" style={{ marginTop: 0, marginBottom: '14px' }}>
          {OBJECTIONS[objectionIndex].tip}
        </div>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => setObjectionIndex((objectionIndex + 1) % OBJECTIONS.length)}
        >
          Objection suivante ({objectionIndex + 1}/{OBJECTIONS.length})
        </button>
      </div>

      <div className="panel" style={{ borderColor: 'var(--cyan)' }}>
        <p style={{ fontSize: '0.85rem', margin: 0 }}>
          <strong>À savoir :</strong> les fourchettes ci-dessus sont des repères indicatifs, pas des données de marché en temps réel. Pour affiner avant un entretien important, croise avec des sources externes :
        </p>
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
          <a className="btn-ghost" style={{ textDecoration: 'none' }} href={`https://www.glassdoor.fr/Salaires/index.htm`} target="_blank" rel="noreferrer">Voir sur Glassdoor</a>
          <a className="btn-ghost" style={{ textDecoration: 'none' }} href={`https://www.linkedin.com/salary/`} target="_blank" rel="noreferrer">Voir sur LinkedIn Salary</a>
        </div>
      </div>

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
            </div>
          ))
        )}
      </div>
    </div>
  );
}
