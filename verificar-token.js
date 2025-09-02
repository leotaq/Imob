// Script para verificar se o token JWT contém isGestor
const token = localStorage.getItem('token');

if (!token) {
  console.log('❌ Nenhum token encontrado. Faça login primeiro.');
} else {
  try {
    // Decodificar o payload do JWT
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    console.log('🔍 Informações do token JWT:');
    console.log('  ID:', payload.id);
    console.log('  Email:', payload.email);
    console.log('  Nome:', payload.nome);
    console.log('  isAdmin:', payload.isAdmin);
    console.log('  isMaster:', payload.isMaster);
    console.log('  isGestor:', payload.isGestor);
    
    if (payload.hasOwnProperty('isGestor')) {
      console.log('✅ Token contém a propriedade isGestor!');
      console.log('🎯 Agora as solicitações devem aparecer para prestadores.');
    } else {
      console.log('❌ Token NÃO contém a propriedade isGestor.');
      console.log('🔄 Faça logout e login novamente para obter o token corrigido.');
    }
    
    // Verificar expiração
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      console.log('⚠️ Token expirado!');
    } else {
      console.log('✅ Token válido.');
    }
    
  } catch (error) {
    console.log('❌ Erro ao decodificar token:', error.message);
  }
}

// Instruções
console.log('\n📋 INSTRUÇÕES:');
console.log('1. Se o token NÃO contém isGestor, faça logout e login novamente');
console.log('2. Use as credenciais: prestador@imobigestor.com / 123456');
console.log('3. Após o login, as solicitações devem aparecer na página');