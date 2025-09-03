#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Assistente de Migração de Hospedagem');
console.log('=====================================\n');

// Verificar se o projeto está pronto para migração
function checkProjectReadiness() {
  console.log('📋 Verificando prontidão do projeto...');
  
  const checks = [
    { file: 'backend/package.json', desc: 'Backend package.json' },
    { file: 'backend/index.js', desc: 'Arquivo principal do backend' },
    { file: '.env.production', desc: 'Variáveis de produção' },
    { file: 'package.json', desc: 'Package.json raiz' }
  ];
  
  let allGood = true;
  
  checks.forEach(check => {
    if (fs.existsSync(check.file)) {
      console.log(`✅ ${check.desc}`);
    } else {
      console.log(`❌ ${check.desc} - FALTANDO`);
      allGood = false;
    }
  });
  
  return allGood;
}

// Verificar variáveis de ambiente
function checkEnvironmentVariables() {
  console.log('\n🔧 Verificando variáveis de ambiente...');
  
  const requiredVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'CORS_ORIGIN',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'NODE_ENV'
  ];
  
  let envContent = '';
  if (fs.existsSync('.env.production')) {
    envContent = fs.readFileSync('.env.production', 'utf8');
  }
  
  requiredVars.forEach(varName => {
    if (envContent.includes(varName)) {
      console.log(`✅ ${varName}`);
    } else {
      console.log(`⚠️  ${varName} - Não encontrada em .env.production`);
    }
  });
}

// Mostrar opções de hospedagem
function showHostingOptions() {
  console.log('\n🌐 Opções de Hospedagem Recomendadas:');
  console.log('=====================================');
  
  console.log('\n1. 🚂 RAILWAY (RECOMENDADO)');
  console.log('   ✅ Fácil configuração');
  console.log('   ✅ Suporte nativo a Node.js');
  console.log('   ✅ Plano gratuito generoso');
  console.log('   ✅ Deploy automático via GitHub');
  console.log('   📝 Arquivo: railway.json (já criado)');
  
  console.log('\n2. 🎨 RENDER');
  console.log('   ✅ Interface amigável');
  console.log('   ✅ SSL automático');
  console.log('   ✅ Plano gratuito disponível');
  console.log('   📝 Arquivo: render.yaml (já criado)');
  
  console.log('\n3. 🔷 DIGITALOCEAN APP PLATFORM');
  console.log('   ✅ Boa performance');
  console.log('   ✅ Preço competitivo');
  console.log('   ⚠️  Requer configuração manual');
  
  console.log('\n4. 🟣 HEROKU');
  console.log('   ✅ Muito estável');
  console.log('   ❌ Sem plano gratuito');
  console.log('   💰 A partir de $7/mês');
}

// Instruções específicas para Railway
function showRailwayInstructions() {
  console.log('\n🚂 INSTRUÇÕES PARA RAILWAY:');
  console.log('============================');
  console.log('\n1. Acesse: https://railway.app');
  console.log('2. Faça login com GitHub');
  console.log('3. Clique em "New Project"');
  console.log('4. Selecione "Deploy from GitHub repo"');
  console.log('5. Escolha este repositório');
  console.log('6. Railway detectará automaticamente o railway.json');
  console.log('\n📋 VARIÁVEIS DE AMBIENTE PARA CONFIGURAR:');
  
  const vars = [
    'DATABASE_URL - URL do seu banco Supabase',
    'JWT_SECRET - Chave secreta (32+ caracteres)',
    'CORS_ORIGIN - URL do seu frontend',
    'SUPABASE_URL - URL do projeto Supabase',
    'SUPABASE_ANON_KEY - Chave anônima do Supabase',
    'SUPABASE_SERVICE_ROLE_KEY - Chave de serviço',
    'NODE_ENV - production'
  ];
  
  vars.forEach((v, i) => {
    console.log(`   ${i + 1}. ${v}`);
  });
}

// Instruções específicas para Render
function showRenderInstructions() {
  console.log('\n🎨 INSTRUÇÕES PARA RENDER:');
  console.log('===========================');
  console.log('\n1. Acesse: https://render.com');
  console.log('2. Faça login com GitHub');
  console.log('3. Clique em "New +" → "Blueprint"');
  console.log('4. Conecte seu repositório GitHub');
  console.log('5. Render detectará o render.yaml automaticamente');
  console.log('6. Configure as variáveis de ambiente');
  console.log('7. Clique em "Apply"');
}

// Verificar se Git está configurado
function checkGitStatus() {
  console.log('\n📦 Verificando status do Git...');
  
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status.trim()) {
      console.log('⚠️  Há alterações não commitadas:');
      console.log(status);
      console.log('\n💡 Recomendação: Faça commit antes de fazer deploy');
    } else {
      console.log('✅ Repositório limpo - pronto para deploy');
    }
    
    const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    console.log(`📍 Branch atual: ${branch}`);
    
  } catch (error) {
    console.log('❌ Erro ao verificar Git:', error.message);
  }
}

// Função principal
function main() {
  const isReady = checkProjectReadiness();
  
  if (!isReady) {
    console.log('\n❌ Projeto não está pronto para migração.');
    console.log('📝 Corrija os problemas acima antes de continuar.');
    return;
  }
  
  checkEnvironmentVariables();
  checkGitStatus();
  showHostingOptions();
  
  console.log('\n🎯 RECOMENDAÇÃO:');
  console.log('=================');
  console.log('Para este projeto, recomendamos RAILWAY devido à:');
  console.log('• Facilidade de configuração');
  console.log('• Compatibilidade total com Node.js/Express');
  console.log('• Plano gratuito suficiente');
  console.log('• Deploy automático');
  
  showRailwayInstructions();
  
  console.log('\n🔗 LINKS ÚTEIS:');
  console.log('===============');
  console.log('• Railway: https://railway.app');
  console.log('• Render: https://render.com');
  console.log('• Supabase: https://supabase.com');
  console.log('• Documentação: ./GUIA_MIGRACAO_HOSPEDAGEM.md');
  
  console.log('\n✨ Boa sorte com a migração!');
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { checkProjectReadiness, checkEnvironmentVariables, showHostingOptions };