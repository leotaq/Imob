import { z } from 'zod';

// Schema para usuário
export const usuarioSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  isGestor: z.boolean().optional()
});

// Schema para empresa
export const empresaSchema = z.object({
  nome: z.string().min(2, 'Nome da empresa deve ter pelo menos 2 caracteres')
});

// Schema para login
export const loginSchema = z.object({
  email: z.string().email('Email inválido').optional(),
  id: z.string().optional(),
  senha: z.string().min(1, 'Senha é obrigatória')
}).refine(data => data.email || data.id, {
  message: 'Email ou ID é obrigatório'
});

// Schema para registro
export const registroSchema = z.object({
  nomeEmpresa: z.string().min(2, 'Nome da empresa deve ter pelo menos 2 caracteres'),
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')
});

// Schema para solicitação
export const solicitacaoSchema = z.object({
  titulo: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  descricao: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  prioridade: z.enum(['baixa', 'media', 'alta']),
  categoria: z.string().min(2, 'Categoria é obrigatória'),
  local: z.string().min(3, 'Local deve ter pelo menos 3 caracteres'),
  dataLimite: z.string().optional(),
  anexos: z.array(z.string()).optional()
});

// Schema para prestador
export const prestadorSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  telefone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  especialidades: z.array(z.string()).min(1, 'Pelo menos uma especialidade é obrigatória'),
  avaliacao: z.number().min(0).max(5).optional(),
  ativo: z.boolean().default(true)
});

// Schema para orçamento
export const orcamentoSchema = z.object({
  solicitacaoId: z.string().min(1, 'ID da solicitação é obrigatório'),
  prestadorId: z.string().min(1, 'ID do prestador é obrigatório'),
  valor: z.number().positive('Valor deve ser positivo'),
  descricao: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  prazoExecucao: z.number().positive('Prazo deve ser positivo'),
  observacoes: z.string().optional(),
  itens: z.array(z.object({
    descricao: z.string(),
    quantidade: z.number().positive(),
    valorUnitario: z.number().positive(),
    valorTotal: z.number().positive()
  })).optional()
});

// Tipos TypeScript derivados dos schemas
export type Usuario = z.infer<typeof usuarioSchema>;
export type Empresa = z.infer<typeof empresaSchema>;
export type Login = z.infer<typeof loginSchema>;
export type Registro = z.infer<typeof registroSchema>;
export type SolicitacaoForm = z.infer<typeof solicitacaoSchema>;
export type PrestadorForm = z.infer<typeof prestadorSchema>;
export type OrcamentoForm = z.infer<typeof orcamentoSchema>;

// Hook para validação no frontend
export const useValidation = () => {
  const validateForm = <T>(schema: z.ZodSchema<T>, data: unknown) => {
    try {
      const result = schema.parse(data);
      return { success: true, data: result, errors: null };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.reduce((acc, err) => {
          const path = err.path.join('.');
          acc[path] = err.message;
          return acc;
        }, {} as Record<string, string>);
        return { success: false, data: null, errors };
      }
      return { success: false, data: null, errors: { general: 'Erro de validação' } };
    }
  };

  return { validateForm };
};