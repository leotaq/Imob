const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  try {
    // Buscar a primeira empresa
    const empresa = await prisma.empresa.findFirst();
    if (!empresa) {
      console.log('Nenhuma empresa encontrada. Crie uma empresa primeiro.');
      return;
    }

    console.log(`Criando tipos de serviço para a empresa: ${empresa.nome}`);

    // Verificar se já existem tipos de serviço
    const existingTypes = await prisma.tipoServico.findMany({
      where: { empresaId: empresa.id }
    });

    if (existingTypes.length > 0) {
      console.log('Tipos de serviço já existem. Pulando criação.');
      return;
    }

    // Tipos de serviço padrão
    const tiposServico = [
      {
        nome: 'Reparo Elétrico',
        categoria: 'eletrica',
        descricao: 'Problemas com instalação elétrica',
        empresaId: empresa.id
      },
      {
        nome: 'Vazamento',
        categoria: 'hidraulica',
        descricao: 'Problemas hidráulicos',
        empresaId: empresa.id
      },
      {
        nome: 'Pintura',
        categoria: 'pintura',
        descricao: 'Serviços de pintura',
        empresaId: empresa.id
      },
      {
        nome: 'Limpeza',
        categoria: 'limpeza',
        descricao: 'Serviços de limpeza',
        empresaId: empresa.id
      },
      {
        nome: 'Jardinagem',
        categoria: 'jardinagem',
        descricao: 'Cuidados com jardim',
        empresaId: empresa.id
      },
      {
        nome: 'Outros',
        categoria: 'outros',
        descricao: 'Outros tipos de serviço',
        empresaId: empresa.id
      }
    ];

    // Criar tipos de serviço
    for (const tipo of tiposServico) {
      await prisma.tipoServico.create({
        data: tipo
      });
      console.log(`✓ Criado: ${tipo.nome}`);
    }

    console.log('\n🎉 Tipos de serviço criados com sucesso!');
  } catch (error) {
    console.error('Erro ao criar tipos de serviço:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();