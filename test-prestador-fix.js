// Script para testar no console do navegador
// Copie e cole este código no console do navegador (F12)

console.log('=== TESTE FINAL DE CORRECAO DO PRESTADOR ===');

// Verificar localStorage
const token = localStorage.getItem('token');
const usuarioStr = localStorage.getItem('usuario');
const viewMode = localStorage.getItem('viewMode');

console.log('Token existe:', !!token);
console.log('ViewMode atual:', viewMode);

if (usuarioStr) {
  const usuario = JSON.parse(usuarioStr);
  console.log('Usuario completo:', usuario);
  console.log('Usuario ID:', usuario.id);
  console.log('Usuario nome:', usuario.nome);
  console.log('isMaster:', usuario.isMaster, typeof usuario.isMaster);
  console.log('isGestor:', usuario.isGestor, typeof usuario.isGestor);
  console.log('prestador (raw):', usuario.prestador);
  console.log('prestador type:', typeof usuario.prestador);
  console.log('prestador exists:', !!usuario.prestador);
  console.log('prestador is object:', usuario.prestador && typeof usuario.prestador === 'object');
  
  // Determinar viewMode correto
  let viewModeCorreto;
  if (usuario.isMaster) {
    viewModeCorreto = 'master';
  } else if (usuario.isGestor) {
    viewModeCorreto = 'gestor';
  } else if (usuario.prestador && typeof usuario.prestador === 'object') {
    viewModeCorreto = 'prestador';
  } else {
    viewModeCorreto = 'usuario';
  }
  
  console.log('ViewMode correto deveria ser:', viewModeCorreto);
  console.log('ViewMode atual está correto:', viewMode === viewModeCorreto);
  
  if (viewMode !== viewModeCorreto) {
    console.log('PROBLEMA: ViewMode incorreto! Corrigindo...');
    localStorage.setItem('viewMode', viewModeCorreto);
    console.log('ViewMode corrigido para:', viewModeCorreto);
    console.log('Recarregue a página para ver as mudanças.');
  } else {
    console.log('✅ ViewMode está correto!');
  }
} else {
  console.log('❌ Nenhum usuário logado encontrado');
}

console.log('=== FIM DO TESTE ===');