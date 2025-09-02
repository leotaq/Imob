const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verificarUsuario() {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { email: 'prestador@imobigestor.com' },
      include: { prestador: true }
    });
    
    console.log('Usuário encontrado:', JSON.stringify(usuario, null, 2));
    
    if (usuario && !usuario.prestador) {
      console.log('\n❌ Usuário não tem perfil de prestador cadastrado!');
      console.log('Isso explica por que as solicitações não aparecem.');
    } else if (usuario && usuario.prestador) {
      console.log('\n✅ Usuário tem perfil de prestador.');
    }
    
  } catch (error) {
    console.error('Erro ao verificar usuário:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarUsuario();