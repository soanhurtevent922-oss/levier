# Levier — Guide de mise en route

Même méthode que Bouche à Oreille et Fidèle — si tu l'as déjà fait, ça ira vite.

## Mode test (paiement désactivé)

Par défaut, ce projet est configuré en **mode test** : `NEXT_PUBLIC_SKIP_PAYWALL=true` dans `.env.local.example`. Tant que c'est activé, n'importe qui qui crée un compte a accès à tout gratuitement, sans passer par Stripe — pratique pour vérifier que tout fonctionne bien avant de faire payer qui que ce soit.

**Quand tu es prêt(e) à vraiment faire payer** : dans Vercel → Environment Variables, change `NEXT_PUBLIC_SKIP_PAYWALL` en `false` (ou supprime la variable), puis redéploie. Assure-toi d'avoir bien fait l'étape 6 (Stripe) avant, sinon personne ne pourra créer de compte payant.

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
3. Tu arrives sur **Vue d'ensemble**, avec une navigation à 4 onglets en haut :
   - **Vue d'ensemble** — résumé rapide (fourchette, dernier salaire, dépenses, reste à vivre)
   - **Finances** — renseigne tes dépenses fixes (loyer, transport...) et ton historique de salaire
   - **Script** — ta fourchette de référence + génère ton script de négociation
   - **Entraînement** — pratique les objections classiques

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

## 7. Active l'entraînement avec l'IA recruteur

1. Crée un compte sur https://console.anthropic.com (facturation à l'usage, pas d'abonnement fixe).
2. Génère une clé API (Settings → API Keys) → `ANTHROPIC_API_KEY`.
3. Ajoute-la dans Vercel, redéploie.

**Point financier important, à ne pas négliger** : contrairement à tout ce qu'on a construit avant (Supabase, Vercel, Resend ont des paliers gratuits confortables), chaque message échangé dans le mode entraînement a un **coût réel à l'usage**, facturé par Anthropic. Si tu as beaucoup d'utilisateurs actifs sur cette fonctionnalité, ce coût peut monter — à surveiller dans ton dashboard Anthropic, et à intégrer dans le calcul de rentabilité de tes 50€/mois ou 300€ à vie. Ce n'est pas bloquant pour démarrer, mais c'est la première brique du produit qui n'est pas quasi-gratuite à faire tourner.
