const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function testPrestadorFilter() {
  try {
    console.log('🔍 Testando filtro do prestador...');
    
    // ID do prestador logado (do debug anterior)
    const prestadorUserId = '7fd8ba1a-7adc-4d40-a6c3-a3133c2b2be9';
    
    console.log(`👤 Testando para usuário: ${prestadorUserId}`);
    
    // Buscar dados do prestador
    const prestador = await prisma.prestador.findUnique({
      where: { usuarioId: prestadorUserId },
      include: {
        usuario: {
          select: { nome: true, email: true }
        }
      }
    });
    
    if (!prestador) {
      console.log('❌ Prestador não encontrado!');
      return;
    }
    
    console.log(`✅ Prestador encontrado: ${prestador.nome} (${prestador.usuario.email})`);
    console.log(`📋 ID do prestador: ${prestador.id}`);
    console.log(`🔄 Ativo: ${prestador.ativo}`);
    
    // Buscar orçamentos do prestador
    const orcamentos = await prisma.orcamento.findMany({
      where: { prestadorId: prestador.id },
      select: { solicitacaoId: true, id: true }
    });
    
    console.log(`💰 Orçamentos do prestador: ${orcamentos.length}`);
    const solicitacoesComOrcamento = orcamentos.map(o => o.solicitacaoId);
    console.log('📝 IDs das solicitações com orçamento:', solicitacoesComOrcamento);
    
    // Aplicar o mesmo filtro do endpoint
    const whereClause = {
      OR: [
        {
          status: { in: ['aberta', 'orcamento'] }
        },
        {
          id: { in: solicitacoesComOrcamento }
        }
      ]
    };
    
    console.log('🔍 Filtro aplicado:', JSON.stringify(whereClause, null, 2));
    
    // Buscar solicitações com o filtro
    const solicitacoesFiltradas = await prisma.solicitacao.findMany({
      where: whereClause,
      select: {
        id: true,
        nomeSolicitante: true,
        status: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`\n📊 Resultado do filtro: ${solicitacoesFiltradas.length} solicitações`);
    
    if (solicitacoesFiltradas.length > 0) {
      console.log('\n📋 Solicitações que o prestador deveria ver:');
      solicitacoesFiltradas.forEach((sol, i) => {
        console.log(`${i+1}. ${sol.nomeSolicitante} - Status: ${sol.status} - ID: ${sol.id}`);
      });
    } else {
      console.log('❌ Nenhuma solicitação encontrada com o filtro!');
      
      // Vamos verificar todas as solicitações abertas
      const todasAbertas = await prisma.solicitacao.findMany({
        where: { status: 'aberta' },
        select: {
          id: true,
          nomeSolicitante: true,
          status: true
        }
      });
      
      console.log(`\n🔍 Solicitações abertas no banco: ${todasAbertas.length}`);
      todasAbertas.forEach((sol, i) => {
        console.log(`${i+1}. ${sol.nomeSolicitante} - Status: ${sol.status}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testPrestadorFilter();