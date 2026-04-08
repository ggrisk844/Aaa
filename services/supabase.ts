import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dlqownttgcelbhrksime.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRscW93bnR0Z2NlbGJocmtzaW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2MDg1MDgsImV4cCI6MjA5MTE4NDUwOH0.7QyifqSgPEMyl_7cOD-QZz7NktzNT0uFmDUKlH09K5A';

export const supabase = createClient(supabaseUrl, supabaseKey);
