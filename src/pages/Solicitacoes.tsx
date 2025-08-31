import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, CalendarDays, Clock, Eye, Edit, Trash2, Plus, Search, Download, Grid, List, Filter, FileText, Phone, MapPin, User, Building, Wrench, AlertCircle, Paperclip } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Solicitacao, Prestador } from '@/types';
import { useSolicitacoes } from '@/hooks/useSolicitacoes';
import { useComentarios } from '@/hooks/useComentarios';
import SolicitacaoFiltersComponent from '@/components/SolicitacaoFilters';
import SolicitacaoTable from '@/components/SolicitacaoTable';
import SolicitacaoCard from '@/components/SolicitacaoCard';
import { ExportDialog } from '@/components/ExportDialog';
import { FileUpload } from '@/components/FileUpload';
import Pagination from '@/components/Pagination';
import SolicitacaoHistorico from '@/components/SolicitacaoHistorico';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useViewMode } from '@/hooks/useViewMode';

const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Componente para editar solicitação
function EditSolicitacaoForm({ solicitacao, onCancel, onSave }) {
  const [form, setForm] = React.useState({
    ...solicitacao
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      ...form,
      id: solicitacao.id
    });
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">ID do Imóvel</label>
          <input
            type="text"
            name="imovelId"
            className="w-full border rounded px-2 py-1"
            value={form.imovelId}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tipo de Solicitante</label>
          <select name="tipoSolicitante" className="w-full border rounded px-2 py-1" value={form.tipoSolicitante} onChange={handleChange} required>
            <option value="inquilino">Inquilino</option>
            <option value="proprietario">Proprietário</option>
            <option value="imobiliaria">Imobiliária</option>
            <option value="terceiros">Terceiros</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Nome</label>
          <input type="text" name="nome" className="w-full border rounded px-2 py-1" value={form.nome} onChange={handleChange} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Telefone</label>
          <input type="text" name="telefone" className="w-full border rounded px-2 py-1" value={form.telefone} onChange={handleChange} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Endereço</label>
          <input type="text" name="endereco" className="w-full border rounded px-2 py-1" value={form.endereco} onChange={handleChange} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Cidade</label>
          <input type="text" name="cidade" className="w-full border rounded px-2 py-1" value={form.cidade} onChange={handleChange} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tipo de Manutenção</label>
          <input type="text" name="tipoManutencao" className="w-full border rounded px-2 py-1" value={form.tipoManutencao} onChange={handleChange} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select name="status" className="w-full border rounded px-2 py-1" value={form.status} onChange={handleChange} required>
            <option value="pendente">Pendente</option>
            <option value="orcamento">Orçamento</option>
            <option value="aprovada">Aprovada</option>
            <option value="execucao">Em Execução</option>
            <option value="concluida">Concluída</option>
            <option value="paga">Paga</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Descrição</label>
        <textarea name="descricao" className="w-full border rounded px-2 py-1 h-24" value={form.descricao} onChange={handleChange} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Salvar</Button>
      </div>
    </form>
  );
}

type SolicitacaoFormData = {
  imovelId: string;
  tipoSolicitante: string;
  nome: string;
  telefone: string;
  endereco: string;
  cidade: string;
  tipoManutencao: string;
  prazoFinal: string;
  descricao?: string;
};

const solicitacaoSchema = z.object({
  imovelId: z.string().min(1, 'ID do imóvel é obrigatório'),
  tipoSolicitante: z.string().min(1, 'Tipo de solicitante é obrigatório'),
  nome: z.string().min(1, 'Nome é obrigatório'),
  telefone: z.string().min(1, 'Telefone é obrigatório'),
  endereco: z.string().min(1, 'Endereço é obrigatório'),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  tipoManutencao: z.string().min(1, 'Tipo de manutenção é obrigatório'),
  prazoFinal: z.string().min(1, 'Prazo final é obrigatório'),
  descricao: z.string().optional(),
});

