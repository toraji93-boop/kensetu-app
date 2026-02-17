import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wsnnmoxlqbysobcgipfh.supabase.co'
const supabaseAnonKey = 'sb_publishable_FNeqJX-JEZ140M9t5q1Omg_S0IoO0dS'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
