const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = 'https://zdigzvlpwxmojyohzrfj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkaWd6dmxwd3htb2p5b2h6cmZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzE0NzQsImV4cCI6MjA1MDU0NzQ3NH0.8vQJU8W8X9Y7Z6A5B4C3D2E1F0G9H8I7J6K5L4M3N2O1P0Q9R8S7T6U5V4W3X2Y1Z0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabase() {
  try {
    console.log('🔍 Testando conexão com Supabase...');
    
    // Testar autenticação básica
    console.log('🔐 Testando autenticação...');
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Erro na sessão:', sessionError.message);
    } else {
      console.log('✅ Sessão obtida com sucesso');
    }
    
    // Testar acesso ao banco
    console.log('🗄️ Testando acesso ao banco...');
    const { data: users, error: dbError } = await supabase
      .from('Usuario')
      .select('id, email')
      .limit(1);
    
    if (dbError) {
      console.error('❌ Erro no banco:', dbError.message);
    } else {
      console.log('✅ Acesso ao banco funcionando. Usuários encontrados:', users?.length || 0);
    }
    
    // Testar storage (sem criar bucket)
    console.log('📁 Testando acesso ao storage...');
    const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
    
    if (storageError) {
      console.error('❌ Erro no storage:', storageError.message);
      console.log('💡 Isso pode ser normal se não houver buckets criados ou se precisar de permissões especiais');
    } else {
      console.log('✅ Storage acessível. Buckets encontrados:', buckets?.map(b => b.name) || []);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testSupabase();