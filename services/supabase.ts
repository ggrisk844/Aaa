import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://msiqswggrscoixiarukg.supabase.co';
const supabaseKey = 'sb_publishable_PZccv1zjuplDfgQgzySOxA_eN2GCwQe';

export const supabase = createClient(supabaseUrl, supabaseKey);
