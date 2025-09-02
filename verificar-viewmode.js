// Script para corrigir o problema do viewMode para prestadores
console.log('=== DIAGNOSTICO E CORRECAO DO VIEWMODE ===');

const token = localStorage.getItem('token');
const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
const viewMode = localStorage.getItem('viewMode');

console.log('1. Estado atual:');
console.log('   Token:', token ? 'Existe' : 'Nao existe');
console.log('   ViewMode salvo:', viewMode);
console.log('   Usuario:', usuario);

if (usuario && usuario.email) {
  console.log('\n2. Propriedades do usuario:');
  console.log('   Nome:', usuario.nome);
  console.log('   Email:', usuario.email);
  console.log('   isMaster:', usuario.isMaster);
  console.log('   isAdmin:', usuario.isAdmin);
  console.log('   isGestor:', usuario.isGestor);
  console.log('   prestador:', usuario.prestador);
  
  // Determina o viewMode correto
  let viewModeCorreto;
  if (usuario.isMaster) {
    viewModeCorreto = 'master';
  } else if (usuario.isGestor) {
    viewModeCorreto = 'gestor';
  } else if (usuario.prestador) {
    viewModeCorreto = 'prestador';
  } else {
    viewModeCorreto = 'usuario';
  }
  
  console.log('\n3. Analise:');
  console.log('   ViewMode atual:', viewMode);
  console.log('   ViewMode correto:', viewModeCorreto);
  
  if (viewMode !== viewModeCorreto) {
    console.log('   STATUS: PROBLEMA DETECTADO!');
    console.log('\n4. APLICANDO CORRECAO...');
    
    // Corrige o viewMode
    localStorage.setItem('viewMode', viewModeCorreto);
    console.log('   ✓ ViewMode corrigido para:', viewModeCorreto);
    
    // Recarrega a página
    console.log('   ✓ Recarregando a pagina...');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
    
  } else {
    console.log('   STATUS: ViewMode esta correto!');
    
    // Se o viewMode está correto mas ainda mostra dashboard, pode ser problema de cache
    if (viewModeCorreto === 'prestador') {
      console.log('\n4. VERIFICACAO ADICIONAL PARA PRESTADOR:');
      console.log('   Se ainda estiver vendo o dashboard, execute:');
      console.log('   window.location.href = "/solicitacoes";');
    }
  }
  
} else {
  console.log('\n2. PROBLEMA: Usuario nao encontrado ou invalido!');
  console.log('   SOLUCAO: Faca logout e login novamente');
  console.log('   Execute: localStorage.clear(); window.location.href = "/login";');
}

console.log('\n=== FIM DO DIAGNOSTICO ===');
console.log('Se o problema persistir:');
console.log('1. Faca logout completo');
console.log('2. Limpe o cache: localStorage.clear()');
console.log('3. Faca login novamente como prestador');