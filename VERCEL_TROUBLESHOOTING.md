# Guia de Solução de Problemas - Vercel

## Problema: "Erro de conexão com o servidor"

Este erro geralmente indica que as variáveis de ambiente não estão configuradas corretamente no Vercel.

## Passos para Resolver

### 1. Verificar Deploy

Após fazer push para o repositório, aguarde o deploy automático do Vercel (2-3 minutos).

### 2. Configurar Variáveis de Ambiente no Vercel

**IMPORTANTE**: As variáveis devem ser configuradas através do painel do Vercel, não apenas no código.

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** → **Environment Variables**
4. Adicione TODAS as variáveis abaixo:

#### Variáveis Obrigatórias:

```
NODE_ENV=production
DATABASE_URL=postgresql://postgres:%23L1e2o3ariele@db.bywqzabvdtnbsrrgpwek.supabase.co:5432/postgres
JWT_SECRET=sua_chave_secreta_super_forte_aqui_com_pelo_menos_32_caracteres_imobigestor_2024
CORS_ORIGIN=https://imob-v1.vercel.app,https://imobigestor.vercel.app
VITE_API_URL=https://imob-v1.vercel.app/api
VITE_SUPABASE_URL=https://zdigzvlpwxmojyohzrfj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkaWd6dmxwd3htb2p5b2h6cmZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzE0NzQsImV4cCI6MjA1MDU0NzQ3NH0.8vQJU8W8X9Y7Z6A5B4C3D2E1F0G9H8I7J6K5L4M3N2O1P0Q9R8S7T6U5V4W3X2Y1Z0
SUPABASE_URL=https://zdigzvlpwxmojyohzrfj.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkaWd6dmxwd3htb2p5b2h6cmZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzE0NzQsImV4cCI6MjA1MDU0NzQ3NH0.8vQJU8W8X9Y7Z6A5B4C3D2E1F0G9H8I7J6K5L4M3N2O1P0Q9R8S7T6U5V4W3X2Y1Z0
```

### 3. Configuração das Variáveis

Para cada variável:
1. **Name**: Nome da variável (ex: `DATABASE_URL`)
2. **Value**: Valor da variável
3. **Environments**: Selecione **Production**, **Preview** e **Development**
4. Clique em **Save**

### 4. Forçar Novo Deploy

**CRÍTICO**: Após adicionar as variáveis, você DEVE fazer um novo deploy:

1. Vá em **Deployments**
2. Clique nos 3 pontos do último deploy
3. Selecione **Redeploy**
4. Confirme o redeploy

### 5. Verificar Configuração

Após o redeploy, teste:

1. **Endpoint de Saúde**: https://imob-v1.vercel.app/api/health
2. **Debug de Variáveis**: https://imob-v1.vercel.app/api/debug-env

### 6. Problemas Comuns

#### Variáveis Undefined
- **Causa**: Variáveis não configuradas no painel do Vercel
- **Solução**: Configurar todas as variáveis e fazer redeploy

#### CORS Error
- **Causa**: `CORS_ORIGIN` não configurado
- **Solução**: Adicionar `CORS_ORIGIN` com URLs corretas

#### Database Connection Error
- **Causa**: `DATABASE_URL` incorreta ou não configurada
- **Solução**: Verificar URL do banco e codificação de caracteres especiais

#### JWT Error
- **Causa**: `JWT_SECRET` não configurado
- **Solução**: Adicionar `JWT_SECRET` com pelo menos 32 caracteres

### 7. Checklist Final

- [ ] Todas as 9 variáveis configuradas no Vercel
- [ ] Redeploy realizado após configurar variáveis
- [ ] Endpoint `/api/health` retorna status OK
- [ ] Endpoint `/api/debug-env` mostra todas as variáveis como "SET"
- [ ] Aplicação carrega sem erro de CORS
- [ ] Login funciona corretamente

### 8. Suporte

Se o problema persistir:
1. Verifique os logs do Vercel em **Functions**
2. Teste localmente com `npm run dev`
3. Compare as variáveis locais com as do Vercel

---

**Nota**: Este processo pode levar 5-10 minutos entre configuração e funcionamento completo.