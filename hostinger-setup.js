#!/usr/bin/env node

/**
 * Script de configuração para deploy na Hostinger
 * Execute: node hostinger-setup.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Configurando projeto para deploy na Hostinger...');

// 1. Criar estrutura de pastas
function criarEstrutura() {
  console.log('📁 Criando estrutura de pastas...');
  
  const pastas = [
    'hostinger-deploy',
    'hostinger-deploy/public_html',
    'hostinger-deploy/backend',
    'hostinger-deploy/database'
  ];
  
  pastas.forEach(pasta => {
    if (!fs.existsSync(pasta)) {
      fs.mkdirSync(pasta, { recursive: true });
      console.log(`✅ Pasta criada: ${pasta}`);
    }
  });
}

// 2. Gerar build do frontend
function buildFrontend() {
  console.log('🔨 Gerando build do frontend...');
  
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build do frontend concluído');
    
    // Copiar arquivos do build
    execSync('xcopy dist\\* hostinger-deploy\\public_html\\ /E /I /Y', { stdio: 'inherit' });
    console.log('✅ Arquivos copiados para public_html');
  } catch (error) {
    console.error('❌ Erro no build do frontend:', error.message);
    process.exit(1);
  }
}

// 3. Criar .htaccess
function criarHtaccess() {
  console.log('⚙️ Criando arquivo .htaccess...');
  
  const htaccess = `RewriteEngine On
RewriteBase /

# Handle React Routes
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule . /index.html [L]

# API Routes - Redirecionar para Node.js
RewriteRule ^api/(.*)$ http://localhost:3000/api/$1 [P,L]

# Security Headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache Control
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>`;
  
  fs.writeFileSync('hostinger-deploy/public_html/.htaccess', htaccess);
  console.log('✅ Arquivo .htaccess criado');
}

// 4. Preparar backend
function prepararBackend() {
  console.log('🔧 Preparando backend...');
  
  // Copiar arquivos do backend
  execSync('xcopy backend\\* hostinger-deploy\\backend\\ /E /I /Y', { stdio: 'inherit' });
  
  // Copiar schema MySQL
  if (fs.existsSync('prisma/schema-mysql.prisma')) {
    if (!fs.existsSync('hostinger-deploy/backend/prisma')) {
      fs.mkdirSync('hostinger-deploy/backend/prisma', { recursive: true });
    }
    fs.copyFileSync('prisma/schema-mysql.prisma', 'hostinger-deploy/backend/prisma/schema.prisma');
    console.log('✅ Schema MySQL copiado');
  }
  
  // Criar package.json otimizado
  const packageJson = {
    "name": "imobigestor-backend",
    "version": "1.0.0",
    "main": "index.js",
    "scripts": {
      "start": "node index.js",
      "setup": "npm install --production && npx prisma generate && npx prisma db push"
    },
    "dependencies": {
      "@prisma/client": "^6.14.0",
      "bcryptjs": "^2.4.3",
      "cors": "^2.8.5",
      "dotenv": "^16.4.5",
      "express": "^4.18.2",
      "express-rate-limit": "^7.5.1",
      "helmet": "^7.2.0",
      "jsonwebtoken": "^9.0.2",
      "multer": "^1.4.5-lts.1",
      "mysql2": "^3.6.0",
      "prisma": "^6.14.0",
      "winston": "^3.17.0",
      "winston-daily-rotate-file": "^4.7.1",
      "zod": "^3.25.76"
    }
  };
  
  fs.writeFileSync('hostinger-deploy/backend/package.json', JSON.stringify(packageJson, null, 2));
  console.log('✅ Package.json do backend criado');
}

// 5. Criar arquivo .env de exemplo
function criarEnvExample() {
  console.log('📝 Criando arquivo .env de exemplo...');
  
  const envExample = `# Configurações do Banco de Dados MySQL
DATABASE_URL="mysql://usuario:senha@localhost:3306/imobigestor_db"

# Segurança
JWT_SECRET="seu_jwt_secret_muito_seguro_aqui_mude_isso"

# Ambiente
NODE_ENV="production"

# CORS
CORS_ORIGIN="https://seudominio.com"

# Servidor
PORT=3000

# Logs
LOG_LEVEL="info"

# Upload de arquivos
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/gif,application/pdf"

# Configurações específicas da Hostinger
HOST="0.0.0.0"
DB_HOST="localhost"
DB_PORT=3306`;
  
  fs.writeFileSync('hostinger-deploy/backend/.env.example', envExample);
  console.log('✅ Arquivo .env.example criado');
}

// 6. Criar script SQL de inicialização
function criarScriptSQL() {
  console.log('🗄️ Criando script SQL...');
  
  const sqlScript = `-- Script de inicialização para MySQL
-- Execute este script no phpMyAdmin da Hostinger

-- Criar banco de dados (se não existir)
CREATE DATABASE IF NOT EXISTS imobigestor_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Usar o banco
USE imobigestor_db;

-- Verificar se as tabelas foram criadas pelo Prisma
SHOW TABLES;

-- Inserir configurações padrão
INSERT IGNORE INTO Configuracao (id, chave, valor, descricao, tipo) VALUES
(UUID(), 'app_name', 'ImobiGestor', 'Nome da aplicação', 'string'),
(UUID(), 'app_version', '1.0.0', 'Versão da aplicação', 'string'),
(UUID(), 'max_file_size', '10485760', 'Tamanho máximo de arquivo em bytes', 'number'),
(UUID(), 'allowed_file_types', '["image/jpeg","image/png","image/gif","application/pdf"]', 'Tipos de arquivo permitidos', 'json');

-- Verificar dados inseridos
SELECT * FROM Configuracao;`;
  
  fs.writeFileSync('hostinger-deploy/database/init.sql', sqlScript);
  console.log('✅ Script SQL criado');
}

// 7. Criar guia de instalação
function criarGuiaInstalacao() {
  console.log('📖 Criando guia de instalação...');
  
  const guia = `# Guia de Instalação - Hostinger

## Passos para Deploy

### 1. Upload dos Arquivos
1. Faça upload da pasta \`public_html\` para a raiz do seu domínio
2. Faça upload da pasta \`backend\` para fora da pasta public_html

### 2. Configurar Banco de Dados
1. Acesse o painel da Hostinger
2. Vá em "Bancos de Dados" → "MySQL"
3. Crie um novo banco: \`imobigestor_db\`
4. Execute o script \`database/init.sql\` no phpMyAdmin

### 3. Configurar Node.js
1. No painel da Hostinger, vá em "Avançado" → "Node.js"
2. Crie uma nova aplicação:
   - Versão: 18.x ou superior
   - Pasta: \`/backend\`
   - Arquivo: \`index.js\`
   - Porta: 3000

### 4. Instalar Dependências
\`\`\`bash
cd backend
npm run setup
\`\`\`

### 5. Configurar Variáveis de Ambiente
1. Copie \`.env.example\` para \`.env\`
2. Configure as variáveis com seus dados reais

### 6. Testar
- Frontend: https://seudominio.com
- API: https://seudominio.com/api/

## Troubleshooting

### Erro 500
- Verifique logs no painel Node.js
- Confirme se .env está configurado
- Teste conexão com banco

### API não funciona
- Verifique se aplicação Node.js está rodando
- Confirme configuração do .htaccess
- Teste endpoints diretamente

## Suporte
Para suporte, use o chat 24/7 da Hostinger em português.`;
  
  fs.writeFileSync('hostinger-deploy/INSTALACAO.md', guia);
  console.log('✅ Guia de instalação criado');
}

// Executar todas as funções
function main() {
  try {
    criarEstrutura();
    buildFrontend();
    criarHtaccess();
    prepararBackend();
    criarEnvExample();
    criarScriptSQL();
    criarGuiaInstalacao();
    
    console.log('\n🎉 Configuração concluída!');
    console.log('📁 Arquivos prontos na pasta: hostinger-deploy/');
    console.log('📖 Leia o arquivo INSTALACAO.md para próximos passos');
    console.log('\n⚠️  Não esqueça de:');
    console.log('   1. Configurar o banco MySQL na Hostinger');
    console.log('   2. Criar e configurar o arquivo .env');
    console.log('   3. Ativar a aplicação Node.js no painel');
    
  } catch (error) {
    console.error('❌ Erro durante a configuração:', error.message);
    process.exit(1);
  }
}

// Verificar se está sendo executado diretamente
if (require.main === module) {
  main();
}

module.exports = { main };