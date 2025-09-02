const express = require('express');
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Importar sistema de logs e validação
const logger = require('./utils/logger');
const { requestLogger, errorLogger } = require('./middleware/logging');
const { 
  validate, 
  usuarioSchema, 
  empresaSchema,
  loginSchema,
  usuarioUpdateSchema,
  registroSchema,
  solicitacaoSchema, 
  prestadorSchema, 
  orcamentoSchema,
  tipoServicoSchema,
  permissoesSchema
} = require('./schemas/validation');
// Adicionado: Socket Manager para WebSockets
const socketManager = require('./utils/socketManager');
const { upload, handleUploadError, uploadsDir } = require('./middleware/upload');
const FileManager = require('./utils/fileManager');

const JWT_SECRET = process.env.JWT_SECRET || 'segredo_super_secreto';

const app = express();
const prisma = new PrismaClient();
const fileManager = new FileManager(uploadsDir);

// Configurações de segurança
app.use(helmet());

// Rate limiting removido - sem restrições de tempo
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutos
//   max: 100, // máximo 100 requests por IP
//   message: { error: 'Muitas tentativas. Tente novamente em 15 minutos.' }
// });
// app.use('/api/', limiter);

// Rate limiting específico para login removido
// const loginLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 5, // máximo 5 tentativas de login por IP
//   message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' }
// });
const loginLimiter = null; // Rate limiting desabilitado

// Middleware para restringir acesso apenas ao localhost (apenas em desenvolvimento)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const isLocalhost = clientIP === '127.0.0.1' || clientIP === '::1' || clientIP === '::ffff:127.0.0.1' || req.hostname === 'localhost';
    
    if (!isLocalhost) {
      logger.warn(`Acesso negado para IP: ${clientIP}`);
      return res.status(403).json({ error: 'Acesso permitido apenas via localhost' });
    }
    
    next();
  });
}

// Middlewares
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:8080,http://127.0.0.1:8080')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    logger.warn(`CORS bloqueado para origem: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(requestLogger);

// Middleware para proteger rotas
function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    logger.logAuth('Token não fornecido', { ip: req.ip, userAgent: req.get('User-Agent') });
    return res.status(401).json({ error: 'Token não fornecido.' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, usuario) => {
    if (err) {
      logger.logAuth('Token inválido', { error: err.message, ip: req.ip });
      return res.status(403).json({ error: 'Token inválido.' });
    }
    
    logger.logAuth('Usuário autenticado', { userId: usuario.id, email: usuario.email });
    req.usuario = usuario;
    next();
  });
}

// Listar todas as empresas e seus usuários (admin/master)


app.get('/api/empresas', autenticarToken, async (req, res) => {
  try {
    if (!req.usuario.isMaster) {
      logger.logAuth('Acesso negado - não é master', { userId: req.usuario.id });
      return res.status(403).json({ error: 'Acesso restrito.' });
    }
    
    const empresas = await prisma.empresa.findMany({
      include: {
        usuarios: {
          select: { id: true, nome: true, email: true, isGestor: true, permissoes: true }
        }
      }
    });
    
    logger.logDatabase('Empresas listadas', { count: empresas.length, userId: req.usuario.id });
    res.json({ empresas });
  } catch (err) {
    logger.logError('Erro ao buscar empresas', err, { userId: req.usuario.id });
    res.status(500).json({ error: 'Erro ao buscar empresas.' });
  }
});

// Cadastrar nova empresa (admin/master)
app.post('/api/empresas', autenticarToken, validate(empresaSchema), async (req, res) => {
  try {
    if (!req.usuario.isMaster) {
      logger.logAuth('Acesso negado - criação de empresa', { userId: req.usuario.id });
      return res.status(403).json({ error: 'Acesso restrito.' });
    }
    
    const { nome } = req.body;
    const empresa = await prisma.empresa.create({ data: { nome } });
    
    logger.logDatabase('Empresa criada', { empresaId: empresa.id, nome, userId: req.usuario.id });
    res.status(201).json({ empresa });
  } catch (err) {
    logger.logError('Erro ao criar empresa', err, { userId: req.usuario.id });
    res.status(500).json({ error: 'Erro ao criar empresa.' });
  }
});

