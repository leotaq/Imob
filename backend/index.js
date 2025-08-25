console.log('Backend iniciado!');
const express = require('express');
require('dotenv').config(); // <-- adicione esta linha
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const jwt = require('jsonwebtoken');
// Defina uma chave secreta forte em produção! Pode ser do .env
const JWT_SECRET = process.env.JWT_SECRET || 'segredo_super_secreto';

const app = express();
const prisma = new PrismaClient();


app.use((req, res, next) => {
  console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});
app.use(cors());
app.use(express.json());

// Listar todos os usuários da empresa do usuário autenticado
// Listar todas as empresas e seus usuários (admin/master)
app.get('/api/empresas', autenticarToken, async (req, res) => {
  try {
    // Apenas master pode listar todas as empresas
    if (!req.usuario.isMaster) return res.status(403).json({ error: 'Acesso restrito.' });
    const empresas = await prisma.empresa.findMany({
      include: {
        usuarios: {
          select: { id: true, nome: true, email: true, isGestor: true }
        }
      }
    });
    res.json({ empresas });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar empresas.' });
  }
});

// Cadastrar nova empresa (admin/master)
app.post('/api/empresas', autenticarToken, async (req, res) => {
  try {
    if (!req.usuario.isMaster) return res.status(403).json({ error: 'Acesso restrito.' });
    const { nome } = req.body;
    if (!nome) return res.status(400).json({ error: 'Nome da empresa obrigatório.' });
    const empresa = await prisma.empresa.create({ data: { nome } });
    res.status(201).json({ empresa });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar empresa.' });
  }
});

// Cadastrar novo usuário em uma empresa (admin/master)
app.post('/api/empresas/:empresaId/usuarios', autenticarToken, async (req, res) => {
  try {
    if (!req.usuario.isMaster) return res.status(403).json({ error: 'Acesso restrito.' });
    const { empresaId } = req.params;
    const { nome, email, senha, isGestor } = req.body;
    if (!nome || !email || !senha) return res.status(400).json({ error: 'Preencha todos os campos.' });
    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: await bcrypt.hash(senha, 10),
        isGestor: !!isGestor,
        empresaId
      }
    });
    res.status(201).json({ usuario });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'E-mail já cadastrado.' });
    }
    res.status(500).json({ error: 'Erro ao criar usuário.' });
  }
});
app.get('/api/usuarios', autenticarToken, async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      where: { empresaId: req.usuario.empresaId },
      select: { id: true, nome: true, email: true, isAdmin: true }
    });
    res.json({ usuarios });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar usuários.' });
  }
});

// Cadastro de empresa e usuário admin
app.post('/api/register', async (req, res) => {
  const { nomeEmpresa, nome, email, senha } = req.body;
  if (!nomeEmpresa || !nome || !email || !senha) {
    return res.status(400).json({ error: 'Preencha todos os campos.' });
  }
  try {
    const empresa = await prisma.empresa.create({
      data: {
        nome: nomeEmpresa,
        usuarios: {
          create: {
            nome,
            email,
            senha: await bcrypt.hash(senha, 10),
            isAdmin: true // O primeiro usuário cadastrado é admin
          },
        },
      },
      include: { usuarios: true },
    });
    res.status(201).json({ empresa });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'E-mail já cadastrado.' });
    }
    res.status(500).json({ error: 'Erro ao cadastrar.' });
  }
});


// Login de usuário com JWT

// Login master OU login normal
app.post('/api/login', async (req, res) => {
  const { email, id, senha } = req.body;
  if ((!email && !id) || !senha) {
    return res.status(400).json({ error: 'Preencha todos os campos.' });
  }
  try {
    // Permitir login por email OU id
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
          empresa: true
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
          empresa: true
        }
      });
    }
    if (!usuario) return res.status(401).json({ error: 'Usuário ou senha inválidos.' });
    const senhaOk = await bcrypt.compare(senha, usuario.senha);
    if (!senhaOk) return res.status(401).json({ error: 'Usuário ou senha inválidos.' });
    // Gerar JWT incluindo isMaster
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
    console.log('LOGIN usuario retornado:', usuarioRetorno);
    res.json({
      usuario: usuarioRetorno,
      token
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao fazer login.' });
  }
});

// Middleware para proteger rotas
function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  console.log('Authorization header:', authHeader);
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    console.log('Token não fornecido.');
    return res.status(401).json({ error: 'Token não fornecido.' });
  }
  jwt.verify(token, JWT_SECRET, (err, usuario) => {
    if (err) {
      console.log('Token inválido:', err.message);
      return res.status(403).json({ error: 'Token inválido.' });
    }
    console.log('Usuário autenticado pelo token:', usuario);
    req.usuario = usuario;
    next();
  });
}

// Exemplo de rota protegida
app.get('/api/me', autenticarToken, async (req, res) => {
  // req.usuario contém os dados do token
  const usuario = await prisma.usuario.findUnique({
    where: { id: req.usuario.id },
    include: { empresa: true }
  });
  if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado.' });
  res.json({ usuario });
});

// Criação automática do usuário master e empresa Master
async function criarMaster() {
  const masterEmail = 'leommaster';
  const masterSenha = 'l1e2o3ariele';
  const masterNome = 'Leo Master';
  const masterEmpresaNome = 'Master';

  // Verifica se já existe usuário master
  const jaExiste = await prisma.usuario.findFirst({ where: { email: masterEmail, isMaster: true } });
  if (jaExiste) return;

  // Cria empresa Master se não existir
  let empresa = await prisma.empresa.findFirst({ where: { nome: masterEmpresaNome } });
  if (!empresa) {
    empresa = await prisma.empresa.create({ data: { nome: masterEmpresaNome } });
  }

  // Cria usuário master
  await prisma.usuario.create({
    data: {
      nome: masterNome,
      email: masterEmail,
      senha: await require('bcryptjs').hash(masterSenha, 10),
      isAdmin: true,
      isMaster: true,
      empresaId: empresa.id
    }
  });
  console.log('Usuário master criado com sucesso!');
}

criarMaster();

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});

// Atualizar papel gestor do usuário
app.patch('/api/empresas/:empresaId/usuarios/:usuarioId', autenticarToken, async (req, res) => {
  try {
    if (!req.usuario.isMaster) return res.status(403).json({ error: 'Acesso restrito.' });
    const { empresaId, usuarioId } = req.params;
    const { isGestor } = req.body;
    console.log('PATCH usuarioId:', usuarioId, 'empresaId:', empresaId, 'isGestor:', isGestor);
    // Buscar usuário antes do update
    const usuarioAntes = await prisma.usuario.findUnique({ where: { id: usuarioId } });
    console.log('Usuário antes do update:', usuarioAntes);
    const usuario = await prisma.usuario.update({
      where: { id: usuarioId },
      data: { isGestor: !!isGestor }
    });
    console.log('Usuário após update:', usuario);
    res.json({ usuario });
  } catch (err) {
    console.error('Erro ao atualizar usuário:', err);
    res.status(500).json({ error: 'Erro ao atualizar usuário.', details: err.message });
  }
});
