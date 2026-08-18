'use client';

import { useState } from 'react';
import { useDashboard } from '../layout';
import { getBenchmark } from '../../../lib/benchmarks';

export default function ScriptPage() {
  const { profile, history } = useDashboard();
  const [script, setScript] = useState('');

  const currentSalary = history?.[0]?.amount || null;

  function generateScript(e) {
    e.preventDefault();
    const achievement = e.target.achievement.value.trim();
    const targetPct = parseFloat(e.target.targetPct.value) || 0;
    const [min, max] = getBenchmark(profile.job_category, profile.experience_level, profile.city_tier) || [null, null];

    // Le calcul part de ton vrai salaire renseigné si tu en as un — sinon, du haut de la fourchette de marché.
    const base = currentSalary || max;
    const target = base ? Math.round((base * (1 + targetPct / 100)) / 100) * 100 : null;

    const lines = [
      `Merci de prendre le temps d'échanger sur ma rémunération pour mon poste de ${profile.job_category}.`,
      currentSalary
        ? `Je suis actuellement à ${currentSalary.toLocaleString('fr-FR')}€ brut annuel.`
        : null,
      achievement
        ? `Depuis ma dernière évaluation, j'ai notamment : ${achievement}.`
        : `Je voulais faire un point sur mes responsabilités actuelles et leur évolution.`,
      min && max
        ? `D'après les données de marché pour un poste comparable au mien, la fourchette se situe plutôt entre ${min.toLocaleString('fr-FR')}€ et ${max.toLocaleString('fr-FR')}€ brut annuel.`
        : `D'après mes recherches sur le marché actuel, ma rémunération me semble en retrait par rapport à des postes comparables.`,
      target
        ? currentSalary
          ? `Vu mes responsabilités et ce contexte, je vise une évolution vers ${target.toLocaleString('fr-FR')}€ brut annuel — soit environ ${targetPct}% d'augmentation par rapport à ma situation actuelle.`
          : `Vu mes responsabilités et ce contexte, je vise une rémunération autour de ${target.toLocaleString('fr-FR')}€ brut annuel.`
        : `Je souhaiterais qu'on évoque une revalorisation cohérente avec ces éléments.`,
      `Si le budget ne permet pas de bouger sur le fixe pour l'instant, je suis ouvert(e) à en discuter — jours de télétravail, prime variable, formation prise en charge.`,
    ].filter(Boolean);
    setScript(lines.join('\n\n'));
  }

  const [min, max] = getBenchmark(profile.job_category, profile.experience_level, profile.city_tier) || [null, null];

  return (
    <div>
      <div className="panel">
        <h2 className="section-title" style={{ margin: 0 }}>Ta fourchette de référence</h2>
        {min && max ? (
          <>
            <span className="benchmark-range">{min.toLocaleString('fr-FR')}€ – {max.toLocaleString('fr-FR')}€</span>
            <span className="benchmark-note">Brut annuel indicatif pour ton profil. Croise avec Glassdoor/LinkedIn pour affiner.</span>
          </>
        ) : (
          <p className="empty-note">Pas de donnée pour ce profil précis.</p>
        )}
        {currentSalary && (
          <p className="benchmark-note" style={{ marginTop: '10px' }}>
            Ton dernier salaire renseigné (onglet Finances) : <strong>{currentSalary.toLocaleString('fr-FR')}€</strong> — utilisé comme base de calcul ci-dessous.
          </p>
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
        {!currentSalary && (
          <p className="benchmark-note" style={{ marginTop: '10px' }}>
            Astuce : ajoute ton salaire actuel dans l&apos;onglet <strong>Finances</strong> pour un script basé sur ta vraie situation plutôt que sur la seule fourchette de marché.
          </p>
        )}
      </div>

      <div className="panel" style={{ borderColor: 'var(--cyan)' }}>
        <p style={{ fontSize: '0.85rem', margin: 0 }}>
          <strong>À savoir :</strong> les fourchettes sont des repères indicatifs, pas des données de marché en temps réel. Croise avec de vraies sources :
        </p>
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
          <a className="btn-ghost" style={{ textDecoration: 'none' }} href="https://www.glassdoor.fr/Salaires/index.htm" target="_blank" rel="noreferrer">Voir sur Glassdoor</a>
          <a className="btn-ghost" style={{ textDecoration: 'none' }} href="https://www.linkedin.com/salary/" target="_blank" rel="noreferrer">Voir sur LinkedIn Salary</a>
        </div>
      </div>
    </div>
  );
}
