// Copie e cole este código no console do navegador (F12)
console.log('=== DEBUG PRESTADOR ===');
const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
const viewMode = localStorage.getItem('viewMode');
console.log('Usuario:', usuario);
console.log('ViewMode:', viewMode);
console.log('Prestador:', usuario.prestador);
console.log('Tipo prestador:', typeof usuario.prestador);
console.log('É prestador?', usuario.prestador && typeof usuario.prestador === 'object');

// Verificar se o viewMode está correto
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
  console.log('CORRIGINDO ViewMode...');
  localStorage.setItem('viewMode', viewModeCorreto);
  console.log('ViewMode corrigido. Recarregue a página.');
}