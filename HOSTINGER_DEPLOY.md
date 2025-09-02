# Guia de Deploy na Hostinger

## Pré-requisitos

### 1. Plano da Hostinger
Você precisará de um plano que suporte:
- **Node.js** (Business ou Premium)
- **Banco de dados MySQL/PostgreSQL**
- **SSL gratuito**
- **Domínio próprio**

### 2. Preparação do Projeto

#### Estrutura para Hostinger
```
├── public_html/          # Frontend (build do React)
├── backend/              # API Node.js
├── package.json          # Dependências
├── .htaccess            # Configuração Apache
└── database/            # Scripts SQL
```

## Passos para Deploy

### 1. 🗄️ Configurar Banco de Dados

1. **Acesse o painel da Hostinger**
2. **Vá em "Bancos de Dados" → "MySQL"**
3. **Crie um novo banco:**
   - Nome: `imobigestor_db`
   - Usuário: `imobigestor_user`
   - Senha: (gere uma senha forte)

4. **Configure a URL de conexão:**
```env
DATABASE_URL="mysql://imobigestor_user:sua_senha@localhost:3306/imobigestor_db"
```

### 2. 📁 Preparar Arquivos

#### A. Build do Frontend
```bash
# No seu computador
npm run build
```

#### B. Criar .htaccess para SPA
```apache
# .htaccess na pasta public_html
RewriteEngine On
RewriteBase /

# Handle Angular and React Routes
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# API Routes
RewriteRule ^api/(.*)$ /backend/index.js [L,QSA]

# Security Headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
```

#### C. Configurar package.json para produção
```json
{
  "name": "imobigestor",
  "version": "1.0.0",
  "scripts": {
    "start": "node backend/index.js",
    "install-deps": "npm install --production"
  },
  "dependencies": {
    "@prisma/client": "^6.14.0",
    "express": "^4.18.2",
    "mysql2": "^3.6.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "helmet": "^7.2.0",
    "dotenv": "^16.4.5"
  }
}
```

### 3. 🔧 Adaptar Backend para MySQL

#### A. Atualizar schema.prisma
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// Resto do schema permanece igual
```

#### B. Configurar variáveis de ambiente
Crie arquivo `.env` no backend:
```env
DATABASE_URL="mysql://usuario:senha@localhost:3306/banco"
JWT_SECRET="seu_jwt_secret_muito_seguro"
NODE_ENV="production"
CORS_ORIGIN="https://seudominio.com"
PORT=3000
```

### 4. 📤 Upload dos Arquivos

#### Via File Manager da Hostinger:

1. **Frontend (pasta public_html):**
   - Upload de todos os arquivos da pasta `dist/`
   - Upload do `.htaccess`

2. **Backend (pasta backend):**
   - Upload de todos os arquivos do backend
   - Upload do `package.json`
   - Upload do `.env`

3. **Estrutura final:**
```
public_html/
├── index.html
├── assets/
├── .htaccess
backend/
├── index.js
├── utils/
├── middleware/
├── schemas/
├── package.json
├── .env
prisma/
└── schema.prisma
```

### 5. 🚀 Configurar Node.js

1. **No painel da Hostinger:**
   - Vá em "Avançado" → "Node.js"
   - Clique em "Criar aplicação"

2. **Configurações:**
   - **Versão Node.js:** 18.x ou superior
   - **Pasta da aplicação:** `/backend`
   - **Arquivo de inicialização:** `index.js`
   - **Porta:** 3000

3. **Instalar dependências:**
```bash
# No terminal da Hostinger
cd backend
npm install --production
npx prisma generate
npx prisma db push
```

### 6. 🔗 Configurar Proxy/Redirecionamento

#### Opção A: Via .htaccess (Recomendado)
Já configurado no passo 2B.

#### Opção B: Via subdomain
- Frontend: `https://seudominio.com`
- API: `https://api.seudominio.com`

### 7. 🔒 SSL e Segurança

1. **Ativar SSL gratuito** no painel da Hostinger
2. **Forçar HTTPS** nas configurações do domínio
3. **Configurar CORS** no backend:

```javascript
// backend/index.js
const cors = require('cors');

app.use(cors({
  origin: ['https://seudominio.com', 'https://www.seudominio.com'],
  credentials: true
}));
```

## Variáveis de Ambiente

```env
# .env no backend
DATABASE_URL="mysql://usuario:senha@localhost:3306/banco"
JWT_SECRET="jwt_secret_muito_seguro_aqui"
NODE_ENV="production"
CORS_ORIGIN="https://seudominio.com"
PORT=3000
LOG_LEVEL="info"
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/gif,application/pdf"
```

## Comandos Úteis

```bash
# Instalar dependências
npm install --production

# Gerar cliente Prisma
npx prisma generate

# Sincronizar banco (primeira vez)
npx prisma db push

# Ver logs da aplicação
tail -f logs/app.log

# Reiniciar aplicação Node.js
# (via painel da Hostinger)
```

## Troubleshooting

### Problemas Comuns:

1. **Erro 500 - Internal Server Error**
   - Verifique logs no painel da Hostinger
   - Confirme se todas as dependências foram instaladas
   - Verifique se o arquivo `.env` está correto

2. **Erro de conexão com banco**
   - Confirme credenciais do MySQL
   - Teste conexão via phpMyAdmin
   - Verifique se o banco foi criado

3. **Rotas da API não funcionam**
   - Verifique configuração do `.htaccess`
   - Confirme se a aplicação Node.js está rodando
   - Teste endpoints diretamente

4. **Frontend não carrega**
   - Verifique se arquivos estão na pasta `public_html`
   - Confirme configuração do `.htaccess`
   - Teste se SSL está ativo

## Monitoramento

- **Logs:** Painel Hostinger → Node.js → Logs
- **Uptime:** Configure monitoramento via UptimeRobot
- **Performance:** Use ferramentas como GTmetrix

## Backup

1. **Banco de dados:** Export via phpMyAdmin
2. **Arquivos:** Download via File Manager
3. **Automatizado:** Configure backups no painel

---

**💡 Dica:** A Hostinger oferece suporte 24/7 em português. Use o chat se precisar de ajuda específica com a configuração do servidor.