const Solicitacoes: React.FC = () => {
  const {
    solicitacoes,
    loading,
    createSolicitacao,
    updateSolicitacao,
    deleteSolicitacao,
    updateSolicitacaoStatus
  } = useSolicitacoes();

  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<Solicitacao | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [historicoDialogOpen, setHistoricoDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [filters, setFilters] = useState({
    status: '',
    tipoManutencao: '',
    prioridade: '',
    dataInicio: '',
    dataFim: ''
  });

  const { usuario } = useAuth();
  const { userViewMode } = useViewMode();

  const {
    comentarios,
    loading: comentariosLoading,
    addComentario
  } = useComentarios(selectedSolicitacao?.id || '');

  const filteredSolicitacoes = useMemo(() => {
    let solicitacoesFiltradas = [...solicitacoes];

    // Filtrar por modo de visualização
    if (usuario?.isMaster || usuario?.isAdmin) {
      if (userViewMode === 'manager') {
        // Gestor vê todas as solicitações
        solicitacoesFiltradas = solicitacoes;
      } else if (userViewMode === 'provider') {
        // Prestador vê apenas solicitações relevantes
        solicitacoesFiltradas = solicitacoes.filter(solicitacao =>
          ['pendente', 'orcamento'].includes(solicitacao.status)
        );
      } else {
        // Usuário vê apenas suas próprias solicitações
        solicitacoesFiltradas = solicitacoes.filter(solicitacao =>
          solicitacao.solicitanteId === usuario.id
        );
      }
    } else {
      // Usuários normais veem apenas suas próprias solicitações
      solicitacoesFiltradas = solicitacoes.filter(solicitacao =>
        solicitacao.solicitanteId === usuario?.id
      );
    }

    // Aplicar filtro de busca
    return solicitacoesFiltradas.filter(solicitacao =>
      solicitacao.imovelId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      solicitacao.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      solicitacao.tipoManutencao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      solicitacao.endereco.toLowerCase().includes(searchTerm.toLowerCase()) ||
      solicitacao.cidade.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [solicitacoes, searchTerm, usuario, userViewMode]);

  const paginatedSolicitacoes = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredSolicitacoes.slice(startIndex, startIndex + pageSize);
  }, [filteredSolicitacoes, currentPage, pageSize]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  const form = useForm<SolicitacaoFormData>({
    resolver: zodResolver(solicitacaoSchema),
    defaultValues: {
      imovelId: '',
      tipoSolicitante: '',
      nome: '',
      telefone: '',
      endereco: '',
      cidade: '',
      tipoManutencao: '',
      prazoFinal: '',
      descricao: ''
    }
  });

  const onSubmit = async (data: SolicitacaoFormData) => {
    try {
      setIsDialogOpen(false);
      await createSolicitacao({
        ...data,
        id: generateUniqueId(),
        status: 'pendente',
        dataCriacao: new Date().toISOString(),
        anexos: uploadedFiles
      });
    } catch (error) {
      console.error('Erro ao criar solicitação:', error);
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
        console.error('Erro ao excluir solicitação:', error);
      }
    }
  };

  const handleEditSave = async (updatedData: Partial<Solicitacao>) => {
    if (selectedSolicitacao) {
      try {
        const camposAlterados: string[] = [];
        
        Object.keys(updatedData).forEach(key => {
          if (updatedData[key] !== selectedSolicitacao[key]) {
            camposAlterados.push(key);
          }
        });

        await updateSolicitacao(selectedSolicitacao.id, updatedData);
        
        if (camposAlterados.length > 0) {
          await addComentario({
            texto: `Campos alterados: ${camposAlterados.join(', ')}`,
            tipo: 'sistema'
          });
        }
        
        setEditDialogOpen(false);
        setSelectedSolicitacao(null);
      } catch (error) {
        console.error('Erro ao atualizar solicitação:', error);
      }
    }
  };

  const handleStatusChange = async (solicitacao: Solicitacao, newStatus: string) => {
    try {
      await updateSolicitacaoStatus(solicitacao.id, newStatus);
      
      if (selectedSolicitacao?.id === solicitacao.id) {
        setSelectedSolicitacao({ ...selectedSolicitacao, status: newStatus });
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho com busca e alternância de visualização */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Solicitações</h1>
          <p className="text-muted-foreground mt-1">
            {userViewMode === 'manager'
              ? 'Gerencie todas as solicitações de manutenção do sistema'
              : userViewMode === 'provider'
              ? 'Visualize oportunidades de orçamento disponíveis'
              : 'Gerencie suas solicitações de manutenção'
            }
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Campo de busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar solicitações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>

          {/* Botão de exportar */}
          <ExportDialog solicitacoes={filteredSolicitacoes}>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </ExportDialog>

          {/* Alternância entre cards e tabela */}
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

          {/* Botão Nova Solicitação - condicional baseado no modo de visualização */}
          {userViewMode !== 'provider' && (
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
          )}
        </div>
      </div>

      {/* Filtros Avançados */}
      <SolicitacaoFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        totalCount={solicitacoes.length}
        filteredCount={filteredSolicitacoes.length}
      />

      {/* Lista de Solicitações */}
      <div className="space-y-4">
        {loading && (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando solicitações...</p>
            </CardContent>
          </Card>
        )}

        {!loading && paginatedSolicitacoes.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                {searchTerm
                  ? `Nenhuma solicitação encontrada para "${searchTerm}"`
                  : filteredSolicitacoes.length === 0
                  ? 'Nenhuma solicitação encontrada'
                  : 'Nenhuma solicitação na página atual'
                }
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
                    onStatusChange={handleStatusChange}
                    onViewHistorico={handleViewHistorico}
                  />
                ))}
              </div>
            ) : (
              <SolicitacaoTable
                solicitacoes={paginatedSolicitacoes}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                onViewHistorico={handleViewHistorico}
              />
            )}

            {filteredSolicitacoes.length > 0 && (
              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(filteredSolicitacoes.length / pageSize)}
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

      {/* Modal Visualizar Solicitação */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Detalhes da Solicitação
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setViewDialogOpen(false);
                  handleViewHistorico(selectedSolicitacao!);
                }}
                className="gap-2"
              >
                <Clock className="h-4 w-4" />
                Ver Histórico
              </Button>
            </DialogTitle>
          </DialogHeader>
          {selectedSolicitacao && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID da Solicitação</p>
                  <p className="font-medium">{selectedSolicitacao.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant={selectedSolicitacao.status === 'pendente' ? 'destructive' : 'default'}>
                    {selectedSolicitacao.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Imóvel</p>
                  <p className="font-medium">{selectedSolicitacao.imovelId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tipo de Manutenção</p>
                  <p className="font-medium">{selectedSolicitacao.tipoManutencao}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Solicitante</p>
                  <p className="font-medium">{selectedSolicitacao.nome}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Telefone</p>
                  <p className="font-medium">{selectedSolicitacao.telefone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Endereço</p>
                  <p className="font-medium">{selectedSolicitacao.endereco}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cidade</p>
                  <p className="font-medium">{selectedSolicitacao.cidade}</p>
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
                              <FileText className="h-4 w-4 text-blue-600" />
                            </div>
                          ) : (
                            <div className="h-8 w-8 bg-gray-100 rounded flex items-center justify-center">
                              <FileText className="h-4 w-4 text-gray-600" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{anexo.nome}</p>
                            <p className="text-xs text-muted-foreground">
                              {anexo.tamanho ? `${(anexo.tamanho / 1024).toFixed(1)} KB` : 'Tamanho desconhecido'}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            if (anexo.url) {
                              window.open(anexo.url, '_blank');
                            }
                          }}
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

      {/* Modal Histórico */}
      <Dialog open={historicoDialogOpen} onOpenChange={setHistoricoDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Histórico da Solicitação
            </DialogTitle>
          </DialogHeader>
          {selectedSolicitacao && (
            <div className="space-y-4 overflow-hidden">
              {/* Informações básicas */}
              <div className="p-4 bg-muted rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground">ID</p>
                    <p className="font-bold">{selectedSolicitacao.id}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Status</p>
                    <Badge variant={selectedSolicitacao.status === 'pendente' ? 'destructive' : 'default'}>
                      {selectedSolicitacao.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Imóvel</p>
                    <p className="font-bold">{selectedSolicitacao.imovelId}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Tipo</p>
                    <p className="font-bold">{selectedSolicitacao.tipoManutencao}</p>
                  </div>
                </div>
              </div>

              {/* Histórico de comentários */}
              <div className="flex-1 overflow-hidden">
                <SolicitacaoHistorico
                  solicitacaoId={selectedSolicitacao.id}
                  comentarios={comentarios}
                  historico={historico}
                  loading={comentariosLoading}
                  onAddComentario={addComentario}
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