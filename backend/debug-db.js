const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
require('dotenv').config();

const prisma = new PrismaClient();

async function debugDB() {
  let output = [];
  
  try {
    output.push('=== DEBUG DO BANCO DE DADOS ===\n');
    
    await prisma.$connect();
    output.push('✅ Conectado ao banco\n');
    
    // Contar solicitações
    const totalSolicitacoes = await prisma.solicitacao.count();
    output.push(`Total de solicitações: ${totalSolicitacoes}\n`);
    
    if (totalSolicitacoes > 0) {
      const solicitacoes = await prisma.solicitacao.findMany({
        take: 10,
        select: {
          id: true,
          nomeSolicitante: true,
          status: true,
          createdAt: true,
          usuarioId: true
        },
        orderBy: { createdAt: 'desc' }
      });
      
      output.push('\n=== SOLICITAÇÕES ===\n');
      solicitacoes.forEach((sol, i) => {
        output.push(`${i+1}. ID: ${sol.id}`);
        output.push(`   Nome: ${sol.nomeSolicitante}`);
        output.push(`   Status: ${sol.status}`);
        output.push(`   Usuario: ${sol.usuarioId}`);
        output.push(`   Data: ${sol.createdAt}\n`);
      });
    }
    
    // Contar prestadores
    const totalPrestadores = await prisma.prestador.count();
    output.push(`\nTotal de prestadores: ${totalPrestadores}\n`);
    
    if (totalPrestadores > 0) {
      const prestadores = await prisma.prestador.findMany({
        include: {
          usuario: {
            select: {
              email: true,
              nome: true,
              id: true
            }
          }
        }
      });
      
      output.push('\n=== PRESTADORES ===\n');
      prestadores.forEach((prest, i) => {
        output.push(`${i+1}. Nome: ${prest.nome}`);
        output.push(`   Email: ${prest.usuario.email}`);
        output.push(`   User ID: ${prest.usuario.id}`);
        output.push(`   Ativo: ${prest.ativo}\n`);
      });
    }
    
    // Verificar usuários
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        email: true,
        nome: true,
        isAdmin: true,
        isMaster: true,
        isGestor: true
      }
    });
    
    output.push(`\nTotal de usuários: ${usuarios.length}\n`);
    output.push('\n=== USUÁRIOS ===\n');
    usuarios.forEach((user, i) => {
      let tipo = 'Usuario';
      if (user.isMaster) tipo = 'Master';
      else if (user.isAdmin) tipo = 'Admin';
      else if (user.isGestor) tipo = 'Gestor';
      
      output.push(`${i+1}. ${user.nome} (${user.email}) - Tipo: ${tipo}\n`);
    });
    
  } catch (error) {
    output.push(`\n❌ ERRO: ${error.message}\n`);
    output.push(`Stack: ${error.stack}\n`);
  } finally {
    await prisma.$disconnect();
    output.push('\n👋 Desconectado do banco');
  }
  
  // Salvar no arquivo
  const result = output.join('');
  fs.writeFileSync('debug-result.txt', result);
  console.log('Resultado salvo em debug-result.txt');
  console.log('\n' + result);
}

debugDB();