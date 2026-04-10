/**
 * Cliente de Supabase para autenticación y storage.
 * Se inicializa con las variables de entorno de Vite.
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '⚠️ Faltan las variables de entorno de Supabase. ' +
    'Revisá que VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY estén definidas en .env'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
