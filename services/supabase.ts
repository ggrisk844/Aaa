import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://btntwstjgbapxtapodvp.supabase.co';
const supabaseKey = 'sb_publishable_tu4tOKjDYXWrcXSnsMBc7A_SQ-tsGtx';

export const supabase = createClient(supabaseUrl, supabaseKey);