// Cadastrar novo usuário em uma empresa (admin/master)
app.post('/api/empresas/:empresaId/usuarios', autenticarToken, validate(usuarioSchema), async (req, res) => {
  try {
    if (!req.usuario.isMaster) {
      logger.logAuth('Acesso negado - criação de usuário', { userId: req.usuario.id });
      return res.status(403).json({ error: 'Acesso restrito.' });
    }
    
    const { empresaId } = req.params;
    const { nome, email, senha, isGestor } = req.body;
    
    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: await bcrypt.hash(senha, 10),
        isGestor: !!isGestor,
        empresaId
      }
    });
    
    logger.logDatabase('Usuário criado', { usuarioId: usuario.id, email, empresaId, createdBy: req.usuario.id });
    res.status(201).json({ usuario });
  } catch (err) {
    if (err.code === 'P2002') {
      logger.logDatabase('Tentativa de criar usuário com email duplicado', { email: req.body.email });
      return res.status(400).json({ error: 'E-mail já cadastrado.' });
    }
    logger.logError('Erro ao criar usuário', err, { userId: req.usuario.id });
    res.status(500).json({ error: 'Erro ao criar usuário.' });
  }
});

// Listar usuários da empresa
app.get('/api/usuarios', autenticarToken, async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      where: { empresaId: req.usuario.empresaId },
      select: { id: true, nome: true, email: true, isAdmin: true }
    });
    
    logger.logDatabase('Usuários listados', { count: usuarios.length, empresaId: req.usuario.empresaId });
    res.json({ usuarios });
  } catch (err) {
    logger.logError('Erro ao buscar usuários', err, { userId: req.usuario.id });
    res.status(500).json({ error: 'Erro ao buscar usuários.' });
  }
});

// Cadastro de empresa e usuário admin
// Função para gerar código único de usuário
async function gerarCodigoUsuario() {
  const totalUsuarios = await prisma.usuario.count();
  let codigo;
  let tentativas = 0;
  
  do {
    const numero = (totalUsuarios + tentativas + 1).toString().padStart(3, '0');
    codigo = `USR${numero}`;
    
    const existeCodigo = await prisma.usuario.findUnique({
      where: { codigo }
    });
    
    if (!existeCodigo) break;
    tentativas++;
  } while (tentativas < 100);
  
  return codigo;
}

app.post('/api/register', validate(registroSchema), async (req, res) => {
  try {
    const { nome, email, telefone, senha, codigoUsuario, tipoUsuario, prestador } = req.body;
    
    // Debug: Log dos dados recebidos
    console.log('🔍 DEBUG - Dados recebidos no registro:');
    console.log('  tipoUsuario:', tipoUsuario);
    console.log('  codigoUsuario:', codigoUsuario);
    console.log('  prestador:', prestador);
    
    // Verificar se o código personalizado já existe
    if (codigoUsuario) {
      const codigoExistente = await prisma.usuario.findUnique({
        where: { codigo: codigoUsuario }
      });
      
      if (codigoExistente) {
        logger.logDatabase('Tentativa de registro com código duplicado', { codigo: codigoUsuario });
        return res.status(400).json({ error: 'Código de usuário já está em uso. Escolha outro.' });
      }
    }
    
    // Usar código personalizado ou gerar automaticamente
    const codigo = codigoUsuario || await gerarCodigoUsuario();
    
    if (tipoUsuario === 'prestador') {
      // Registrar prestador sem empresa
      const usuario = await prisma.usuario.create({
        data: {
          nome,
          email,
          telefone,
          senha: await bcrypt.hash(senha, 10),
          codigo,
          isAdmin: false,
          empresaId: null,
          prestador: {
            create: {
              nome,
              contato: telefone || email,
              tipoPessoa: prestador.tipoPessoa,
              documento: prestador.documento,
              tipoPagamento: prestador.tipoPagamento,
              notaRecibo: prestador.notaRecibo,
              especialidades: prestador.especialidades || []
            }
          }
        },
        include: {
          prestador: true
        }
      });
      
      logger.logDatabase('Prestador registrado', { 
        usuarioId: usuario.id,
        email,
        codigo,
        tipoPessoa: prestador.tipoPessoa
      });
      
      res.status(201).json({ 
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          codigo: usuario.codigo,
          tipo: 'prestador'
        }
      });
    } else {
      // Registrar usuário comum sem empresa
      const usuario = await prisma.usuario.create({
        data: {
          nome,
          email,
          telefone,
          senha: await bcrypt.hash(senha, 10),
          codigo,
          isAdmin: false,
          empresaId: null
        }
      });
      
      logger.logDatabase('Usuário registrado', { 
        usuarioId: usuario.id,
        email,
        codigo
      });
      
      res.status(201).json({ 
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          codigo: usuario.codigo,
          tipo: 'usuario'
        }
      });
    }
  } catch (err) {
    if (err.code === 'P2002') {
      logger.logDatabase('Tentativa de registro com email duplicado', { email: req.body.email });
      return res.status(400).json({ error: 'E-mail já cadastrado.' });
    }
    logger.logError('Erro ao registrar', err);
    res.status(500).json({ error: 'Erro ao cadastrar.' });
  }
});

