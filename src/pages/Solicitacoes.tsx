import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, MessageSquare, History, Paperclip, Eye, Download } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Solicitacao } from '@/types';
import { useSolicitacoes } from '@/hooks/useSolicitacoes';
import { useComentarios } from '@/hooks/useComentarios';
import SolicitacaoFiltersComponent from '@/components/SolicitacaoFilters';
import SolicitacaoCard from '@/components/SolicitacaoCard';
import SolicitacaoHistorico from '@/components/SolicitacaoHistorico';
import { useToast } from '@/hooks/use-toast';
import { Search, Grid, List } from 'lucide-react';
import SolicitacaoTable from '@/components/SolicitacaoTable';
import Pagination from '@/components/Pagination';
import { FileUpload } from '@/components/FileUpload';
import { useFileUpload } from '@/hooks/useFileUpload';
import { ExportDialog } from '@/components/ExportDialog';

// Função para gerar ID único
const generateUniqueId = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `SOL-${timestamp}-${random.toString().padStart(3, '0')}`;
};

// Formulário de edição melhorado
function EditSolicitacaoForm({ solicitacao, onCancel, onSave }) {
  const [form, setForm] = React.useState({
    ...solicitacao,
    prazoFinal: solicitacao.prazoFinal instanceof Date ? solicitacao.prazoFinal.toISOString().slice(0,10) : solicitacao.prazoFinal,
    dataSolicitacao: solicitacao.dataSolicitacao instanceof Date ? solicitacao.dataSolicitacao.toISOString().slice(0,10) : solicitacao.dataSolicitacao
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      ...form,
      prazoFinal: new Date(form.prazoFinal),
      dataSolicitacao: new Date(form.dataSolicitacao),
    });
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">ID da Solicitação</label>
          <input 
            name="id" 
            className="w-full border rounded px-2 py-1 bg-gray-100" 
            value={form.id} 
            disabled 
            readOnly 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">ID do Imóvel *</label>
          <input name="imovelId" className="w-full border rounded px-2 py-1" value={form.imovelId} onChange={handleChange} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tipo de Solicitante *</label>
          <select name="tipoSolicitante" className="w-full border rounded px-2 py-1" value={form.tipoSolicitante} onChange={handleChange} required>
            <option value="inquilino">Inquilino</option>
            <option value="proprietario">Proprietário</option>
            <option value="imobiliaria">Imobiliária</option>
            <option value="terceiros">Terceiros</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Nome *</label>
          <input name="nome" className="w-full border rounded px-2 py-1" value={form.nome} onChange={handleChange} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Telefone *</label>
          <input name="telefone" className="w-full border rounded px-2 py-1" value={form.telefone} onChange={handleChange} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Endereço *</label>
          <input name="endereco" className="w-full border rounded px-2 py-1" value={form.endereco} onChange={handleChange} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Cidade *</label>
          <input name="cidade" className="w-full border rounded px-2 py-1" value={form.cidade} onChange={handleChange} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tipo de Manutenção *</label>
          <input name="tipoManutencao" className="w-full border rounded px-2 py-1" value={form.tipoManutencao} onChange={handleChange} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Prazo Final *</label>
          <input name="prazoFinal" type="date" className="w-full border rounded px-2 py-1" value={form.prazoFinal} onChange={handleChange} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status *</label>
          <select name="status" className="w-full border rounded px-2 py-1" value={form.status} onChange={handleChange} required>
            <option value="aberta">Aberta</option>
            <option value="orcamento">Orçamento</option>
            <option value="aprovada">Aprovada</option>
            <option value="execucao">Em Execução</option>
            <option value="concluida">Concluída</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Descrição</label>
        <textarea 
          name="descricao" 
          className="w-full border rounded px-2 py-1 h-20" 
          value={form.descricao} 
          onChange={handleChange} 
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Salvar</Button>
      </div>
    </form>
  );
}

