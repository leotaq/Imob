import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Solicitacao } from '@/types';
import { useSolicitacoes } from '@/hooks/useSolicitacoes';
import SolicitacaoFiltersComponent from '@/components/SolicitacaoFilters';
import SolicitacaoCard from '@/components/SolicitacaoCard';
import { useToast } from '@/hooks/use-toast';

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

const Solicitacoes = () => {
  const {
    solicitacoes,
    allSolicitacoes,
    loading,
    filters,
    setFilters,
    createSolicitacao,
    updateSolicitacao,
    deleteSolicitacao
  } = useSolicitacoes();

  const [selectedSolicitacao, setSelectedSolicitacao] = useState<Solicitacao | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

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
        await updateSolicitacao(selectedSolicitacao.id, updatedData);
        setEditDialogOpen(false);
        setSelectedSolicitacao(null);
      } catch (error) {
        // Error já tratado no hook
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Solicitações</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie todas as solicitações de manutenção com filtros avançados
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Solicitação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nova Solicitação de Manutenção</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                          className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Descreva o problema ou serviço necessário..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
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

      {/* Filtros Avançados */}
      <SolicitacaoFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        totalCount={allSolicitacoes.length}
        filteredCount={solicitacoes.length}
      />

      {/* Lista de Solicitações */}
      <div className="space-y-4">
        {loading && (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Carregando...</p>
            </CardContent>
          </Card>
        )}
        
        {!loading && solicitacoes.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                {allSolicitacoes.length === 0 
                  ? 'Nenhuma solicitação encontrada. Crie a primeira!' 
                  : 'Nenhuma solicitação corresponde aos filtros aplicados.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          solicitacoes.map((solicitacao) => (
            <SolicitacaoCard
              key={solicitacao.id}
              solicitacao={solicitacao}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Modal Visualizar Solicitação */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes da Solicitação</DialogTitle>
          </DialogHeader>
          {selectedSolicitacao && (
            <div className="space-y-3">
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
                  <p className="text-sm">{selectedSolicitacao.status}</p>
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
                  <div className="p-2 bg-muted rounded-lg max-h-20 overflow-y-auto">
                    <p className="text-sm">{selectedSolicitacao.descricao}</p>
                  </div>
                </div>
              )}
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