// Login de usuário com JWT
app.post('/api/login', validate(loginSchema), async (req, res) => {
  try {
    const { email, codigo, senha } = req.body;
    
    let usuario;
    if (email) {
      usuario = await prisma.usuario.findUnique({
        where: { email },
        select: {
          id: true,
          codigo: true,
          nome: true,
          email: true,
          senha: true,
          isAdmin: true,
          isMaster: true,
          isGestor: true,
          prestador: true,
          empresa: true,
          empresaId: true
        }
      });
    } else if (codigo) {
      usuario = await prisma.usuario.findUnique({
        where: { codigo },
        select: {
          id: true,
          codigo: true,
          nome: true,
          email: true,
          senha: true,
          isAdmin: true,
          isMaster: true,
          isGestor: true,
          prestador: true,
          empresa: true,
          empresaId: true
        }
      });
    }
    
    if (!usuario) {
      logger.logAuth('Tentativa de login com credenciais inválidas', { email, codigo, ip: req.ip });
      return res.status(401).json({ error: 'Usuário ou senha inválidos.' });
    }
    
    const senhaOk = await bcrypt.compare(senha, usuario.senha);
    if (!senhaOk) {
      logger.logAuth('Tentativa de login com senha incorreta', { userId: usuario.id, email: usuario.email, ip: req.ip });
      return res.status(401).json({ error: 'Usuário ou senha inválidos.' });
    }
    
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        empresaId: usuario.empresaId,
        nome: usuario.nome,
        isAdmin: usuario.isAdmin,
        isMaster: usuario.isMaster,
        isGestor: usuario.isGestor
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    const usuarioRetorno = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      empresa: usuario.empresa,
      isAdmin: usuario.isAdmin,
      isMaster: usuario.isMaster,
      isGestor: usuario.isGestor,
      prestador: usuario.prestador
    };
    
    logger.logAuth('Login realizado com sucesso', { 
      userId: usuario.id, 
      email: usuario.email, 
      ip: req.ip 
    });
    
    res.json({
      usuario: usuarioRetorno,
      token
    });
  } catch (err) {
    logger.logError('Erro ao fazer login', err, { ip: req.ip });
    res.status(500).json({ error: 'Erro ao fazer login.' });
  }
});

