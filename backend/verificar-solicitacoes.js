const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verificarSolicitacoes() {
  try {
    const solicitacoes = await prisma.solicitacao.findMany({
      where: { enderecoCidade: 'Taquara' },
      include: {
        servicos: {
          include: {
            tipoServico: true
          }
        }
      }
    });

    console.log(`Solicitações encontradas: ${solicitacoes.length}`);
    
    solicitacoes.forEach((s, i) => {
      console.log(`${i+1}. ${s.nomeSolicitante} - ${s.enderecoRua}, ${s.enderecoNumero} - ${s.enderecoBairro}`);
      console.log(`   Status: ${s.status} | Prioridade: ${s.prioridade}`);
      console.log(`   Serviços: ${s.servicos.map(srv => srv.tipoServico.nome).join(', ')}`);
      console.log('---');
    });

    // Verificar também todas as solicitações
    const todasSolicitacoes = await prisma.solicitacao.findMany();
    console.log(`\nTotal de solicitações no banco: ${todasSolicitacoes.length}`);
    
  } catch (error) {
    console.error('Erro ao verificar solicitações:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarSolicitacoes();