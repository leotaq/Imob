// Script para forçar logout e limpar dados
console.log('Forçando logout e limpando dados...');

// Limpar localStorage
localStorage.clear();

// Limpar sessionStorage também
sessionStorage.clear();

// Redirecionar para login
window.location.href = '/login';

console.log('Dados limpos! Redirecionando para login...');