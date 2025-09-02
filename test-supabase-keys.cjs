const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Função para ler variáveis do .env
function loadEnvVars() {
  const envPath = path.join(__dirname, '.env');
  const envLocalPath = path.join(__dirname, '.env.local');
  
  const vars = {};
  
  // Ler .env
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        vars[key.trim()] = value.trim().replace(/"/g, '');
      }
    });
  }
  
  // Ler .env.local (sobrescreve .env)
  if (fs.existsSync(envLocalPath)) {
    const envContent = fs.readFileSync(envLocalPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        vars[key.trim()] = value.trim().replace(/"/g, '');
      }
    });
  }
  
  return vars;
}

// Função para decodificar JWT e verificar validade
function decodeJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'Token inválido - formato incorreto' };
    }
    
    const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    
    const now = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp && payload.exp < now;
    
    return {
      valid: !isExpired,
      header,
      payload,
      isExpired,
      expiresAt: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'Nunca',
      issuedAt: payload.iat ? new Date(payload.iat * 1000).toISOString() : 'Desconhecido'
    };
  } catch (error) {
    return { valid: false, error: `Erro ao decodificar: ${error.message}` };
  }
}

async function testSupabaseKeys() {
  console.log('🔍 Testando chaves do Supabase...\n');
  
  const envVars = loadEnvVars();
  
  const supabaseUrl = envVars.VITE_SUPABASE_URL || envVars.SUPABASE_URL;
  const anonKey = envVars.VITE_SUPABASE_ANON_KEY || envVars.SUPABASE_ANON_KEY;
  const serviceKey = envVars.SUPABASE_SERVICE_KEY;
  
  console.log('📋 Configurações encontradas:');
  console.log(`URL: ${supabaseUrl}`);
  console.log(`Anon Key: ${anonKey ? anonKey.substring(0, 20) + '...' : 'NÃO ENCONTRADA'}`);
  console.log(`Service Key: ${serviceKey ? serviceKey.substring(0, 20) + '...' : 'NÃO ENCONTRADA'}`);
  console.log();
  
  if (!supabaseUrl || !anonKey) {
    console.error('❌ Configurações básicas não encontradas!');
    return;
  }
  
  // Analisar JWT da chave anônima
  console.log('🔐 Análise da chave anônima:');
  const anonAnalysis = decodeJWT(anonKey);
  if (anonAnalysis.valid) {
    console.log('✅ Chave anônima válida');
    console.log(`   Tipo: ${anonAnalysis.payload.role || 'Desconhecido'}`);
    console.log(`   Emitida em: ${anonAnalysis.issuedAt}`);
    console.log(`   Expira em: ${anonAnalysis.expiresAt}`);
    console.log(`   Projeto: ${anonAnalysis.payload.ref || 'Desconhecido'}`);
  } else {
    console.log(`❌ Chave anônima inválida: ${anonAnalysis.error}`);
    if (anonAnalysis.isExpired) {
      console.log('⚠️  A chave expirou!');
    }
  }
  console.log();
  
  // Testar conexão com chave anônima
  console.log('🧪 Testando conexão com chave anônima...');
  try {
    const supabase = createClient(supabaseUrl, anonKey);
    
    // Teste 1: Verificar se a API responde
    const { data: healthCheck, error: healthError } = await supabase
      .from('Usuario')
      .select('count', { count: 'exact', head: true });
    
    if (healthError) {
      console.log(`❌ Erro na conexão: ${healthError.message}`);
      
      if (healthError.message.includes('Invalid API key')) {
        console.log('💡 Sugestão: A chave anônima pode estar inválida ou expirada');
        console.log('   Verifique no dashboard do Supabase: Settings > API');
      }
    } else {
      console.log('✅ Conexão com banco de dados funcionando');
      console.log(`   Usuários na tabela: ${healthCheck || 0}`);
    }
    
    // Teste 2: Verificar storage
    console.log('\n📁 Testando acesso ao storage...');
    const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
    
    if (storageError) {
      console.log(`❌ Erro no storage: ${storageError.message}`);
      
      if (storageError.message.includes('signature verification failed')) {
        console.log('💡 Sugestão: Problema com assinatura da chave');
        console.log('   Isso pode indicar que as chaves precisam ser atualizadas');
      }
    } else {
      console.log('✅ Acesso ao storage funcionando');
      console.log(`   Buckets encontrados: ${buckets?.length || 0}`);
      if (buckets?.length > 0) {
        buckets.forEach(bucket => {
          console.log(`   - ${bucket.name} (${bucket.public ? 'público' : 'privado'})`);
        });
      }
    }
    
  } catch (error) {
    console.log(`❌ Erro geral: ${error.message}`);
  }
  
  console.log();
  console.log('📊 Resumo e recomendações:');
  
  if (!anonAnalysis.valid) {
    console.log('🔄 AÇÃO NECESSÁRIA: Atualizar chaves do Supabase');
    console.log('   1. Acesse: https://app.supabase.com/project/[SEU-PROJETO]/settings/api');
    console.log('   2. Copie as novas chaves (anon key e service_role key)');
    console.log('   3. Atualize os arquivos .env e .env.local');
    console.log('   4. Reinicie o servidor de desenvolvimento');
  } else {
    console.log('✅ Chaves parecem válidas');
    console.log('💡 Se ainda há erros, considere:');
    console.log('   - Verificar se o projeto Supabase está ativo');
    console.log('   - Verificar se as políticas RLS estão configuradas');
    console.log('   - Migrar para as novas chaves publishable/secret (recomendado)');
  }
  
  console.log('\n🔗 Links úteis:');
  console.log('   Dashboard: https://app.supabase.com');
  console.log('   Documentação: https://supabase.com/docs/guides/api/api-keys');
  console.log('   Migração de chaves: https://supabase.com/docs/guides/auth/signing-keys');
}

// Executar teste
testSupabaseKeys().catch(console.error);