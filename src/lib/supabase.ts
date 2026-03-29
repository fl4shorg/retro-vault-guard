import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://mqtixljmalxlabhlvskv.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xdGl4bGptYWx4bGFiaGx2c2t2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MjYxMzQsImV4cCI6MjA5MDMwMjEzNH0.1n-WNPUL7LDa285jOKW7OG7aw-r0i1VZKEKKG7xUHjc";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const API_CARGOS_FBI = "https://www.api.neext.online/api/cargosfbi";
export const API_CARGOS_SKUR = "https://www.api.neext.online/api/cargosskur";