// Rota protegida para dados do usuário
app.get('/api/me', autenticarToken, async (req, res) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuario.id },
      include: { empresa: true }
    });
    
    if (!usuario) {
      logger.logDatabase('Usuário não encontrado', { userId: req.usuario.id });
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    
    res.json({ usuario });
  } catch (err) {
    logger.logError('Erro ao buscar dados do usuário', err, { userId: req.usuario.id });
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// Atualizar papel gestor do usuário
app.patch('/api/empresas/:empresaId/usuarios/:usuarioId', autenticarToken, async (req, res) => {
  try {
    if (!req.usuario.isMaster) {
      logger.logAuth('Acesso negado - atualização de usuário', { userId: req.usuario.id });
      return res.status(403).json({ error: 'Acesso restrito.' });
    }
    
    const { empresaId, usuarioId } = req.params;
    const { isGestor } = req.body;
    
    const usuario = await prisma.usuario.update({
      where: { id: usuarioId },
      data: { isGestor: !!isGestor }
    });
    
    logger.logDatabase('Papel de gestor atualizado', { 
      usuarioId, 
      empresaId, 
      isGestor: !!isGestor, 
      updatedBy: req.usuario.id 
    });
    
    res.json({ usuario });
  } catch (err) {
    logger.logError('Erro ao atualizar usuário', err, { userId: req.usuario.id });
    res.status(500).json({ error: 'Erro ao atualizar usuário.', details: err.message });
  }
});

// Editar nome/email do usuário
app.put('/api/empresas/:empresaId/usuarios/:usuarioId', autenticarToken, validate(usuarioUpdateSchema), async (req, res) => {
  try {
    if (!req.usuario.isMaster) {
      logger.logAuth('Acesso negado - edição de usuário', { userId: req.usuario.id });
      return res.status(403).json({ error: 'Acesso restrito.' });
    }
    
    const { usuarioId } = req.params;
    const { nome, email } = req.body;
    
    const usuario = await prisma.usuario.update({
      where: { id: usuarioId },
      data: { nome, email }
    });
    
    logger.logDatabase('Usuário editado', { 
      usuarioId, 
      nome, 
      email, 
      editedBy: req.usuario.id 
    });
    
    res.json({ usuario });
  } catch (err) {
    logger.logError('Erro ao editar usuário', err, { userId: req.usuario.id });
    res.status(500).json({ error: 'Erro ao editar usuário.' });
  }
});

// Excluir usuário
app.delete('/api/empresas/:empresaId/usuarios/:usuarioId', autenticarToken, async (req, res) => {
  try {
    if (!req.usuario.isMaster) {
      logger.logAuth('Acesso negado - exclusão de usuário', { userId: req.usuario.id });
      return res.status(403).json({ error: 'Acesso restrito.' });
    }
    
    const { usuarioId } = req.params;
    
    await prisma.usuario.delete({ where: { id: usuarioId } });
    
    logger.logDatabase('Usuário excluído', { 
      usuarioId, 
      deletedBy: req.usuario.id 
    });
    
    res.json({ success: true });
  } catch (err) {
    logger.logError('Erro ao excluir usuário', err, { userId: req.usuario.id });
    res.status(500).json({ error: 'Erro ao excluir usuário.' });
  }
});

// Endpoint para atualizar permissões de usuário
app.put('/api/empresas/:empresaId/usuarios/:usuarioId/permissoes', autenticarToken, validate(permissoesSchema), async (req, res) => {
  try {
    const { empresaId, usuarioId } = req.params;
    const { permissoes } = req.body;
    const { usuario } = req;

    // Verificar se o usuário é master
    if (!usuario.isMaster) {
      return res.status(403).json({ error: 'Acesso negado. Apenas usuários master podem configurar permissões.' });
    }

    // Validar se permissoes é um array
    if (!Array.isArray(permissoes)) {
      return res.status(400).json({ error: 'Permissões devem ser um array' });
    }

    // Verificar se o usuário existe e pertence à empresa
    const usuarioExistente = await prisma.usuario.findFirst({
      where: {
        id: usuarioId,
        empresaId: empresaId
      }
    });

    if (!usuarioExistente) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Verificar se o usuário é gestor
    if (!usuarioExistente.isGestor) {
      return res.status(400).json({ error: 'Permissões só podem ser configuradas para gestores' });
    }

    // Atualizar as permissões
    const usuarioAtualizado = await prisma.usuario.update({
      where: { id: usuarioId },
      data: { permissoes: permissoes }
    });

    logger.info(`Permissões atualizadas para usuário ${usuarioId} por ${usuario.id}`);
    res.json({ 
      message: 'Permissões atualizadas com sucesso',
      usuario: {
        id: usuarioAtualizado.id,
        nome: usuarioAtualizado.nome,
        email: usuarioAtualizado.email,
        permissoes: usuarioAtualizado.permissoes
      }
    });
  } catch (error) {
    logger.error('Erro ao atualizar permissões:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criação automática do usuário master e empresa Master
async function criarMaster() {
  try {
    const masterEmail = process.env.MASTER_EMAIL || 'leommaster';
    const masterSenha = process.env.MASTER_PASSWORD || 'l1e2o3ariele';
    const masterNome = process.env.MASTER_NAME || 'Leo Master';
    const masterEmpresaNome = process.env.MASTER_COMPANY || 'Master';

    const jaExiste = await prisma.usuario.findFirst({ 
      where: { email: masterEmail, isMaster: true } 
    });
    
    if (jaExiste) {
      logger.info('Usuário master já existe');
      return;
    }

    let empresa = await prisma.empresa.findFirst({ where: { nome: masterEmpresaNome } });
    if (!empresa) {
      empresa = await prisma.empresa.create({ data: { nome: masterEmpresaNome } });
      logger.logDatabase('Empresa Master criada', { empresaId: empresa.id });
    }

    await prisma.usuario.create({
      data: {
        nome: masterNome,
        email: masterEmail,
        senha: await bcrypt.hash(masterSenha, 10),
        isAdmin: true,
        isMaster: true,
        empresaId: empresa.id
      }
    });
    
    logger.logDatabase('Usuário master criado com sucesso', { email: masterEmail });
  } catch (err) {
    logger.logError('Erro ao criar usuário master', err);
  }
}

// Rotas para Execução
app.get('/api/execucao', autenticarToken, async (req, res) => {
  try {
    const { usuario } = req;
    
    const whereClause = {
      empresaId: usuario.empresaId,
      status: {
        in: ['aprovada', 'execucao', 'concluida']
      }
    };
    
    // Se for prestador, só pode ver execuções onde tem orçamento aprovado
    if (!usuario.isMaster && !usuario.isAdmin && !usuario.isGestor) {
      // Buscar o prestador associado ao usuário
      const prestador = await prisma.prestador.findFirst({
        where: { usuarioId: usuario.id }
      });
      
      if (!prestador) {
        return res.json({ execucoes: [] });
      }
      
      // Buscar solicitações onde o prestador tem orçamento aprovado
      const orcamentosAprovados = await prisma.orcamento.findMany({
        where: {
          prestadorId: prestador.id,
          status: 'aprovado'
        },
        select: { solicitacaoId: true }
      });
      
      const solicitacaoIds = orcamentosAprovados.map(o => o.solicitacaoId);
      
      if (solicitacaoIds.length === 0) {
        return res.json({ execucoes: [] });
      }
      
      whereClause.id = {
        in: solicitacaoIds
      };
    }
    
    const execucoes = await prisma.solicitacao.findMany({
      where: whereClause,
      include: {
        imovel: true,
        solicitante: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        },
        servicos: {
          include: {
            tipoServico: true
          }
        },
        orcamentos: {
          where: {
            status: 'aprovado'
          },
          include: {
            prestador: {
              include: {
                usuario: {
                  select: {
                    id: true,
                    nome: true,
                    email: true
                  }
                }
              }
            },
            itensServico: {
              include: {
                materiais: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    logger.info(`Execuções buscadas: ${execucoes.length} encontradas`, { userId: usuario.id });
    res.json({ execucoes });
  } catch (error) {
    logger.error('Erro ao buscar execuções:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Middleware de tratamento de erros
app.use(errorLogger);

// Inicialização
criarMaster();

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  logger.info(`API rodando em http://localhost:${PORT}`);
});
// Inicializa o Socket.IO com o servidor HTTP do Express
socketManager.initialize(server);
app.use('/api/files', express.static(uploadsDir));

// === ROTAS DE UPLOAD ===

// Upload de arquivos
app.post('/api/upload/:tipo', autenticarToken, upload.array('files', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const { tipo } = req.params;
    const { entityId, entityType } = req.body; // ID da entidade (solicitação, orçamento, etc.)

    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
      url: fileManager.getPublicUrl(file.filename, tipo)
    }));

    // Registrar no banco se tiver entityId
    if (entityId && entityType) {
      // Aqui você pode criar uma tabela 'arquivos' para rastrear uploads
      // Por enquanto, apenas logamos
      logger.logDatabase('Arquivos enviados', {
        entityId,
        entityType,
        files: uploadedFiles.map(f => f.filename),
        userId: req.usuario.id
      });
    }

    logger.info('Upload realizado com sucesso', {
      tipo,
      fileCount: uploadedFiles.length,
      userId: req.usuario.id
    });

    res.json({
      success: true,
      files: uploadedFiles
    });
  } catch (error) {
    logger.logError('Erro no upload', error, { userId: req.usuario.id });
    res.status(500).json({ error: 'Erro interno no upload' });
  }
});

// Listar arquivos de um tipo
app.get('/api/files/:tipo', autenticarToken, async (req, res) => {
  try {
    const { tipo } = req.params;
    const files = await fileManager.listFiles(tipo);
    
    const filesWithUrls = files.map(file => ({
      ...file,
      url: fileManager.getPublicUrl(file.filename, tipo)
    }));

    res.json({ files: filesWithUrls });
  } catch (error) {
    logger.logError('Erro ao listar arquivos', error, { userId: req.usuario.id });
    res.status(500).json({ error: 'Erro ao listar arquivos' });
  }
});

// Deletar arquivo
app.delete('/api/files/:tipo/:filename', autenticarToken, async (req, res) => {
  try {
    const { tipo, filename } = req.params;
    
    // Verificar se arquivo existe
    const exists = await fileManager.fileExists(filename, tipo);
    if (!exists) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }

    const deleted = await fileManager.deleteFile(filename, tipo);
    
    if (deleted) {
      logger.logDatabase('Arquivo deletado', {
        filename,
        tipo,
        userId: req.usuario.id
      });
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'Erro ao deletar arquivo' });
    }
  } catch (error) {
    logger.logError('Erro ao deletar arquivo', error, { userId: req.usuario.id });
    res.status(500).json({ error: 'Erro ao deletar arquivo' });
  }
});

// Obter informações de um arquivo específico
app.get('/api/files/:tipo/:filename/info', autenticarToken, async (req, res) => {
  try {
    const { tipo, filename } = req.params;
    const info = await fileManager.getFileInfo(filename, tipo);
    
    if (!info.exists) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }

    res.json({
      ...info,
      url: fileManager.getPublicUrl(filename, tipo)
    });
  } catch (error) {
    logger.logError('Erro ao obter info do arquivo', error, { userId: req.usuario.id });
    res.status(500).json({ error: 'Erro ao obter informações do arquivo' });
  }
});

// Middleware de tratamento de erros do upload
app.use(handleUploadError);

// ==========================================
// ROTAS PARA SOLICITAÇÕES
// ==========================================



// Criar nova solicitação (autenticada)
app.post('/api/solicitacoes', autenticarToken, validate(solicitacaoSchema), async (req, res) => {
  try {
    const {
      solicitante,
      imovel,
      servicos,
      prazoDesejado,
      observacoesGerais,
      anexos
    } = req.body;

    // Log dos dados recebidos para debug
    logger.info('Dados recebidos para criação de solicitação:', {
      solicitante,
      imovel,
      servicos,
      prazoDesejado,
      observacoesGerais,
      userId: req.usuario.id
    });

    // Criar solicitação com dados do imóvel incorporados
    const solicitacao = await prisma.solicitacao.create({
      data: {
        // Dados do solicitante
        nomeSolicitante: solicitante.nome,
        emailSolicitante: solicitante.email,
        telefoneSolicitante: solicitante.telefone,
        tipoSolicitante: solicitante.tipo,
        
        // Dados do imóvel incorporados diretamente
        enderecoRua: imovel.endereco.rua,
        enderecoNumero: imovel.endereco.numero,
        enderecoComplemento: imovel.endereco.complemento,
        enderecoBairro: imovel.endereco.bairro,
        enderecoCidade: imovel.endereco.cidade,
        enderecoCep: imovel.endereco.cep,
        enderecoEstado: imovel.endereco.estado,
        tipoImovel: imovel.tipo,
        areaImovel: imovel.area ? parseFloat(imovel.area.toString()) : null,
        quartosImovel: imovel.quartos ? parseInt(imovel.quartos.toString()) : null,
        banheirosImovel: imovel.banheiros ? parseInt(imovel.banheiros.toString()) : null,
        andarImovel: imovel.andar ? parseInt(imovel.andar.toString()) : null,
        temElevador: imovel.temElevador,
        observacoesImovel: imovel.observacoes,
        
        // Dados da solicitação
        prazoDesejado: prazoDesejado ? new Date(prazoDesejado) : null,
        observacoesGerais,
        usuarioId: req.usuario.id,
        
        // Criar serviços relacionados
        servicos: {
          create: servicos.map(servico => ({
            tipoServicoId: servico.tipoServicoId,
            descricao: servico.descricao,
            prioridade: servico.prioridade,
            observacoes: servico.observacoes
          }))
        }
      },
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
      }
    });

    logger.logDatabase('Solicitação criada', { 
      solicitacaoId: solicitacao.id,
      userId: req.usuario.id 
    });

    res.status(201).json({ solicitacao });
  } catch (err) {
    logger.logError('Erro ao criar solicitação', err, { 
      userId: req.usuario.id,
      errorMessage: err.message,
      errorCode: err.code,
      errorMeta: err.meta
    });
    console.error('Erro detalhado:', {
      message: err.message,
      code: err.code,
      meta: err.meta,
      stack: err.stack
    });
    res.status(500).json({ error: 'Erro ao criar solicitação.' });
  }
});

// Listar solicitações
app.get('/api/solicitacoes', autenticarToken, async (req, res) => {
  try {
    const { usuario } = req;
    let whereClause = {}; // Removido filtro por empresa
    
    // Se for prestador, filtrar solicitações relevantes
    if (!usuario.isMaster && !usuario.isAdmin && !usuario.isGestor) {
      // Buscar o prestador associado ao usuário
      const prestador = await prisma.prestador.findFirst({
        where: { usuarioId: usuario.id }
      });
      
      if (!prestador) {
        // Se não é prestador cadastrado, não pode ver nenhuma solicitação
        return res.json({ solicitacoes: [] });
      }
      
      // Buscar IDs de solicitações onde o prestador tem orçamentos
      const orcamentos = await prisma.orcamento.findMany({
        where: { prestadorId: prestador.id },
        select: { solicitacaoId: true }
      });
      
      const solicitacoesComOrcamento = orcamentos.map(o => o.solicitacaoId);
      
      // Prestador pode ver:
      // 1. Solicitações abertas ou em orçamento (para fazer novos orçamentos)
      // 2. Solicitações onde ele já tem orçamentos (histórico)
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
    }
    
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

    res.json({ solicitacoes });
  } catch (err) {
    logger.logError('Erro ao buscar solicitações', err, { userId: req.usuario.id });
    res.status(500).json({ error: 'Erro ao buscar solicitações.' });
  }
});

// Buscar solicitação por ID
app.get('/api/solicitacoes/:id', autenticarToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const solicitacao = await prisma.solicitacao.findFirst({
      where: { 
        id
      },
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
      }
    });

    if (!solicitacao) {
      return res.status(404).json({ error: 'Solicitação não encontrada.' });
    }

    res.json({ solicitacao });
  } catch (err) {
    logger.logError('Erro ao buscar solicitação', err, { userId: req.usuario.id });
    res.status(500).json({ error: 'Erro ao buscar solicitação.' });
  }
});

// Atualizar status da solicitação
app.patch('/api/solicitacoes/:id/status', autenticarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const solicitacao = await prisma.solicitacao.update({
      where: { id },
      data: { status },
      include: {
        imovel: true,
        servicos: {
          include: {
            tipoServico: true
          }
        }
      }
    });

    logger.logDatabase('Status da solicitação atualizado', { 
      solicitacaoId: id, 
      novoStatus: status,
      userId: req.usuario.id 
    });

    res.json({ solicitacao });
  } catch (err) {
    logger.logError('Erro ao atualizar status da solicitação', err, { userId: req.usuario.id });
    res.status(500).json({ error: 'Erro ao atualizar status da solicitação.' });
  }
});



