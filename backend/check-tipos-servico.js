const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTiposServico() {
  try {
    // Buscar todas as empresas
    const empresas = await prisma.empresa.findMany({
      include: {
        tiposServico: true
      }
    });

    console.log('=== EMPRESAS E TIPOS DE SERVIÇO ===');
    for (const empresa of empresas) {
      console.log(`\nEmpresa: ${empresa.nome} (ID: ${empresa.id})`);
      console.log(`Tipos de serviço: ${empresa.tiposServico.length}`);
      
      if (empresa.tiposServico.length === 0) {
        console.log('⚠️  Nenhum tipo de serviço encontrado! Criando tipos básicos...');
        
        const tiposBasicos = [
          { nome: 'Elétrica', categoria: 'Manutenção', descricao: 'Serviços elétricos em geral' },
          { nome: 'Hidráulica', categoria: 'Manutenção', descricao: 'Serviços hidráulicos em geral' },
          { nome: 'Pintura', categoria: 'Reforma', descricao: 'Serviços de pintura' },
          { nome: 'Limpeza', categoria: 'Limpeza', descricao: 'Serviços de limpeza' },
          { nome: 'Jardinagem', categoria: 'Manutenção', descricao: 'Serviços de jardinagem' },
          { nome: 'Marcenaria', categoria: 'Reforma', descricao: 'Serviços de marcenaria' },
          { nome: 'Serralheria', categoria: 'Manutenção', descricao: 'Serviços de serralheria' },
          { nome: 'Ar Condicionado', categoria: 'Manutenção', descricao: 'Instalação e manutenção de ar condicionado' }
        ];
        
        for (const tipo of tiposBasicos) {
          await prisma.tipoServico.create({
            data: {
              ...tipo,
              empresaId: empresa.id
            }
          });
        }
        
        console.log('✅ Tipos de serviço básicos criados!');
      } else {
        empresa.tiposServico.forEach(tipo => {
          console.log(`  - ${tipo.nome} (${tipo.categoria})`);
        });
      }
    }
    
    console.log('\n=== VERIFICAÇÃO CONCLUÍDA ===');
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTiposServico();