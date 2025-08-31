# 🚀 Deploy no Vercel - ImobiGestor

## 📋 Pré-requisitos

### 1. ✅ Projeto já está preparado:
- ✅ Código limpo e organizado
- ✅ 28 arquivos temporários removidos
- ✅ Configuração `vercel.json` criada
- ✅ Código commitado no GitHub

### 2. 🗄️ Banco de Dados
Você precisará de um banco PostgreSQL em produção. Opções recomendadas:
- **Neon** (gratuito): https://neon.tech
- **Supabase** (gratuito): https://supabase.com
- **Railway** (gratuito): https://railway.app
- **PlanetScale** (MySQL, mas compatível)

## 🎯 Passos para Deploy

### 1. 🔗 Conectar ao Vercel
1. Acesse https://vercel.com
2. Faça login com sua conta GitHub
3. Clique em "New Project"
4. Selecione o repositório `Imob`
5. Configure as seguintes opções:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (raiz)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 2. ⚙️ Configurar Variáveis de Ambiente
No painel do Vercel, vá em **Settings > Environment Variables** e adicione:

```env
# Banco de Dados
DATABASE_URL=postgresql://usuario:senha@host:5432/database

# Autenticação
JWT_SECRET=sua_chave_secreta_super_forte_de_pelo_menos_32_caracteres
JWT_EXPIRES_IN=7d

# Servidor
NODE_ENV=production
PORT=3000

# CORS
CORS_ORIGIN=https://seu-dominio.vercel.app

# Logs
LOG_LEVEL=info

# Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf
```

### 3. 🗄️ Configurar Banco de Dados

#### Opção A: Neon (Recomendado)
1. Crie conta em https://neon.tech
2. Crie um novo projeto
3. Copie a `DATABASE_URL`
4. Cole nas variáveis de ambiente do Vercel

#### Opção B: Supabase
1. Crie conta em https://supabase.com
2. Crie um novo projeto
3. Vá em Settings > Database
4. Copie a Connection String (URI)
5. Cole nas variáveis de ambiente do Vercel

### 4. 🔄 Executar Migrações
Após configurar o banco, você precisa executar as migrações:

1. Clone o repositório localmente (se não tiver)
2. Configure o `.env` local com a `DATABASE_URL` de produção
3. Execute:
```bash
npm install
cd backend
npx prisma migrate deploy
npx prisma generate
```

### 5. 👥 Criar Usuários Iniciais
Após as migrações, crie os usuários de teste:

```bash
# No diretório backend
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createUsers() {
  const users = [
    { codigo: 'master', email: 'master@imobigestor.com', senha: '123456', nome: 'Master User', telefone: '(11) 99999-0001', isMaster: true },
    { codigo: 'gestor', email: 'gestor@imobigestor.com', senha: '123456', nome: 'Gestor User', telefone: '(11) 99999-0002', isGestor: true },
    { codigo: 'prestador', email: 'prestador@imobigestor.com', senha: '123456', nome: 'Prestador User', telefone: '(11) 99999-0003' },
    { codigo: 'usuario', email: 'usuario@imobigestor.com', senha: '123456', nome: 'Usuario Comum', telefone: '(11) 99999-0004' }
  ];

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.senha, 10);
    await prisma.usuario.create({
      data: { ...user, senha: hashedPassword }
    });
  }
  
  console.log('Usuários criados com sucesso!');
  await prisma.$disconnect();
}

createUsers().catch(console.error);
"
```

### 6. 🚀 Deploy
1. Faça push das mudanças para o GitHub:
```bash
git add .
git commit -m "Configuração para deploy no Vercel"
git push origin main
```

2. O Vercel fará o deploy automaticamente
3. Aguarde a conclusão (2-5 minutos)

### 7. ✅ Verificar Deploy
1. Acesse a URL fornecida pelo Vercel
2. Teste o login com os usuários criados:
   - **Master**: master@imobigestor.com / 123456
   - **Gestor**: gestor@imobigestor.com / 123456
   - **Prestador**: prestador@imobigestor.com / 123456
   - **Usuário**: usuario@imobigestor.com / 123456

## 🔧 Configurações Adicionais

### Domínio Personalizado
1. No Vercel, vá em **Settings > Domains**
2. Adicione seu domínio personalizado
3. Configure os DNS conforme instruções
4. Atualize `CORS_ORIGIN` nas variáveis de ambiente

### Monitoramento
- **Logs**: Disponíveis no painel do Vercel
- **Analytics**: Ative nas configurações do projeto
- **Uptime**: Configure alertas de disponibilidade

## 🐛 Solução de Problemas

### Build Falha
- Verifique se todas as dependências estão no `package.json`
- Confirme se o comando de build está correto
- Verifique logs de erro no painel do Vercel

### Erro de Banco
- Confirme se `DATABASE_URL` está correta
- Verifique se as migrações foram executadas
- Teste conexão localmente primeiro

### Erro de CORS
- Atualize `CORS_ORIGIN` com a URL correta do Vercel
- Verifique se não há URLs hardcoded no frontend

### API não funciona
- Confirme se as rotas estão configuradas no `vercel.json`
- Verifique se as variáveis de ambiente estão definidas
- Teste endpoints individualmente

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no painel do Vercel
2. Teste localmente primeiro
3. Confirme todas as variáveis de ambiente
4. Verifique se o banco está acessível

---

**✅ Projeto pronto para produção no Vercel!** 🎉