// Configuração do Supabase
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variáveis SUPABASE_URL e SUPABASE_ANON_KEY são obrigatórias')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Configurações opcionais
export const supabaseConfig = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
  // Configurações de autenticação
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  // Configurações de storage
  storage: {
    bucket: 'uploads'
  }
}

// Helper para upload de arquivos
export async function uploadFile(file, path) {
  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(path, file)
  
  if (error) {
    throw new Error(`Erro no upload: ${error.message}`)
  }
  
  return data
}

// Helper para obter URL pública
export function getPublicUrl(path) {
  const { data } = supabase.storage
    .from('uploads')
    .getPublicUrl(path)
  
  return data.publicUrl
}

// Helper para real-time subscriptions
export function subscribeToTable(table, callback) {
  return supabase
    .channel(`public:${table}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: table
    }, callback)
    .subscribe()
}

export default supabase