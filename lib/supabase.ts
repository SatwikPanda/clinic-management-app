import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://uatbnjtxltcidonbacok.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhdGJuanR4bHRjaWRvbmJhY29rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYwMDY1NTUsImV4cCI6MjA1MTU4MjU1NX0._QcESF08vgLU_VBKWq7WJFgk9vofTeHapKZ3pioVuDM";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
