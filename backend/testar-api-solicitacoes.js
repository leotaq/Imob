const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testarAPISolicitacoes() {
  try {
    // Simular o usuário logado
    const usuario = await prisma.usuario.findUnique({
      where: { email: 'prestador@imobigestor.com' },
      include: { prestador: true }
    });
    
    console.log('Usuário logado:', usuario.nome);
    console.log('É prestador:', !!usuario.prestador);
    console.log('É admin/master/gestor:', usuario.isAdmin || usuario.isMaster || usuario.isGestor);
    
    let whereClause = {};
    
    // Aplicar a mesma lógica da API
    if (!usuario.isMaster && !usuario.isAdmin && !usuario.isGestor) {
      console.log('\n🔍 Aplicando filtro de prestador...');
      
      const prestador = await prisma.prestador.findFirst({
        where: { usuarioId: usuario.id }
      });
      
      if (!prestador) {
        console.log('❌ Prestador não encontrado');
        return;
      }
      
      console.log('✅ Prestador encontrado:', prestador.id);
      
      // Buscar orçamentos do prestador
      const orcamentos = await prisma.orcamento.findMany({
        where: { prestadorId: prestador.id },
        select: { solicitacaoId: true }
      });
      
      console.log('Orçamentos do prestador:', orcamentos.length);
      
      const solicitacoesComOrcamento = orcamentos.map(o => o.solicitacaoId);
      
      whereClause = {
        OR: [
          {
            status: { in: ['aberta', 'orcamento'] }
          },
          {
            id: { in: solicitacoesComOrcamento }
          }
        ]
      };
      
      console.log('Filtro aplicado:', JSON.stringify(whereClause, null, 2));
    }
    
    // Buscar solicitações
    const solicitacoes = await prisma.solicitacao.findMany({
      where: whereClause,
      include: {
        servicos: {
          include: {
            tipoServico: true
          }
        },
        anexos: true,
        usuario: {
          select: { id: true, nome: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('\n📋 Solicitações encontradas:', solicitacoes.length);
    
    solicitacoes.forEach((s, i) => {
      console.log(`${i+1}. ${s.nomeSolicitante} - Status: ${s.status} - ${s.enderecoCidade}`);
    });
    
    // Verificar especificamente solicitações de Taquara
    const solicitacoesTaquara = await prisma.solicitacao.findMany({
      where: {
        enderecoCidade: 'Taquara',
        status: 'aberta'
      }
    });
    
    console.log('\n🏠 Solicitações de Taquara com status aberta:', solicitacoesTaquara.length);
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testarAPISolicitacoes();