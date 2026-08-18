import { createClient } from '@supabase/supabase-js';

// Sert uniquement dans la tâche planifiée des rappels, jamais côté navigateur.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
