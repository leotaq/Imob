# 🚀 Deploy Rápido na Vercel

## ⚡ Deploy em 5 Minutos

### 1. Preparar Supabase
```bash
# 1. Crie uma conta em: https://app.supabase.com
# 2. Crie um novo projeto
# 3. Anote suas credenciais
```

### 2. Configurar Projeto
```bash
# Copiar variáveis de ambiente
cp .env.vercel.example .env.local

# Editar com suas credenciais do Supabase
# VITE_SUPABASE_URL=https://[SEU-PROJETO].supabase.co
# VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
# DATABASE_URL=postgresql://postgres:[SENHA]@db.[PROJETO].supabase.co:5432/postgres
```

### 3. Aplicar Schema
```bash
npm run supabase:migrate
```

### 4. Deploy Automático
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login na Vercel
vercel login

# Deploy automático
npm run deploy:vercel:auto
```

## 🎯 Ou Deploy Manual

### Via Dashboard da Vercel
1. Acesse: https://vercel.com/dashboard
2. Clique "New Project"
3. Conecte seu repositório GitHub
4. Configure:
   - Framework: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Adicione variáveis de ambiente
6. Clique "Deploy"

### Via CLI
```bash
vercel --prod
```

## ✅ Verificar Deploy

### Testar Endpoints
```bash
# Substituir pela sua URL
curl https://seu-projeto.vercel.app/api/me
```

### Verificar Logs
```bash
vercel logs --follow
```

## 🔧 Variáveis Obrigatórias

```env
# Supabase (obrigatório)
VITE_SUPABASE_URL=https://[projeto].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIs...
DATABASE_URL=postgresql://postgres:[senha]@db.[projeto].supabase.co:5432/postgres

# Autenticação (obrigatório)
JWT_SECRET=seu_jwt_secret_muito_seguro

# Ambiente (obrigatório)
NODE_ENV=production
CORS_ORIGIN=https://seu-projeto.vercel.app
```

## 🚨 Troubleshooting

### Build Falha
```bash
# Testar build local
npm run build

# Ver logs detalhados
vercel logs
```

### Database Erro
```bash
# Testar conexão
npx prisma db push

# Verificar URL
echo $DATABASE_URL
```

### API Não Funciona
- Verificar variáveis de ambiente
- Confirmar `module.exports = app` no backend
- Testar endpoints localmente

## 📱 Funcionalidades Incluídas

✅ **Frontend React**
- Interface moderna
- Responsivo
- PWA ready

✅ **Backend Node.js**
- API REST completa
- Autenticação JWT
- Upload de arquivos
- Rate limiting

✅ **Database Supabase**
- PostgreSQL gerenciado
- Backups automáticos
- Real-time opcional

✅ **Deploy Vercel**
- SSL automático
- CDN global
- Auto-deploy via Git

## 🎉 Pronto!

Seu projeto estará disponível em:
`https://seu-projeto.vercel.app`

### Próximos Passos
1. Configurar domínio customizado
2. Configurar alertas de monitoramento
3. Configurar backup do banco
4. Testar todas as funcionalidades

---

**Documentação Completa**: [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)