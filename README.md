# Levier — Guide de mise en route

Même méthode que Bouche à Oreille et Fidèle — si tu l'as déjà fait, ça ira vite.

## 1. Crée ton projet Supabase

1. Va sur https://supabase.com, connecte-toi.
2. "New project", donne-lui un nom (ex. "levier"), choisis un mot de passe pour la base.
3. Une fois créé : **SQL Editor** → **New query** → colle le contenu de `supabase-schema.sql` → **Run**.
4. **Project Settings → API** : note ta **Project URL** et ta clé (publiable / anon).

## 2. Configure tes variables d'environnement

1. Renomme `.env.local.example` en `.env.local`.
2. Colle-y ta Project URL et ta clé.

## 3. Mets le code en ligne (GitHub + Vercel)

1. Nouveau repository sur GitHub, "uploading an existing file" → glisse tous les fichiers (sauf `.env.local`).
2. Sur Vercel : "Add New Project" → importe ce repo.
3. Ajoute tes 2 variables d'environnement.
4. Déploie.

## 4. Teste

1. Ouvre ton adresse Vercel.
2. Crée un compte, configure ton profil (métier, expérience, zone).
3. Regarde ta fourchette de référence, génère un script de négociation, ajoute une entrée à ton historique.

## Important à savoir

Les fourchettes de salaire affichées sont des **repères indicatifs**, pas des données de marché en temps réel scrapées automatiquement — elles viennent d'une table de référence intégrée au code (`lib/benchmarks.js`). C'est honnête et utile comme point de départ, mais il faut le dire clairement aux utilisateurs et les inciter à croiser avec Glassdoor/LinkedIn/Silkhom pour leur métier précis. Tu peux affiner ces chiffres toi-même en éditant ce fichier.

## Prochaines étapes (pas encore codées)

- Abonnement Stripe (même principe que pour Bouche à Oreille)
- Graphique visuel de l'évolution du salaire dans le temps
- Nom de domaine personnalisé

## 5. Active les rappels automatiques par email

1. Crée un compte gratuit sur https://resend.com (100 emails/jour gratuits).
2. Récupère ta clé API (Developers → API Keys) → `RESEND_API_KEY`.
3. Pour commencer sans configurer de domaine, utilise l'adresse d'envoi de test fournie par Resend (`onboarding@resend.dev`) comme `REMINDER_FROM_EMAIL` — tu pourras brancher ton propre domaine plus tard.
4. Invente un mot de passe long pour `CRON_SECRET` (protège la route de rappel contre un déclenchement non autorisé).
5. Ajoute `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `REMINDER_FROM_EMAIL` et `CRON_SECRET` dans Vercel.
6. Le fichier `vercel.json` déclenche automatiquement la vérification chaque jour à 8h — rien d'autre à faire, Vercel s'en charge.
7. Un utilisateur qui renseigne une date d'entretien dans son profil recevra un email s'il reste 7 jours ou moins avant cette date.

## Sur l'honnêteté des données de salaire

Le produit affiche des fourchettes indicatives (fichier `lib/benchmarks.js`), pas des données de marché sourcées en temps réel — aucune base de données salariale fiable n'offre d'accès public gratuit vérifiable. Le tableau de bord affiche donc aussi des liens directs vers Glassdoor et LinkedIn Salary, pour que l'utilisateur croise l'information plutôt que de faire confiance aveuglément à un chiffre généré. C'est un choix assumé de transparence plutôt qu'une fausse promesse de données "propriétaires".

## 6. Configure les deux formules de paiement (300€ à vie / 50€ mois)

1. Sur Stripe → **Catalogue de produits** → crée un produit "Levier — Accès à vie", prix unique 300€, décoché "Recurring". Copie l'ID qui commence par `price_...` → `STRIPE_PRICE_LIFETIME`.
2. Crée un deuxième produit "Levier — Mensuel", prix 50€, coché "Recurring" / "Monthly". Copie son ID → `STRIPE_PRICE_MONTHLY`.
3. Récupère ta **clé secrète** (Développeurs → Clés API) → `STRIPE_SECRET_KEY`.
4. Crée un **webhook** (Développeurs → Webhooks → Ajouter un point de terminaison) avec l'URL `https://TON-SITE.vercel.app/api/webhook`, écoutant `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`. Copie le **Signing secret** → `STRIPE_WEBHOOK_SECRET`.
5. Ajoute aussi `SUPABASE_SERVICE_ROLE_KEY` (déjà vu à l'étape 5) et `NEXT_PUBLIC_SITE_URL`.
6. Ajoute toutes ces variables dans Vercel, redéploie.

**Le parcours utilisateur** : la page d'accueil (`/`) est publique, avec les deux formules affichées. Un clic sur une formule envoie vers `/login?plan=lifetime` (ou `monthly`) → l'utilisateur crée son compte → redirigé automatiquement vers Stripe Checkout → après paiement, le webhook active son accès → il configure son profil métier → accès complet au tableau de bord.
