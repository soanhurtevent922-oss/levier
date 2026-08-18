-- À exécuter une seule fois dans Supabase : Project > SQL Editor > New query > coller > Run

create table if not exists profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null unique,
  job_category text,
  experience_level text,
  city_tier text,
  next_review_date date,
  last_reminded_at date,
  payment_status text not null default 'none',
  stripe_customer_id text,
  created_at timestamp with time zone default now()
);

create table if not exists salary_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  entry_date date not null default current_date,
  amount int not null,
  company text,
  note text,
  created_at timestamp with time zone default now()
);

alter table profiles enable row level security;
alter table salary_history enable row level security;

create policy "Chacun gère son propre profil" on profiles
  for all using (auth.uid() = user_id);

create policy "Chacun gère son propre historique" on salary_history
  for all using (auth.uid() = user_id);

-- Si tu as déjà exécuté ce fichier une première fois, ces lignes ajoutent
-- juste les colonnes de rappel sans rien casser.
alter table profiles add column if not exists next_review_date date;
alter table profiles add column if not exists last_reminded_at date;
alter table profiles add column if not exists payment_status text not null default 'none';
alter table profiles add column if not exists stripe_customer_id text;
