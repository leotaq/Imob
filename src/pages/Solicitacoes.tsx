import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { mockSolicitacoes } from '@/data/mockData';
import { Plus, Search, Eye, Edit, Trash2, Calendar } from 'lucide-react';
import { Solicitacao } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'aberta': return 'warning';
    case 'orcamento': return 'secondary';
    case 'aprovada': return 'primary';
    case 'execucao': return 'primary';
    case 'concluida': return 'success';
    case 'cancelada': return 'destructive';
    default: return 'secondary';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'aberta': return 'Aberta';
    case 'orcamento': return 'Orçamento';
    case 'aprovada': return 'Aprovada';
    case 'execucao': return 'Em Execução';
    case 'concluida': return 'Concluída';
    case 'cancelada': return 'Cancelada';
    default: return status;
  }
};

const getTipoSolicitanteLabel = (tipo: string) => {
  switch (tipo) {
    case 'inquilino': return 'Inquilino';
    case 'proprietario': return 'Proprietário';
    case 'imobiliaria': return 'Imobiliária';
    case 'terceiros': return 'Terceiros';
    default: return tipo;
  }
};

const solicitacaoSchema = z.object({
  imovelId: z.string().min(1, 'ID do imóvel é obrigatório'),
  tipoSolicitante: z.enum(['inquilino', 'proprietario', 'imobiliaria', 'terceiros']),
  nome: z.string().min(1, 'Nome é obrigatório'),
  telefone: z.string().min(1, 'Telefone é obrigatório'),
  endereco: z.string().min(1, 'Endereço é obrigatório'),
  tipoManutencao: z.string().min(1, 'Tipo de manutenção é obrigatório'),
  prazoFinal: z.string().min(1, 'Prazo final é obrigatório'),
  descricao: z.string().optional(),
});

type SolicitacaoFormData = z.infer<typeof solicitacaoSchema>;

const Solicitacoes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>(mockSolicitacoes);
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
      tipoManutencao: '',
      prazoFinal: '',
      descricao: '',
    },
  });

  const filteredSolicitacoes = solicitacoes.filter(
    (solicitacao) =>
      solicitacao.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      solicitacao.tipoManutencao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      solicitacao.endereco.toLowerCase().includes(searchTerm.toLowerCase()) ||
      solicitacao.imovelId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onSubmit = (data: SolicitacaoFormData) => {
    const novaSolicitacao: Solicitacao = {
      id: Date.now().toString(),
      imovelId: data.imovelId,
      tipoSolicitante: data.tipoSolicitante,
      nome: data.nome,
      telefone: data.telefone,
      endereco: data.endereco,
      tipoManutencao: data.tipoManutencao,
      dataSolicitacao: new Date(),
      prazoFinal: new Date(data.prazoFinal),
      descricao: data.descricao || '',
      status: 'aberta',
    };

    setSolicitacoes([...solicitacoes, novaSolicitacao]);
    toast({
      title: 'Solicitação criada com sucesso!',
      description: `Solicitação para ${data.tipoManutencao} foi criada.`,
    });
    form.reset();
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Solicitações</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie todas as solicitações de manutenção
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
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                  <Button type="submit">
                    Criar Solicitação
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, tipo ou endereço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Solicitações List */}
      <div className="space-y-4">
        {filteredSolicitacoes.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Nenhuma solicitação encontrada.</p>
            </CardContent>
          </Card>
        ) : (
          filteredSolicitacoes.map((solicitacao) => (
            <Card key={solicitacao.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-3">
                      {solicitacao.tipoManutencao}
                      <Badge variant={getStatusColor(solicitacao.status) as any}>
                        {getStatusLabel(solicitacao.status)}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Imóvel: {solicitacao.imovelId} • {getTipoSolicitanteLabel(solicitacao.tipoSolicitante)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">Solicitante</p>
                    <p className="text-sm text-muted-foreground">{solicitacao.nome}</p>
                    <p className="text-xs text-muted-foreground">{solicitacao.telefone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Endereço</p>
                    <p className="text-sm text-muted-foreground">{solicitacao.endereco}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Data Solicitação</p>
                    <p className="text-sm text-muted-foreground">
                      {solicitacao.dataSolicitacao.toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Prazo Final</p>
                    <p className="text-sm text-muted-foreground">
                      {solicitacao.prazoFinal.toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                {solicitacao.descricao && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm text-foreground">{solicitacao.descricao}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Solicitacoes;