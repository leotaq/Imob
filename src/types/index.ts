export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  tipo: 'inquilino' | 'proprietario' | 'gestor' | 'prestador' | 'admin';
  documento?: string;
  endereco?: string;
  ativo: boolean;
  dataCriacao: Date;
}

export interface Imovel {
  id: string;
  endereco: string;
  cidade: string;
  cep: string;
  tipo: 'apartamento' | 'casa' | 'comercial' | 'terreno';
  proprietarioId: string;
  inquilinoId?: string;
  gestorId?: string;
  ativo: boolean;
}

export interface TipoServico {
  id: string;
  nome: string;
  categoria: 'eletrica' | 'hidraulica' | 'pintura' | 'limpeza' | 'jardinagem' | 'outros';
  descricao: string;
  ativo: boolean;
}

export interface ServicoSolicitado {
  id: string;
  tipoServicoId: string;
  descricao: string;
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  observacoes?: string;
}

export interface Solicitacao {
  id: string;
  imovelId: string;
  solicitanteId: string;
  tipoSolicitante: 'inquilino' | 'proprietario' | 'gestor' | 'terceiros';
  servicos: ServicoSolicitado[];
  status: 'pendente' | 'orcamento' | 'aprovada' | 'em_andamento' | 'concluida' | 'cancelada';
  dataSolicitacao: Date;
  prazoDesejado?: Date;
  observacoesGerais?: string;
  anexos?: {
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    url: string;
  }[];
}

export interface Prestador {
  id: string;
  usuarioId: string;
  nome: string;
  contato: string;
  tipoPessoa: 'cpf' | 'cnpj';
  documento: string; // CPF ou CNPJ
  tipoPagamento: 'pix' | 'transferencia' | 'dinheiro' | 'cartao';
  notaRecibo: 'nota' | 'recibo';
  especialidades: string[]; // IDs dos tipos de serviço que oferece
  avaliacaoMedia?: number;
  ativo: boolean;
  dataCadastro: Date;
}

export interface ItemOrcamentoServico {
  id: string;
  servicoSolicitadoId: string;
  descricaoServico: string;
  materiais: ItemMaterial[];
  maoDeObra: number;
  tempoEstimado: number; // em horas
  observacoes?: string;
}

export interface ItemMaterial {
  id: string;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  unidade: string; // ex: 'un', 'kg', 'm²', 'litros'
}

export interface Orcamento {
  id: string;
  solicitacaoId: string;
  prestadorId: string;
  itensServico: ItemOrcamentoServico[];
  taxaAdm: number; // percentual
  prazoExecucao: number; // em dias
  dataVisita?: Date;
  observacoesGerais?: string;
  subtotalMateriais: number;
  subtotalMaoDeObra: number;
  subtotal: number;
  valorTaxaAdm: number;
  total: number;
  status: 'rascunho' | 'enviado' | 'aprovado' | 'rejeitado' | 'cancelado';
  dataOrcamento: Date;
  dataAprovacao?: Date;
}

export interface AvaliacaoPrestador {
  id: string;
  prestadorId: string;
  solicitacaoId: string;
  avaliadorId: string;
  nota: number; // 1 a 5
  comentario?: string;
  dataAvaliacao: Date;
}

export interface Execucao {
  id: string;
  solicitacaoId: string;
  orcamentoId: string;
  status: 'aberta' | 'andamento' | 'concluida';
  dataInicio?: Date;
  dataFinalizacao?: Date;
  observacoes: string;
}

export interface HistoricoStatus {
  id: string;
  solicitacaoId: string;
  statusAnterior: string;
  statusNovo: string;
  data: Date;
  usuario: string;
  observacao: string;
}

// Novas interfaces para comentários
export interface Comentario {
  id: string;
  solicitacaoId: string;
  usuario: string;
  texto: string;
  data: Date;
  tipo: 'comentario' | 'status' | 'sistema';
  anexos?: string[]; // URLs dos anexos
}

export interface HistoricoCompleto {
  id: string;
  solicitacaoId: string;
  tipo: 'comentario' | 'status' | 'criacao' | 'edicao' | 'anexo';
  usuario: string;
  data: Date;
  descricao: string;
  detalhes?: {
    statusAnterior?: string;
    statusNovo?: string;
    camposAlterados?: string[];
    comentario?: string;
    anexos?: string[];
  };
}

export interface OrcamentoConsolidado {
  id: string;
  imovelId: string;
  solicitacoes: string[]; // IDs das solicitações incluídas
  prestador: Prestador;
  itens: ItemOrcamento[];
  subtotal: number;
  taxaAdm: number;
  total: number;
  prazoExecucao: number;
  dataOrcamento: Date;
  observacoes?: string;
  status: 'rascunho' | 'enviado' | 'aprovado' | 'rejeitado';
}

export interface ItemOrcamento {
  id: string;
  solicitacaoId: string;
  tipoManutencao: string;
  descricao: string;
  maoDeObra: number;
  materiais: number;
  subtotal: number;
}