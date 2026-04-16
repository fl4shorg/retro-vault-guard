import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Supabase env vars VITE_SUPABASE_URL e VITE_SUPABASE_KEY não configurados.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const API_CARGOS_FBI = "https://www.api.neext.online/api/cargosfbi";
export const API_CARGOS_SKUR = "https://www.api.neext.online/api/cargosskur";
