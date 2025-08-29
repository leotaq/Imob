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
  orcamentoSchema 
} = require('./schemas/validation');

// Importar sistema de upload
const { upload, handleUploadError, uploadsDir } = require('./middleware/upload');
const FileManager = require('./utils/fileManager');

const JWT_SECRET = process.env.JWT_SECRET || 'segredo_super_secreto';

const app = express();
const prisma = new PrismaClient();
const fileManager = new FileManager(uploadsDir);

// Configurações de segurança
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: { error: 'Muitas tentativas. Tente novamente em 15 minutos.' }
});
app.use('/api/', limiter);

// Rate limiting específico para login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // máximo 5 tentativas de login por IP
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' }
});

// Middlewares
app.use(cors());
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
          select: { id: true, nome: true, email: true, isGestor: true }
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
app.post('/api/register', validate(registroSchema), async (req, res) => {
  try {
    const { nomeEmpresa, nome, email, senha } = req.body;
    
    const empresa = await prisma.empresa.create({
      data: {
        nome: nomeEmpresa,
        usuarios: {
          create: {
            nome,
            email,
            senha: await bcrypt.hash(senha, 10),
            isAdmin: true
          },
        },
      },
      include: { usuarios: true },
    });
    
    logger.logDatabase('Empresa e usuário admin registrados', { 
      empresaId: empresa.id, 
      nomeEmpresa, 
      email 
    });
    
    res.status(201).json({ empresa });
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
app.post('/api/login', loginLimiter, validate(loginSchema), async (req, res) => {
  try {
    const { email, id, senha } = req.body;
    
    let usuario;
    if (email) {
      usuario = await prisma.usuario.findUnique({
        where: { email },
        select: {
          id: true,
          nome: true,
          email: true,
          senha: true,
          isAdmin: true,
          isMaster: true,
          empresa: true,
          empresaId: true
        }
      });
    } else if (id) {
      usuario = await prisma.usuario.findUnique({
        where: { id },
        select: {
          id: true,
          nome: true,
          email: true,
          senha: true,
          isAdmin: true,
          isMaster: true,
          empresa: true,
          empresaId: true
        }
      });
    }
    
    if (!usuario) {
      logger.logAuth('Tentativa de login com credenciais inválidas', { email, id, ip: req.ip });
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
        isMaster: usuario.isMaster
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
      isMaster: usuario.isMaster
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

// Middleware de tratamento de erros
app.use(errorLogger);

// Inicialização
criarMaster();

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  logger.info(`API rodando em http://localhost:${PORT}`);
});

// Servir arquivos estáticos (uploads)
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

// Criar nova solicitação
app.post('/api/solicitacoes', autenticarToken, async (req, res) => {
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

    // Criar ou encontrar imóvel
    let imovelRecord = await prisma.imovel.findFirst({
      where: {
        rua: imovel.endereco.rua,
        numero: imovel.endereco.numero,
        bairro: imovel.endereco.bairro,
        cidade: imovel.endereco.cidade,
        empresaId: req.usuario.empresaId
      }
    });

    if (!imovelRecord) {
      imovelRecord = await prisma.imovel.create({
        data: {
          rua: imovel.endereco.rua,
          numero: imovel.endereco.numero,
          complemento: imovel.endereco.complemento,
          bairro: imovel.endereco.bairro,
          cidade: imovel.endereco.cidade,
          cep: imovel.endereco.cep,
          estado: imovel.endereco.estado,
          tipo: imovel.tipo,
          area: imovel.area?.toString() || null,
          quartos: imovel.quartos?.toString() || null,
          banheiros: imovel.banheiros?.toString() || null,
          andar: imovel.andar?.toString() || null,
          temElevador: imovel.temElevador?.toString() || null,
          observacoes: imovel.observacoes,
          empresaId: req.usuario.empresaId
        }
      });
    }

    // Criar solicitação
    const solicitacao = await prisma.solicitacao.create({
      data: {
        nomeSolicitante: solicitante.nome,
        emailSolicitante: solicitante.email,
        telefoneSolicitante: solicitante.telefone,
        tipoSolicitante: solicitante.tipo,
        imovelId: imovelRecord.id,
        prazoDesejado: prazoDesejado ? new Date(prazoDesejado) : null,
        observacoesGerais,
        usuarioId: req.usuario.id,
        empresaId: req.usuario.empresaId,
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
        imovel: true,
        servicos: {
          include: {
            tipoServico: true
          }
        },
        anexos: true
      }
    });

    logger.logDatabase('Solicitação criada', { 
      solicitacaoId: solicitacao.id, 
      imovelId: imovelRecord.id,
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
    const solicitacoes = await prisma.solicitacao.findMany({
      where: { empresaId: req.usuario.empresaId },
      include: {
        imovel: true,
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
        id,
        empresaId: req.usuario.empresaId 
      },
      include: {
        imovel: true,
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

// Listar tipos de serviço
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

// Middleware de tratamento de erros
app.use(errorLogger);
