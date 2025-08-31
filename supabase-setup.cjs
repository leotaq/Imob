#!/usr/bin/env node

/**
 * Script de configuração para Supabase
 * Execute: node supabase-setup.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Configurando projeto para Supabase...');

// 1. Instalar dependências do Supabase
function instalarDependencias() {
  console.log('📦 Instalando dependências do Supabase...');
  
  try {
    execSync('npm install @supabase/supabase-js', { stdio: 'inherit' });
    console.log('✅ @supabase/supabase-js instalado');
  } catch (error) {
    console.error('❌ Erro ao instalar dependências:', error.message);
    process.exit(1);
  }
}

// 2. Criar configuração do Supabase
function criarConfigSupabase() {
  console.log('⚙️ Criando configuração do Supabase...');
  
  const supabaseConfig = `// Configuração do Supabase
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variáveis SUPABASE_URL e SUPABASE_ANON_KEY são obrigatórias')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Configurações opcionais
export const supabaseConfig = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
  // Configurações de autenticação
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  // Configurações de storage
  storage: {
    bucket: 'uploads'
  }
}

// Helper para upload de arquivos
export async function uploadFile(file, path) {
  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(path, file)
  
  if (error) {
    throw new Error(\`Erro no upload: \${error.message}\`)
  }
  
  return data
}

// Helper para obter URL pública
export function getPublicUrl(path) {
  const { data } = supabase.storage
    .from('uploads')
    .getPublicUrl(path)
  
  return data.publicUrl
}

// Helper para real-time subscriptions
export function subscribeToTable(table, callback) {
  return supabase
    .channel(\`public:\${table}\`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: table
    }, callback)
    .subscribe()
}

export default supabase`;
  
  // Criar pasta lib se não existir
  if (!fs.existsSync('src/lib')) {
    fs.mkdirSync('src/lib', { recursive: true });
  }
  
  fs.writeFileSync('src/lib/supabase.ts', supabaseConfig);
  console.log('✅ Configuração do Supabase criada em src/lib/supabase.ts');
}

// 3. Criar hook para autenticação Supabase
function criarHookAuth() {
  console.log('🔐 Criando hook de autenticação...');
  
  const authHook = `import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
}

export function useSupabaseAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true
  })

  useEffect(() => {
    // Obter sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState({
        user: session?.user ?? null,
        session,
        loading: false
      })
    })

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false
        })
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Funções de autenticação
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email)
    return { data, error }
  }

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    resetPassword
  }
}`;
  
  fs.writeFileSync('src/hooks/useSupabaseAuth.tsx', authHook);
  console.log('✅ Hook de autenticação criado em src/hooks/useSupabaseAuth.tsx');
}

// 4. Criar arquivo .env de exemplo
function criarEnvExample() {
  console.log('📝 Criando arquivo .env de exemplo...');
  
  const envExample = `# Configurações do Supabase
# Obtenha essas informações em: https://app.supabase.com/project/[SEU-PROJETO]/settings/api

# URL do projeto Supabase
VITE_SUPABASE_URL=https://[SEU-PROJETO].supabase.co
SUPABASE_URL=https://[SEU-PROJETO].supabase.co

# Chave pública (anon key)
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Chave de serviço (apenas backend)
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# URL do banco de dados
# Formato: postgresql://postgres:[SUA-SENHA]@db.[SEU-PROJETO].supabase.co:5432/postgres
DATABASE_URL=postgresql://postgres:[SUA-SENHA]@db.[SEU-PROJETO].supabase.co:5432/postgres

# JWT Secret (opcional, se usar autenticação customizada)
JWT_SECRET=seu_jwt_secret_muito_seguro

# Ambiente
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173

# Logs
LOG_LEVEL=info

# Upload de arquivos
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf`;
  
  fs.writeFileSync('.env.supabase.example', envExample);
  console.log('✅ Arquivo .env.supabase.example criado');
}

// 5. Criar script de migração
function criarScriptMigracao() {
  console.log('🗄️ Criando script de migração...');
  
  const migrationScript = `#!/usr/bin/env node

/**
 * Script para aplicar schema no Supabase
 */

const { execSync } = require('child_process');

console.log('🗄️ Aplicando schema no Supabase...');

