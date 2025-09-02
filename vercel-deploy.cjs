#!/usr/bin/env node

/**
 * Script de deploy automático para Vercel
 * Execute: npm run deploy:vercel:auto
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando deploy automático na Vercel...');

// Verificar se está logado na Vercel
function verificarVercelLogin() {
  console.log('🔐 Verificando login na Vercel...');
  
  try {
    execSync('vercel whoami', { stdio: 'pipe' });
    console.log('✅ Logado na Vercel');
  } catch (error) {
    console.log('❌ Não logado na Vercel');
    console.log('Execute: vercel login');
    process.exit(1);
  }
}

// Verificar variáveis de ambiente
function verificarVariaveis() {
  console.log('⚙️ Verificando variáveis de ambiente...');
  
  const envFile = '.env.local';
  const envExample = '.env.vercel.example';
  
  if (!fs.existsSync(envFile)) {
    if (fs.existsSync(envExample)) {
      console.log('📝 Copiando arquivo de exemplo...');
      fs.copyFileSync(envExample, envFile);
      console.log('⚠️ Configure suas credenciais em .env.local');
      console.log('   Edite o arquivo com suas credenciais do Supabase');
      process.exit(1);
    } else {
      console.log('❌ Arquivo .env.local não encontrado');
      console.log('   Crie o arquivo com suas variáveis de ambiente');
      process.exit(1);
    }
  }
  
  console.log('✅ Arquivo .env.local encontrado');
}

// Verificar se Prisma está configurado
function verificarPrisma() {
  console.log('🗄️ Verificando configuração do Prisma...');
  
  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Cliente Prisma gerado');
  } catch (error) {
    console.log('❌ Erro ao gerar cliente Prisma');
    console.log('   Verifique sua DATABASE_URL');
    process.exit(1);
  }
}

// Fazer build local para testar
function testarBuild() {
  console.log('🔨 Testando build local...');
  
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build local bem-sucedido');
  } catch (error) {
    console.log('❌ Erro no build local');
    console.log('   Corrija os erros antes de fazer deploy');
    process.exit(1);
  }
}

// Verificar se há mudanças não commitadas
function verificarGit() {
  console.log('📝 Verificando status do Git...');
  
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    
    if (status.trim()) {
      console.log('⚠️ Há mudanças não commitadas:');
      console.log(status);
      
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      rl.question('Deseja continuar mesmo assim? (y/N): ', (answer) => {
        rl.close();
        
        if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
          console.log('❌ Deploy cancelado');
          process.exit(1);
        }
        
        continuarDeploy();
      });
      
      return;
    }
    
    console.log('✅ Git está limpo');
    continuarDeploy();
    
  } catch (error) {
    console.log('⚠️ Não é um repositório Git ou Git não está instalado');
    continuarDeploy();
  }
}

// Fazer deploy na Vercel
function fazerDeploy() {
  console.log('🚀 Fazendo deploy na Vercel...');
  
  try {
    // Deploy de produção
    execSync('vercel --prod', { stdio: 'inherit' });
    console.log('✅ Deploy realizado com sucesso!');
    
    // Obter URL do projeto
    try {
      const projectInfo = execSync('vercel inspect', { encoding: 'utf8' });
      const urlMatch = projectInfo.match(/https:\/\/[^\s]+/);
      
      if (urlMatch) {
        console.log('\n🌐 Seu projeto está disponível em:');
        console.log(`   ${urlMatch[0]}`);
      }
    } catch (error) {
      console.log('\n🌐 Verifique sua URL no dashboard da Vercel');
    }
    
  } catch (error) {
    console.log('❌ Erro durante o deploy');
    console.log('   Verifique os logs da Vercel para mais detalhes');
    process.exit(1);
  }
}

// Configurar variáveis de ambiente na Vercel
function configurarVariaveisVercel() {
  console.log('⚙️ Verificando variáveis de ambiente na Vercel...');
  
  const envFile = '.env.local';
  
  if (!fs.existsSync(envFile)) {
    console.log('⚠️ Arquivo .env.local não encontrado');
    console.log('   Configure as variáveis manualmente no dashboard da Vercel');
    return;
  }
  
  try {
    const envContent = fs.readFileSync(envFile, 'utf8');
    const envVars = [];
    
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key] = trimmed.split('=');
        if (key) {
          envVars.push(key.trim());
        }
      }
    });
    
    if (envVars.length > 0) {
      console.log('📋 Variáveis encontradas:');
      envVars.forEach(key => console.log(`   - ${key}`));
      console.log('\n💡 Configure essas variáveis no dashboard da Vercel:');
      console.log('   https://vercel.com/dashboard');
    }
    
  } catch (error) {
    console.log('⚠️ Erro ao ler variáveis de ambiente');
  }
}

// Mostrar próximos passos
function mostrarProximosPassos() {
  console.log('\n🎯 Próximos passos:');
  console.log('   1. Configure as variáveis de ambiente no dashboard da Vercel');
  console.log('   2. Verifique se o banco de dados está acessível');
  console.log('   3. Teste todas as funcionalidades');
  console.log('   4. Configure domínio customizado (opcional)');
  console.log('\n📖 Documentação completa: VERCEL_DEPLOY.md');
}

// Função principal para continuar o deploy
function continuarDeploy() {
  verificarPrisma();
  testarBuild();
  configurarVariaveisVercel();
  fazerDeploy();
  mostrarProximosPassos();
}

// Executar verificações iniciais
function main() {
  try {
    verificarVercelLogin();
    verificarVariaveis();
    verificarGit();
  } catch (error) {
    console.error('❌ Erro durante a execução:', error.message);
    process.exit(1);
  }
}

// Verificar se está sendo executado diretamente
if (require.main === module) {
  main();
}

module.exports = { main };