// Listar tipos de serviço (autenticado)
app.get('/api/tipos-servico', autenticarToken, async (req, res) => {
  try {
    const tiposServico = await prisma.tipoServico.findMany({
      where: { 
        empresaId: req.usuario.empresaId,
        ativo: true 
      },
      orderBy: { nome: 'asc' }
    });

    res.json({ tiposServico });
  } catch (err) {
    logger.logError('Erro ao buscar tipos de serviço', err, { userId: req.usuario.id });
    res.status(500).json({ error: 'Erro ao buscar tipos de serviço.' });
  }
});

// Criar novo tipo de serviço (admin/master)
app.post('/api/tipos-servico', autenticarToken, validate(tipoServicoSchema), async (req, res) => {
  try {
    if (!req.usuario.isMaster && !req.usuario.isAdmin) {
      logger.logAuth('Acesso negado - criação de tipo de serviço', { userId: req.usuario.id });
      return res.status(403).json({ error: 'Acesso restrito.' });
    }
    
    const { nome, categoria, descricao, ativo } = req.body;
    
    const tipoServico = await prisma.tipoServico.create({
      data: {
        nome,
        categoria,
        descricao,
        ativo: ativo !== undefined ? ativo : true,
        empresaId: req.usuario.empresaId
      }
    });
    
    logger.logDatabase('Tipo de serviço criado', { 
      tipoServicoId: tipoServico.id,
      nome,
      categoria,
      createdBy: req.usuario.id 
    });
    
    res.status(201).json({ tipoServico });
  } catch (err) {
    if (err.code === 'P2002') {
      logger.logDatabase('Tentativa de criar tipo de serviço duplicado', { nome: req.body.nome });
      return res.status(400).json({ error: 'Tipo de serviço já cadastrado.' });
    }
    logger.logError('Erro ao criar tipo de serviço', err, { userId: req.usuario.id });
    res.status(500).json({ error: 'Erro ao criar tipo de serviço.' });
  }
});

