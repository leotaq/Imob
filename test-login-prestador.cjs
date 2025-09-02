const fetch = require('node-fetch');

async function testPrestadorLogin() {
  try {
    console.log('🔍 Testando login do prestador...');
    
    const response = await fetch('http://localhost:3001/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'prestador@imobigestor.com',
        senha: '123456'
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Login realizado com sucesso!');
      console.log('👤 Dados do usuário:');
      console.log('  ID:', data.usuario.id);
      console.log('  Nome:', data.usuario.nome);
      console.log('  Email:', data.usuario.email);
      console.log('  isAdmin:', data.usuario.isAdmin);
      console.log('  isMaster:', data.usuario.isMaster);
      console.log('  isGestor:', data.usuario.isGestor);
      console.log('  prestador:', data.usuario.prestador ? 'SIM' : 'NÃO');
      
      if (data.usuario.prestador) {
        console.log('📋 Dados do prestador:');
        console.log('  ID do prestador:', data.usuario.prestador.id);
        console.log('  Nome:', data.usuario.prestador.nome);
        console.log('  Ativo:', data.usuario.prestador.ativo);
        console.log('  Especialidades:', data.usuario.prestador.especialidades);
      }
      
      console.log('🔑 Token:', data.token ? 'Presente' : 'Ausente');
    } else {
      console.log('❌ Erro no login:', data.error);
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
}

testPrestadorLogin();