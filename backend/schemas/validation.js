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
  solicitante: z.object({
    nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    telefone: z.string().optional(),
    tipo: z.enum(['inquilino', 'proprietario', 'imobiliaria', 'terceiros'])
  }),
  imovel: z.object({
    endereco: z.object({
      rua: z.string().min(2, 'Rua é obrigatória'),
      numero: z.string().min(1, 'Número é obrigatório'),
      complemento: z.string().optional(),
      bairro: z.string().min(2, 'Bairro é obrigatório'),
      cidade: z.string().min(2, 'Cidade é obrigatória'),
      cep: z.string().min(8, 'CEP é obrigatório'),
      estado: z.string().min(2, 'Estado é obrigatório')
    }),
    tipo: z.string().min(1, 'Tipo do imóvel é obrigatório'),
    area: z.union([z.string(), z.number()]).optional(),
    quartos: z.union([z.string(), z.number()]).optional(),
    banheiros: z.union([z.string(), z.number()]).optional(),
    andar: z.union([z.string(), z.number()]).optional(),
    temElevador: z.boolean().optional(),
    observacoes: z.string().optional()
  }),
  servicos: z.array(z.object({
    tipoServicoId: z.string().min(1, 'Tipo de serviço é obrigatório'),
    descricao: z.string().min(5, 'Descrição deve ter pelo menos 5 caracteres'),
    prioridade: z.enum(['baixa', 'media', 'alta']).default('media'),
    observacoes: z.string().optional()
  })).min(1, 'Pelo menos um serviço é obrigatório'),
  prazoDesejado: z.string().optional(),
  observacoesGerais: z.string().optional(),
  anexos: z.array(z.string()).optional()
});

// Schema para prestador
const prestadorSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  contato: z.string().min(10, 'Contato deve ter pelo menos 10 caracteres'),
  tipoPessoa: z.enum(['fisica', 'juridica']),
  documento: z.string().min(11, 'Documento inválido'),
  tipoPagamento: z.enum(['pix', 'transferencia', 'dinheiro']),
  notaRecibo: z.enum(['nota_fiscal', 'recibo']),
  especialidades: z.array(z.string()).min(1, 'Pelo menos uma especialidade é obrigatória')
});

// Schema para orçamento
const orcamentoSchema = z.object({
  solicitacaoId: z.string().uuid('ID da solicitação inválido'),
  prestadorId: z.string().uuid('ID do prestador inválido'),
  itensServico: z.array(z.object({
    descricao: z.string().min(5, 'Descrição deve ter pelo menos 5 caracteres'),
    valorMaoDeObra: z.number().min(0, 'Valor da mão de obra deve ser positivo'),
    tempoEstimado: z.number().min(1, 'Tempo estimado deve ser pelo menos 1 hora'),
    materiais: z.array(z.object({
      descricao: z.string().min(2, 'Descrição do material é obrigatória'),
      quantidade: z.number().min(0.1, 'Quantidade deve ser positiva'),
      unidade: z.string().min(1, 'Unidade é obrigatória'),
      valorUnitario: z.number().min(0, 'Valor unitário deve ser positivo'),
      valorTotal: z.number().min(0, 'Valor total deve ser positivo')
    })).optional()
  })).min(1, 'Pelo menos um item de serviço é obrigatório'),
  taxaAdm: z.number().min(0).max(100, 'Taxa administrativa deve estar entre 0 e 100%'),
  prazoExecucao: z.number().min(1, 'Prazo de execução deve ser pelo menos 1 dia'),
  observacoes: z.string().optional(),
  dataVisita: z.string().optional()
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

// Schema para tipos de serviço
const tipoServicoSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  categoria: z.string().min(2, 'Categoria é obrigatória'),
  descricao: z.string().optional(),
  ativo: z.boolean().default(true)
});

// Schema para permissões de usuário
const permissoesSchema = z.object({
  permissoes: z.array(z.string()).min(0, 'Permissões devem ser um array válido')
});

module.exports = {
  usuarioSchema,
  empresaSchema,
  loginSchema,
  usuarioUpdateSchema,
  registroSchema,
  solicitacaoSchema,
  prestadorSchema,
  orcamentoSchema,
  tipoServicoSchema,
  permissoesSchema,
  validate
};