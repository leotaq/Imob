const { z } = require('zod');

// Schema para usuário
const usuarioSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  isAdmin: z.boolean().optional().default(false),
  isGestor: z.boolean().optional().default(false)
});

// Schema para empresa
const empresaSchema = z.object({
  nome: z.string().min(2, 'Nome da empresa deve ter pelo menos 2 caracteres').max(200)
});

// Schema para login
const loginSchema = z.object({
  email: z.string().email('Email inválido').optional(),
  codigo: z.string().optional(),
  senha: z.string().min(1, 'Senha é obrigatória')
}).refine(data => data.email || data.codigo, {
  message: 'Email ou código é obrigatório'
});

// Schema para atualização de usuário
const usuarioUpdateSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  email: z.string().email('Email inválido')
});

// Schema para registro
const registroSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  email: z.string().email('Email inválido'),
  telefone: z.string().optional(),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  codigoUsuario: z.string().min(3, 'Código deve ter pelo menos 3 caracteres').max(20, 'Código deve ter no máximo 20 caracteres').regex(/^[a-z0-9]+$/, 'Código deve conter apenas letras minúsculas e números').optional(),
  tipoUsuario: z.enum(['usuario', 'prestador']),
  prestador: z.object({
    tipoPessoa: z.enum(['fisica', 'juridica']),
    documento: z.string().min(11, 'Documento inválido'),
    tipoPagamento: z.enum(['pix', 'transferencia', 'dinheiro']),
    notaRecibo: z.enum(['recibo', 'nota_fiscal']),
    especialidades: z.array(z.string()).min(1, 'Pelo menos uma especialidade é obrigatória')
  }).optional()
});

// Schema para solicitação
const solicitacaoSchema = z.object({
  imovelId: z.string().min(1, 'ID do imóvel é obrigatório'),
  tipoSolicitante: z.enum(['inquilino', 'proprietario', 'imobiliaria', 'terceiros']),
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  telefone: z.string().regex(/^\([0-9]{2}\)\s[0-9]{4,5}-[0-9]{4}$/, 'Formato de telefone inválido'),
  endereco: z.string().min(5, 'Endereço deve ter pelo menos 5 caracteres'),
  cidade: z.string().min(2, 'Cidade é obrigatória'),
  tipoManutencao: z.string().min(1, 'Tipo de manutenção é obrigatório'),
  descricao: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  prazoFinal: z.string().datetime('Data inválida')
});

// Schema para prestador
const prestadorSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  contato: z.string().min(10, 'Contato deve ter pelo menos 10 caracteres'),
  tipoPessoa: z.enum(['cpf', 'cnpj']),
  documento: z.string().min(11, 'Documento inválido'),
  tipoPagamento: z.enum(['pix', 'transferencia', 'dinheiro', 'cartao']),
  notaRecibo: z.enum(['nota', 'recibo'])
});

// Schema para orçamento
const orcamentoSchema = z.object({
  solicitacaoId: z.string().uuid('ID da solicitação inválido'),
  prestadorId: z.string().uuid('ID do prestador inválido'),
  maoDeObra: z.number().min(0, 'Valor da mão de obra deve ser positivo'),
  materiais: z.number().min(0, 'Valor dos materiais deve ser positivo'),
  taxaAdm: z.number().min(0).max(100, 'Taxa administrativa deve estar entre 0 e 100%'),
  prazoExecucao: z.number().min(1, 'Prazo de execução deve ser pelo menos 1 dia'),
  observacoes: z.string().optional()
});

// Middleware de validação
const validate = (schema) => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.body);
      req.validatedData = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
};

module.exports = {
  usuarioSchema,
  empresaSchema,
  loginSchema,
  usuarioUpdateSchema,
  registroSchema,
  solicitacaoSchema,
  prestadorSchema,
  orcamentoSchema,
  validate
};