// Rotas para Prestadores
app.get('/api/prestadores', autenticarToken, async (req, res) => {
  try {
    const prestadores = await prisma.prestador.findMany({
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      },
      where: {
        ativo: true
      },
      orderBy: {
        usuario: {
          nome: 'asc'
        }
      }
    });
    
    res.json(prestadores);
  } catch (error) {
    logger.error('Erro ao buscar prestadores:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rotas para Orçamentos
app.get('/api/orcamentos', autenticarToken, async (req, res) => {
  try {
    const { prestadorId } = req.query;
    const { usuario } = req;
    
    const whereClause = {};
    
    // Se for prestador, só pode ver seus próprios orçamentos
    if (!usuario.isMaster && !usuario.isAdmin && !usuario.isGestor) {
      // Buscar o prestador associado ao usuário
      const prestador = await prisma.prestador.findFirst({
        where: { usuarioId: usuario.id }
      });
      
      if (prestador) {
        whereClause.prestadorId = prestador.id;
      } else {
        // Se não é prestador cadastrado, não pode ver nenhum orçamento
        return res.json([]);
      }
    } else if (prestadorId) {
      // Para usuários master/admin/gestor, permitir filtro por prestadorId
      whereClause.prestadorId = prestadorId;
    }
    
    const orcamentos = await prisma.orcamento.findMany({
      where: whereClause,
      include: {
        solicitacao: {
          include: {
            servicos: {
              include: {
                tipoServico: true
              }
            }
          }
        },
        prestador: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                email: true
              }
            }
          }
        },
        itensServico: {
          include: {
            materiais: true
          }
        }
      },
      orderBy: {
        dataOrcamento: 'desc'
      }
    });
    
    res.json(orcamentos);
  } catch (error) {
    logger.error('Erro ao buscar orçamentos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/orcamentos', autenticarToken, validate(orcamentoSchema), async (req, res) => {
  try {
    const {
      solicitacaoId,
      prestadorId,
      itensServico,
      taxaAdm,
      prazoExecucao,
      subtotalMateriais,
      subtotalMaoDeObra,
      subtotal,
      valorTaxaAdm,
      total,
      status,
      observacoes
    } = req.body;
    
    const orcamento = await prisma.orcamento.create({
      data: {
        solicitacaoId,
        prestadorId,
        taxaAdm,
        prazoExecucao,
        subtotalMateriais,
        subtotalMaoDeObra,
        subtotal,
        valorTaxaAdm,
        total,
        status: status || 'rascunho',
        observacoes,
        dataOrcamento: new Date(),
        itensServico: {
          create: itensServico?.map(item => ({
            descricao: item.descricao,
            valorMaoDeObra: item.valorMaoDeObra,
            tempoEstimado: item.tempoEstimado,
            materiais: {
              create: item.materiais?.map(material => ({
                descricao: material.descricao,
                quantidade: material.quantidade,
                unidade: material.unidade,
                valorUnitario: material.valorUnitario,
                valorTotal: material.valorTotal
              })) || []
            }
          })) || []
        }
      },
      include: {
        itensServico: {
          include: {
            materiais: true
          }
        }
      }
    });
    
    logger.info(`Orçamento criado: ${orcamento.id}`);
    res.status(201).json(orcamento);
  } catch (error) {
    logger.error('Erro ao criar orçamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.put('/api/orcamentos/:id', autenticarToken, validate(orcamentoSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const orcamento = await prisma.orcamento.update({
      where: { id },
      data: updateData,
      include: {
        itensServico: {
          include: {
            materiais: true
          }
        }
      }
    });
    
    logger.info(`Orçamento atualizado: ${id}`);
    res.json(orcamento);
  } catch (error) {
    logger.error('Erro ao atualizar orçamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.delete('/api/orcamentos/:id', autenticarToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.orcamento.delete({
      where: { id }
    });
    
    logger.info(`Orçamento deletado: ${id}`);
    res.json({ message: 'Orçamento deletado com sucesso' });
  } catch (error) {
    logger.error('Erro ao deletar orçamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Middleware de tratamento de erros
app.use(errorLogger);
