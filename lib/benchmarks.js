// Fourchettes indicatives, pensées comme point de repère pour préparer une négociation —
// pas des données temps réel. À croiser avec Glassdoor/LinkedIn/Silkhom pour un métier précis.

export const JOB_CATEGORIES = [
  'Développeur / Tech',
  'Commercial / Vente',
  'Marketing / Communication',
  'Comptabilité / Finance',
  'Ressources humaines',
  'Assistanat administratif',
  'Ingénieur',
  'Chef de projet',
  'Design / UX',
  'Support client / Success',
  'Restauration / Hôtellerie (encadrement)',
  'Logistique / Supply chain',
  'Enseignement / Formation',
  'Santé (paramédical)',
  'Juridique',
];

export const EXPERIENCE_LEVELS = [
  { key: 'junior', label: 'Junior (0-2 ans)' },
  { key: 'confirme', label: 'Confirmé (3-6 ans)' },
  { key: 'senior', label: 'Senior (7 ans et +)' },
];

export const CITY_TIERS = [
  { key: 'paris', label: 'Paris / Île-de-France' },
  { key: 'region', label: 'Région' },
];

// [min, max] annuel brut en euros, par catégorie > niveau > zone
const BASE_RANGES = {
  'Développeur / Tech':                       { junior: [34000, 42000], confirme: [44000, 58000], senior: [60000, 85000] },
  'Commercial / Vente':                        { junior: [28000, 34000], confirme: [36000, 48000], senior: [50000, 70000] },
  'Marketing / Communication':                 { junior: [28000, 33000], confirme: [35000, 45000], senior: [47000, 65000] },
  'Comptabilité / Finance':                    { junior: [28000, 34000], confirme: [36000, 46000], senior: [48000, 68000] },
  'Ressources humaines':                       { junior: [27000, 32000], confirme: [34000, 44000], senior: [46000, 62000] },
  'Assistanat administratif':                  { junior: [24000, 28000], confirme: [29000, 34000], senior: [35000, 42000] },
  'Ingénieur':                                  { junior: [33000, 40000], confirme: [42000, 55000], senior: [57000, 80000] },
  'Chef de projet':                             { junior: [30000, 36000], confirme: [38000, 50000], senior: [52000, 72000] },
  'Design / UX':                                { junior: [28000, 34000], confirme: [36000, 47000], senior: [49000, 68000] },
  'Support client / Success':                   { junior: [26000, 31000], confirme: [32000, 40000], senior: [42000, 55000] },
  'Restauration / Hôtellerie (encadrement)':    { junior: [24000, 28000], confirme: [29000, 36000], senior: [37000, 48000] },
  'Logistique / Supply chain':                  { junior: [26000, 31000], confirme: [32000, 42000], senior: [44000, 58000] },
  'Enseignement / Formation':                   { junior: [24000, 28000], confirme: [29000, 35000], senior: [36000, 46000] },
  'Santé (paramédical)':                        { junior: [24000, 28000], confirme: [29000, 34000], senior: [35000, 42000] },
  'Juridique':                                  { junior: [32000, 38000], confirme: [40000, 52000], senior: [54000, 78000] },
};

// En région, on applique un ajustement indicatif à la baisse (coût de la vie, marché local)
const REGION_FACTOR = 0.87;

export function getBenchmark(jobCategory, experienceKey, cityTierKey) {
  const range = BASE_RANGES[jobCategory]?.[experienceKey];
  if (!range) return null;
  const [min, max] = range;
  if (cityTierKey === 'region') {
    return [Math.round((min * REGION_FACTOR) / 500) * 500, Math.round((max * REGION_FACTOR) / 500) * 500];
  }
  return [min, max];
}
