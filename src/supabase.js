// src/supabase.js
import { createClient } from '@supabase/supabase-js';

// Haal deze waarden uit je Supabase project instellingen (Settings -> API)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Maak de client
export const supabase = createClient(supabaseUrl, supabaseKey);
