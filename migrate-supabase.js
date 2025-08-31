#!/usr/bin/env node

/**
 * Script para aplicar schema no Supabase
 */

const { execSync } = require('child_process');

console.log('🗄️ Aplicando schema no Supabase...');

try {
  // Gerar cliente Prisma
  console.log('📦 Gerando cliente Prisma...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Aplicar schema
  console.log('🚀 Aplicando schema no banco...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  
  console.log('✅ Schema aplicado com sucesso!');
  console.log('🎯 Próximos passos:');
  console.log('   1. Acesse o dashboard do Supabase');
  console.log('   2. Verifique se as tabelas foram criadas');
  console.log('   3. Configure RLS se necessário');
  console.log('   4. Teste a aplicação');
  
} catch (error) {
  console.error('❌ Erro na migração:', error.message);
  console.log('
🔧 Troubleshooting:');
  console.log('   1. Verifique se DATABASE_URL está correto');
  console.log('   2. Confirme se o projeto Supabase está ativo');
  console.log('   3. Teste a conexão manualmente');
  process.exit(1);
}