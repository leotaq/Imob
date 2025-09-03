# Configuração do Vercel para ImobiGestor

## Variáveis de Ambiente Necessárias

### Frontend (VITE_*)
```
VITE_API_URL=https://imob-v1.vercel.app/api
VITE_SUPABASE_URL=https://zdigzvlpwxmojyohzrfj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkaWd6dmxwd3htb2p5b2h6cmZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzE0NzQsImV4cCI6MjA1MDU0NzQ3NH0.8vQJU8W8X9Y7Z6A5B4C3D2E1F0G9H8I7J6K5L4M3N2O1P0Q9R8S7T6U5V4W3X2Y1Z0
```

### Backend
```
CORS_ORIGIN=https://imob-v1.vercel.app,https://imobigestor.vercel.app
SUPABASE_URL=https://zdigzvlpwxmojyohzrfj.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkaWd6dmxwd3htb2p5b2h6cmZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzE0NzQsImV4cCI6MjA1MDU0NzQ3NH0.8vQJU8W8X9Y7Z6A5B4C3D2E1F0G9H8I7J6K5L4M3N2O1P0Q9R8S7T6U5V4W3X2Y1Z0
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### Segurança
```
JWT_SECRET=sua_chave_secreta_super_forte_aqui_com_pelo_menos_32_caracteres_imobigestor_2024
NODE_ENV=production
```

### Banco de Dados
```
DATABASE_URL=postgresql://postgres:%23L1e2o3ariele@db.bywqzabvdtnbsrrgpwek.supabase.co:5432/postgres
```

## Como Configurar no Vercel

1. Acesse o painel do Vercel (https://vercel.com/dashboard)
2. Selecione seu projeto
3. Vá para a aba "Settings"
4. Clique em "Environment Variables"
5. Adicione cada variável listada acima
6. **IMPORTANTE**: Substitua `seu-projeto` pela URL real do seu projeto no Vercel
7. Faça um novo deploy do projeto

## Testando a Configuração

Após o deploy, teste primeiro o endpoint de saúde da API:
- Acesse: `https://seu-projeto.vercel.app/api/health`
- Deve retornar: `{"status": "OK", "message": "API funcionando corretamente"}`

Se o endpoint de saúde funcionar, teste o login na aplicação.

## Problemas Comuns

### Erro de CORS
- Verifique se a variável `CORS_ORIGIN` está configurada com a URL correta do seu projeto no Vercel
- Certifique-se de que não há espaços extras nas URLs

### Erro de Conexão com API
- Verifique se a variável `VITE_API_URL` está configurada corretamente
- A URL deve terminar com `/api`

### Erro de Autenticação
- Verifique se o `JWT_SECRET` está configurado
- Use um valor seguro e único para produção

## Testando a Configuração

Após configurar as variáveis:
1. Faça um novo deploy
2. Acesse a URL do seu projeto
3. Tente fazer login com as credenciais de teste
4. Verifique o console do navegador para erros

## URLs de Exemplo

Se seu projeto no Vercel for `imobigestor.vercel.app`, as configurações seriam:
```
VITE_API_URL=https://imobigestor.vercel.app/api
CORS_ORIGIN=https://imobigestor.vercel.app
```