const solicitacaoSchema = z.object({
  imovelId: z.string().min(1, 'ID do imóvel é obrigatório'),
  tipoSolicitante: z.enum(['inquilino', 'proprietario', 'imobiliaria', 'terceiros']),
  nome: z.string().min(1, 'Nome é obrigatório'),
  telefone: z.string().min(1, 'Telefone é obrigatório'),
  endereco: z.string().min(1, 'Endereço é obrigatório'),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  tipoManutencao: z.string().min(1, 'Tipo de manutenção é obrigatório'),
  prazoFinal: z.string().min(1, 'Prazo final é obrigatório'),
  descricao: z.string().optional(),
});

type SolicitacaoFormData = z.infer<typeof solicitacaoSchema>;

const Solicitacoes: React.FC = () => {
  const {
    solicitacoes,
    allSolicitacoes,
    loading,
    filters,
    setFilters,
    createSolicitacao,
    updateSolicitacao,
    deleteSolicitacao,
    changeStatus
  } = useSolicitacoes();

  const [selectedSolicitacao, setSelectedSolicitacao] = useState<Solicitacao | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [historicoDialogOpen, setHistoricoDialogOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Novos estados para as melhorias
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  const { toast } = useToast();
  
  // Estado para upload de arquivos
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Hook para comentários e histórico da solicitação selecionada
  const {
    comentarios,
    historico,
    loading: comentariosLoading,
    addComentario,
    addHistoricoStatus,
    addHistoricoEdicao
  } = useComentarios(selectedSolicitacao?.id || '');

  // Filtrar solicitações por termo de busca
  const filteredSolicitacoes = useMemo(() => {
    return solicitacoes.filter(solicitacao => 
      solicitacao.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      solicitacao.tipoManutencao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      solicitacao.imovelId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      solicitacao.endereco.toLowerCase().includes(searchTerm.toLowerCase()) ||
      solicitacao.cidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (solicitacao.descricao && solicitacao.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [solicitacoes, searchTerm]);

  // Paginação
  const totalPages = Math.ceil(filteredSolicitacoes.length / pageSize);
  const paginatedSolicitacoes = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredSolicitacoes.slice(startIndex, startIndex + pageSize);
  }, [filteredSolicitacoes, currentPage, pageSize]);

  // Reset página quando filtros mudam
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  const form = useForm<SolicitacaoFormData>({
    resolver: zodResolver(solicitacaoSchema),
    defaultValues: {
      imovelId: '',
      tipoSolicitante: 'inquilino',
      nome: '',
      telefone: '',
      endereco: '',
      cidade: '',
      tipoManutencao: '',
      prazoFinal: '',
      descricao: '',
    },
  });

  const onSubmit = async (data: SolicitacaoFormData) => {
    try {
      const uniqueId = generateUniqueId();
      await createSolicitacao({
        ...data,
        id: uniqueId,
        prazoFinal: new Date(data.prazoFinal)
      });
      form.reset();
      setIsDialogOpen(false);
    } catch (error) {
      // Error já tratado no hook
    }
  };

  const handleView = (solicitacao: Solicitacao) => {
    setSelectedSolicitacao(solicitacao);
    setViewDialogOpen(true);
  };

  const handleViewHistorico = (solicitacao: Solicitacao) => {
    setSelectedSolicitacao(solicitacao);
    setHistoricoDialogOpen(true);
  };

  const handleEdit = (solicitacao: Solicitacao) => {
    setSelectedSolicitacao(solicitacao);
    setEditDialogOpen(true);
  };

  const handleDelete = (solicitacao: Solicitacao) => {
    setSelectedSolicitacao(solicitacao);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedSolicitacao) {
      try {
        await deleteSolicitacao(selectedSolicitacao.id);
        setDeleteDialogOpen(false);
        setSelectedSolicitacao(null);
      } catch (error) {
        // Error já tratado no hook
      }
    }
  };

  const handleEditSave = async (updatedData: Partial<Solicitacao>) => {
    if (selectedSolicitacao) {
      try {
        // Detectar campos alterados
        const camposAlterados: string[] = [];
        Object.keys(updatedData).forEach(key => {
          if (updatedData[key] !== selectedSolicitacao[key]) {
            camposAlterados.push(key);
          }
        });
        
        await updateSolicitacao(selectedSolicitacao.id, updatedData);
        
        // Adicionar ao histórico
        if (camposAlterados.length > 0) {
          addHistoricoEdicao(camposAlterados);
        }
        
        setEditDialogOpen(false);
        setSelectedSolicitacao(null);
      } catch (error) {
        // Error já tratado no hook
      }
    }
  };

  const handleStatusChange = async (solicitacao: Solicitacao, newStatus: string) => {
    try {
      const statusAnterior = solicitacao.status;
      await changeStatus(solicitacao.id, newStatus);
      
      // Adicionar ao histórico quando o status mudar
      if (selectedSolicitacao?.id === solicitacao.id) {
        addHistoricoStatus(statusAnterior, newStatus);
      }
    } catch (error) {
      // Error já tratado no hook
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho com busca e alternância de visualização */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Solicitações</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie todas as solicitações de manutenção com filtros avançados
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Busca Rápida */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar solicitações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          {/* Botão de Exportação */}
          <ExportDialog solicitacoes={filteredSolicitacoes}>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </ExportDialog>
          
          {/* Alternância de Visualização */}
          <div className="flex border rounded-lg p-1">
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className="h-8 px-3"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="h-8 px-3"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Botão Nova Solicitação */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Solicitação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nova Solicitação de Manutenção</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="imovelId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ID do Imóvel *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: APT-001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tipoSolicitante"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Solicitante *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="inquilino">Inquilino</SelectItem>
                              <SelectItem value="proprietario">Proprietário</SelectItem>
                              <SelectItem value="imobiliaria">Imobiliária</SelectItem>
                              <SelectItem value="terceiros">Terceiros</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome do solicitante" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="telefone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone *</FormLabel>
                          <FormControl>
                            <Input placeholder="(11) 99999-9999" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="endereco"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Endereço *</FormLabel>
                          <FormControl>
                            <Input placeholder="Endereço completo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cidade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade *</FormLabel>
                          <FormControl>
                            <Input placeholder="Cidade" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tipoManutencao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Manutenção *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Elétrica, Hidráulica..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="prazoFinal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prazo Final *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="descricao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <textarea 
                            className="w-full min-h-[100px] px-3 py-2 border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md"
                            placeholder="Descreva detalhadamente o problema ou solicitação..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Upload de Arquivos */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Anexos (Opcional)</label>
                    <FileUpload
                      onFilesUploaded={setUploadedFiles}
                      maxFiles={5}
                      acceptedTypes={['image/*', 'application/pdf', '.doc,.docx']}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Criando...' : 'Criar Solicitação'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtros Avançados */}
      <SolicitacaoFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        totalCount={allSolicitacoes.length}
        filteredCount={filteredSolicitacoes.length}
      />

      {/* Lista de Solicitações com alternância de visualização */}
      <div className="space-y-4">
        {loading && (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Carregando...</p>
            </CardContent>
          </Card>
        )}
        
        {!loading && paginatedSolicitacoes.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                {searchTerm 
                  ? `Nenhuma solicitação encontrada para "${searchTerm}".`
                  : allSolicitacoes.length === 0 
                    ? 'Nenhuma solicitação encontrada. Crie a primeira!' 
                    : 'Nenhuma solicitação corresponde aos filtros aplicados.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {viewMode === 'cards' ? (
              <div className="space-y-4">
                {paginatedSolicitacoes.map((solicitacao) => (
                  <SolicitacaoCard
                    key={solicitacao.id}
                    solicitacao={solicitacao}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onViewHistorico={handleViewHistorico} // Nova prop
                    handleStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            ) : (
              <SolicitacaoTable
                solicitacoes={paginatedSolicitacoes}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewHistorico={handleViewHistorico} // Nova prop
                handleStatusChange={handleStatusChange}
              />
            )}
            
            {/* Paginação */}
            {filteredSolicitacoes.length > 0 && (
              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  totalItems={filteredSolicitacoes.length}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={(newPageSize) => {
                    setPageSize(newPageSize);
                    setCurrentPage(1);
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Visualizar Solicitação - ATUALIZADO COM ANEXOS */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Detalhes da Solicitação
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setViewDialogOpen(false);
                  handleViewHistorico(selectedSolicitacao!);
                }}
                className="gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Histórico
              </Button>
            </DialogTitle>
          </DialogHeader>
          {selectedSolicitacao && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID da Solicitação</p>
                  <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{selectedSolicitacao.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Imóvel</p>
                  <p className="text-sm">{selectedSolicitacao.imovelId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tipo de Manutenção</p>
                  <p className="text-sm">{selectedSolicitacao.tipoManutencao}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Solicitante</p>
                  <p className="text-sm">{selectedSolicitacao.nome}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Telefone</p>
                  <p className="text-sm">{selectedSolicitacao.telefone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Endereço</p>
                  <p className="text-sm">{selectedSolicitacao.endereco}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cidade</p>
                  <p className="text-sm">{selectedSolicitacao.cidade}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <p className="text-sm capitalize">{selectedSolicitacao.status}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Data Solicitação</p>
                  <p className="text-sm">{selectedSolicitacao.dataSolicitacao.toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Prazo Final</p>
                  <p className="text-sm">{selectedSolicitacao.prazoFinal.toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              
              {selectedSolicitacao.descricao && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Descrição</p>
                  <div className="p-3 bg-muted rounded-lg max-h-32 overflow-y-auto">
                    <p className="text-sm">{selectedSolicitacao.descricao}</p>
                  </div>
                </div>
              )}
              
              {/* Seção de Anexos */}
              {selectedSolicitacao.anexos && selectedSolicitacao.anexos.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <Paperclip className="h-4 w-4" />
                    Anexos ({selectedSolicitacao.anexos.length})
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedSolicitacao.anexos.map((anexo, index) => (
                      <div key={index} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                          {anexo.mimetype?.startsWith('image/') ? (
                            <div className="h-8 w-8 bg-blue-100 rounded flex items-center justify-center">
                              <Eye className="h-4 w-4 text-blue-600" />
                            </div>
                          ) : (
                            <div className="h-8 w-8 bg-gray-100 rounded flex items-center justify-center">
                              <Paperclip className="h-4 w-4 text-gray-600" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{anexo.originalName}</p>
                            <p className="text-xs text-muted-foreground">
                              {anexo.size ? `${(anexo.size / 1024).toFixed(1)} KB` : 'N/A'}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full h-7 text-xs"
                          onClick={() => window.open(anexo.url, '_blank')}
                        >
                          Visualizar
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Histórico e Comentários - CORRIGIDO */}
      <Dialog open={historicoDialogOpen} onOpenChange={setHistoricoDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Histórico e Comentários - {selectedSolicitacao?.id}
            </DialogTitle>
          </DialogHeader>
          {selectedSolicitacao && (
            <div className="space-y-4 overflow-hidden">
              {/* Resumo da Solicitação */}
              <div className="p-4 bg-muted rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-muted-foreground">Imóvel:</span>
                    <p>{selectedSolicitacao.imovelId}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Tipo:</span>
                    <p>{selectedSolicitacao.tipoManutencao}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Solicitante:</span>
                    <p>{selectedSolicitacao.nome}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Status:</span>
                    <p className="capitalize">{selectedSolicitacao.status}</p>
                  </div>
                </div>
              </div>
              
              {/* Componente de Histórico */}
              <div className="flex-1 overflow-hidden">
                <SolicitacaoHistorico
                  solicitacaoId={selectedSolicitacao.id}
                  comentarios={comentarios}
                  historico={historico}
                  onAddComentario={addComentario}
                  loading={comentariosLoading}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Editar Solicitação */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Solicitação</DialogTitle>
          </DialogHeader>
          {selectedSolicitacao && (
            <EditSolicitacaoForm
              solicitacao={selectedSolicitacao}
              onCancel={() => setEditDialogOpen(false)}
              onSave={handleEditSave}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Excluir Solicitação */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir Solicitação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Deseja realmente excluir esta solicitação? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                type="button" 
                variant="destructive" 
                onClick={confirmDelete}
                disabled={loading}
              >
                {loading ? 'Excluindo...' : 'Excluir'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Solicitacoes;