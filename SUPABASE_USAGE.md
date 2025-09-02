# Como usar Supabase no projeto

## Configuração Inicial

1. **Copie as variáveis de ambiente:**
   ```bash
   cp .env.supabase.example .env
   ```

2. **Configure suas credenciais do Supabase no .env**

3. **Execute a migração:**
   ```bash
   npm run supabase:migrate
   ```

## Uso no Frontend

### Autenticação
```typescript
import { useSupabaseAuth } from './hooks/useSupabaseAuth'

function LoginComponent() {
  const { signIn, user, loading } = useSupabaseAuth()
  
  const handleLogin = async () => {
    const { error } = await signIn(email, password)
    if (error) console.error('Erro:', error.message)
  }
  
  if (loading) return <div>Carregando...</div>
  if (user) return <div>Logado como: {user.email}</div>
  
  return <button onClick={handleLogin}>Login</button>
}
```

### Upload de Arquivos
```typescript
import { uploadFile, getPublicUrl } from './lib/supabase'

const handleUpload = async (file: File) => {
  try {
    const path = `uploads/${Date.now()}-${file.name}`
    await uploadFile(file, path)
    const url = getPublicUrl(path)
    console.log('Arquivo disponível em:', url)
  } catch (error) {
    console.error('Erro no upload:', error)
  }
}
```

### Real-time
```typescript
import { subscribeToTable } from './lib/supabase'

useEffect(() => {
  const subscription = subscribeToTable('Solicitacao', (payload) => {
    console.log('Nova solicitação:', payload)
    // Atualizar estado local
  })
  
  return () => subscription.unsubscribe()
}, [])
```

## Comandos Úteis

```bash
# Configurar projeto
npm run supabase:setup

# Aplicar migrações
npm run supabase:migrate

# Abrir Prisma Studio
npm run supabase:studio

# Reset do banco
npm run supabase:reset

# Deploy completo
npm run deploy:supabase
```

## Recursos do Supabase

- **Dashboard:** https://app.supabase.com
- **Documentação:** https://supabase.com/docs
- **Exemplos:** https://github.com/supabase/supabase/tree/master/examples