# Guia de Deploy com Supabase

## Por que Supabase?

✅ **PostgreSQL** (compatível com o schema atual)  
✅ **Gratuito** até 500MB de dados  
✅ **Autenticação** integrada  
✅ **Storage** para arquivos  
✅ **Real-time** subscriptions  
✅ **Dashboard** intuitivo  
✅ **API REST** automática  

## Configuração do Supabase

### 1. 🚀 Criar Projeto

1. **Acesse:** https://supabase.com
2. **Crie conta** e faça login
3. **Novo projeto:**
   - Nome: `ImobiGestor`
   - Região: `South America (São Paulo)`
   - Senha do banco: (gere uma senha forte)

### 2. 🗄️ Configurar Banco de Dados

#### A. Obter URL de Conexão
```
Settings → Database → Connection string → URI
```

Exemplo:
```
postgresql://postgres:[SUA-SENHA]@db.[SEU-PROJETO].supabase.co:5432/postgres
```

#### B. Configurar Variáveis de Ambiente
```env
# .env
DATABASE_URL="postgresql://postgres:[SUA-SENHA]@db.[SEU-PROJETO].supabase.co:5432/postgres"
JWT_SECRET="seu_jwt_secret_muito_seguro"
NODE_ENV="production"
CORS_ORIGIN="https://seu-dominio.vercel.app"

# Supabase específico
SUPABASE_URL="https://[SEU-PROJETO].supabase.co"
SUPABASE_ANON_KEY="[SUA-CHAVE-PUBLICA]"
SUPABASE_SERVICE_KEY="[SUA-CHAVE-SERVICO]"
```

### 3. 📊 Executar Migrações

#### Opção A: Via Prisma (Recomendado)
```bash
# Gerar cliente
npx prisma generate

# Aplicar schema
npx prisma db push

# Verificar
npx prisma studio
```

#### Opção B: Via SQL Editor do Supabase
1. **Acesse:** Dashboard → SQL Editor
2. **Execute** o schema manualmente

## Deploy Options

### 🔥 Opção 1: Vercel + Supabase (Recomendado)

#### Vantagens:
- ✅ **Serverless** completo
- ✅ **Escalabilidade** automática
- ✅ **Deploy** instantâneo
- ✅ **SSL** gratuito
- ✅ **CDN** global

#### Configuração:
```bash
# 1. Deploy no Vercel
npm run build
vercel --prod

# 2. Configurar variáveis no Vercel
# Dashboard → Settings → Environment Variables
```

**Variáveis no Vercel:**
```
DATABASE_URL=postgresql://postgres:[SENHA]@db.[PROJETO].supabase.co:5432/postgres
JWT_SECRET=seu_jwt_secret_muito_seguro
NODE_ENV=production
CORS_ORIGIN=https://seu-dominio.vercel.app
SUPABASE_URL=https://[PROJETO].supabase.co
SUPABASE_ANON_KEY=[CHAVE-PUBLICA]
```

### 🌐 Opção 2: Hostinger + Supabase

#### Configuração:
```bash
# 1. Preparar arquivos
npm run deploy:hostinger

# 2. Modificar schema para PostgreSQL
# (manter schema.prisma original)

# 3. Upload e configurar
```

**Variáveis no Hostinger:**
```env
DATABASE_URL="postgresql://postgres:[SENHA]@db.[PROJETO].supabase.co:5432/postgres"
JWT_SECRET="seu_jwt_secret_muito_seguro"
NODE_ENV="production"
CORS_ORIGIN="https://seudominio.com"
```

## Recursos Avançados do Supabase

### 🔐 Autenticação (Opcional)

Pode substituir o JWT customizado:

```javascript
// Instalar SDK
npm install @supabase/supabase-js

// Configurar cliente
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})
```

### 📁 Storage para Arquivos

```javascript
// Upload de arquivo
const { data, error } = await supabase.storage
  .from('uploads')
  .upload('public/avatar.png', file)

// URL pública
const { data } = supabase.storage
  .from('uploads')
  .getPublicUrl('public/avatar.png')
```

### 📡 Real-time (Opcional)

```javascript
// Escutar mudanças
supabase
  .channel('solicitacoes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'Solicitacao'
  }, (payload) => {
    console.log('Mudança detectada:', payload)
  })
  .subscribe()
```

## Configuração de Segurança

### 🛡️ Row Level Security (RLS)

```sql
-- Ativar RLS
ALTER TABLE "Usuario" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Empresa" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Solicitacao" ENABLE ROW LEVEL SECURITY;

-- Políticas de exemplo
CREATE POLICY "Usuários podem ver próprios dados" ON "Usuario"
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Empresas podem ver próprios dados" ON "Empresa"
  FOR SELECT USING (id IN (
    SELECT "empresaId" FROM "Usuario" WHERE id = auth.uid()::text
  ));
```

### 🔑 API Keys

- **Anon Key:** Frontend (público)
- **Service Key:** Backend (privado)
- **JWT Secret:** Verificação de tokens

## Monitoramento

### 📊 Dashboard Supabase
- **Database:** Visualizar tabelas e dados
- **Auth:** Gerenciar usuários
- **Storage:** Arquivos enviados
- **Logs:** Queries e erros
- **API:** Documentação automática

### 📈 Métricas
- **Conexões ativas**
- **Queries por segundo**
- **Storage utilizado**
- **Bandwidth**

## Backup e Migração

### 💾 Backup Automático
- **Point-in-time recovery** (planos pagos)
- **Daily backups** (gratuito)
- **Export manual** via Dashboard

### 🔄 Migração de Dados
```bash
# Export do banco atual
pg_dump $OLD_DATABASE_URL > backup.sql

# Import para Supabase
psql $SUPABASE_DATABASE_URL < backup.sql
```

## Custos

### 🆓 Plano Gratuito
- **500MB** de dados
- **2GB** de bandwidth
- **50MB** de storage
- **50.000** requisições/mês

### 💰 Plano Pro ($25/mês)
- **8GB** de dados
- **250GB** de bandwidth
- **100GB** de storage
- **5 milhões** de requisições/mês

## Troubleshooting

### ❌ Problemas Comuns

**1. Erro de conexão:**
```
Error: getaddrinfo ENOTFOUND
```
**Solução:** Verificar URL e senha do banco

**2. Erro de SSL:**
```
Error: self signed certificate
```
**Solução:** Adicionar `?sslmode=require` na URL

**3. Timeout de conexão:**
**Solução:** Verificar região do projeto

### 🔧 Debug
```javascript
// Ativar logs detalhados
process.env.DEBUG = 'prisma:*'

// Testar conexão
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testConnection() {
  try {
    await prisma.$connect()
    console.log('✅ Conexão com Supabase OK')
  } catch (error) {
    console.error('❌ Erro de conexão:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
```

## Scripts Úteis

```json
{
  "scripts": {
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:studio": "prisma studio",
    "db:reset": "prisma migrate reset",
    "deploy:supabase": "prisma db push && npm run build"
  }
}
```

---

## 🎯 Resumo: Deploy Completo

### Passos Rápidos:
1. **Criar projeto** no Supabase
2. **Copiar DATABASE_URL**
3. **Configurar variáveis** de ambiente
4. **Executar:** `npx prisma db push`
5. **Deploy:** Vercel ou Hostinger
6. **Testar** aplicação

### Resultado:
✅ **Frontend + Backend** funcionando  
✅ **Banco PostgreSQL** na nuvem  
✅ **Backups automáticos**  
✅ **Dashboard** para gerenciar dados  
✅ **Escalabilidade** automática  

**Supabase + Vercel = Combinação perfeita para seu projeto!** 🚀