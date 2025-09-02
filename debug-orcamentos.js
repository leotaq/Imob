// Script para debugar problemas com orçamentos
console.log('🔍 Debug: Verificando orçamentos...');

// Verificar dados do usuário
const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
console.log('👤 Usuário:', usuario);

// Verificar viewMode
const viewMode = localStorage.getItem('viewMode');
console.log('👁️ ViewMode:', viewMode);

// Verificar token
const token = localStorage.getItem('token');
console.log('🔑 Token existe:', !!token);

// Fazer requisição para prestadores
fetch('/api/prestadores', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(response => response.json())
.then(prestadores => {
  console.log('👷 Prestadores encontrados:', prestadores.length);
  
  // Encontrar prestador atual
  const prestadorAtual = prestadores.find(p => p.usuarioId === usuario.id);
  console.log('🎯 Prestador atual:', prestadorAtual);
  
  if (prestadorAtual) {
    console.log('✅ Prestador ID:', prestadorAtual.id);
    
    // Fazer requisição para orçamentos
    return fetch('/api/orcamentos', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => response.json())
    .then(orcamentos => {
      console.log('💰 Total de orçamentos retornados:', orcamentos.length);
      console.log('📋 Orçamentos:', orcamentos);
      
      // Filtrar orçamentos do prestador
      const meusOrcamentos = orcamentos.filter(orc => orc.prestadorId === prestadorAtual.id);
      console.log('🎯 Meus orçamentos:', meusOrcamentos.length);
      console.log('📝 Detalhes dos meus orçamentos:', meusOrcamentos);
      
      if (meusOrcamentos.length === 0) {
        console.log('❌ Nenhum orçamento encontrado para este prestador');
        console.log('🔍 Verificando se há orçamentos com prestadorId diferente...');
        orcamentos.forEach(orc => {
          console.log(`Orçamento ${orc.id}: prestadorId = ${orc.prestadorId}`);
        });
      }
    });
  } else {
    console.log('❌ Prestador não encontrado para este usuário');
    console.log('🔍 Verificando prestadores disponíveis...');
    prestadores.forEach(p => {
      console.log(`Prestador ${p.nome}: usuarioId = ${p.usuarioId}`);
    });
  }
})
.catch(error => {
  console.error('❌ Erro ao buscar dados:', error);
});

console.log('✅ Script de debug executado. Verifique os logs acima.');