try {
  // Gerar cliente Prisma
  console.log('📦 Gerando cliente Prisma...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Aplicar schema
  console.log('🚀 Aplicando schema no banco...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  
  console.log('✅ Schema aplicado com sucesso!');
  console.log('🎯 Próximos passos:');
  console.log('   1. Acesse o dashboard do Supabase');
  console.log('   2. Verifique se as tabelas foram criadas');
  console.log('   3. Configure RLS se necessário');
  console.log('   4. Teste a aplicação');
  
} catch (error) {
  console.error('❌ Erro na migração:', error.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('   1. Verifique se DATABASE_URL está correto');
  console.log('   2. Confirme se o projeto Supabase está ativo');
  console.log('   3. Teste a conexão manualmente');
  process.exit(1);
}`;
  
  fs.writeFileSync('migrate-supabase.js', migrationScript);
  console.log('✅ Script de migração criado: migrate-supabase.js');
}

// 6. Atualizar package.json
function atualizarPackageJson() {
  console.log('📦 Atualizando package.json...');
  
  try {
    const packagePath = 'package.json';
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Adicionar scripts específicos do Supabase
    packageJson.scripts = {
      ...packageJson.scripts,
      'supabase:setup': 'node supabase-setup.js',
      'supabase:migrate': 'node migrate-supabase.js',
      'supabase:studio': 'npx prisma studio',
      'supabase:reset': 'npx prisma migrate reset',
      'deploy:supabase': 'npm run supabase:migrate && npm run build'
    };
    
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Scripts adicionados ao package.json');
    
  } catch (error) {
    console.error('❌ Erro ao atualizar package.json:', error.message);
  }
}

// 7. Criar documentação de uso
function criarDocumentacao() {
  console.log('📖 Criando documentação...');
  
  const docs = `# Como usar Supabase no projeto

## Configuração Inicial

1. **Copie as variáveis de ambiente:**
   \`\`\`bash
   cp .env.supabase.example .env
   \`\`\`

2. **Configure suas credenciais do Supabase no .env**

3. **Execute a migração:**
   \`\`\`bash
   npm run supabase:migrate
   \`\`\`

## Uso no Frontend

### Autenticação
\`\`\`typescript
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
\`\`\`

### Upload de Arquivos
\`\`\`typescript
import { uploadFile, getPublicUrl } from './lib/supabase'

const handleUpload = async (file: File) => {
  try {
    const path = \`uploads/\${Date.now()}-\${file.name}\`
    await uploadFile(file, path)
    const url = getPublicUrl(path)
    console.log('Arquivo disponível em:', url)
  } catch (error) {
    console.error('Erro no upload:', error)
  }
}
\`\`\`

### Real-time
\`\`\`typescript
import { subscribeToTable } from './lib/supabase'

useEffect(() => {
  const subscription = subscribeToTable('Solicitacao', (payload) => {
    console.log('Nova solicitação:', payload)
    // Atualizar estado local
  })
  
  return () => subscription.unsubscribe()
}, [])
\`\`\`

## Comandos Úteis

\`\`\`bash
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
\`\`\`

## Recursos do Supabase

- **Dashboard:** https://app.supabase.com
- **Documentação:** https://supabase.com/docs
- **Exemplos:** https://github.com/supabase/supabase/tree/master/examples`;
  
  fs.writeFileSync('SUPABASE_USAGE.md', docs);
  console.log('✅ Documentação criada: SUPABASE_USAGE.md');
}

// Executar todas as funções
function main() {
  try {
    instalarDependencias();
    criarConfigSupabase();
    criarHookAuth();
    criarEnvExample();
    criarScriptMigracao();
    atualizarPackageJson();
    criarDocumentacao();
    
    console.log('\n🎉 Configuração do Supabase concluída!');
    console.log('\n📋 Próximos passos:');
    console.log('   1. Crie um projeto no Supabase: https://app.supabase.com');
    console.log('   2. Copie .env.supabase.example para .env');
    console.log('   3. Configure as variáveis com suas credenciais');
    console.log('   4. Execute: npm run supabase:migrate');
    console.log('   5. Teste a aplicação');
    console.log('\n📖 Leia SUPABASE_USAGE.md para exemplos de uso');
    
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