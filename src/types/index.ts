export interface Solicitacao {
  id: string;
  imovelId: string;
  tipoSolicitante: 'inquilino' | 'proprietario' | 'imobiliaria' | 'terceiros';
  nome: string;
  telefone: string;
  endereco: string;
  cidade: string;
  tipoManutencao: string;
  dataSolicitacao: Date;
  prazoFinal: Date;
  descricao: string;
  status: 'aberta' | 'orcamento' | 'aprovada' | 'execucao' | 'concluida' | 'cancelada';
}

export interface Prestador {
  id: string;
  nome: string;
  contato: string;
  tipoPessoa: 'cpf' | 'cnpj';
  documento: string; // CPF ou CNPJ
  tipoPagamento: 'pix' | 'transferencia' | 'dinheiro' | 'cartao';
  notaRecibo: 'nota' | 'recibo';
}

export interface Orcamento {
  id: string;
  solicitacaoId: string;
  prestador: Prestador;
  maoDeObra: number;
  materiais: number;
  taxaAdm: number; // percentual
  prazoExecucao: number; // em dias
  total: number;
  isPrincipal: boolean;
  dataOrcamento: Date;
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