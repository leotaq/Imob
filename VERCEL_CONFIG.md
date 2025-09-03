# Configuração do Vercel para ImobiGestor

## Variáveis de Ambiente Necessárias

Para que o sistema funcione corretamente no Vercel, você precisa configurar as seguintes variáveis de ambiente no painel do Vercel:

### 1. Configurações do Supabase
```
SUPABASE_URL=sua_url_do_supabase
SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico_do_supabase
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

### 2. Configurações da API
```
VITE_API_URL=https://seu-projeto.vercel.app/api
CORS_ORIGIN=https://seu-projeto.vercel.app
```

### 3. Configurações de Segurança
```
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
NODE_ENV=production
```

### 4. Configurações do Banco de Dados
```
DATABASE_URL=sua_connection_string_do_postgresql
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