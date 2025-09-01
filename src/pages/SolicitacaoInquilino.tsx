import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSolicitacoes } from '@/hooks/useSolicitacoes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FileUpload } from '@/components/FileUpload';
import { 
  Plus, 
  Trash2, 
  Calendar as CalendarIcon, 
  Home,
  Wrench,
  Clock,
  AlertTriangle,
  CheckCircle,
  FileText,
  Camera,
  History,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import type { ServicoSolicitado, TipoServico } from '@/types';

const SolicitacaoInquilino = () => {
  const { usuario, token } = useAuth();
  const { solicitacoes } = useSolicitacoes();
  const navigate = useNavigate();
  const [servicos, setServicos] = useState<ServicoSolicitado[]>([]);
  const [mostrarHistorico, setMostrarHistorico] = useState(false);
  
  // Estados para tipos de serviço
  const [tiposServico, setTiposServico] = useState<TipoServico[]>([]);
  const [carregandoTipos, setCarregandoTipos] = useState(true);
  const [prazoDesejado, setPrazoDesejado] = useState<Date>();
  const [observacoesGerais, setObservacoesGerais] = useState('');
  const [anexos, setAnexos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados para informações do solicitante
  const [nomeSolicitante, setNomeSolicitante] = useState(usuario?.nome || '');
  const [contatoSolicitante, setContatoSolicitante] = useState(usuario?.email || '');
  const [telefoneSolicitante, setTelefoneSolicitante] = useState('');
  const [tipoSolicitante, setTipoSolicitante] = useState('inquilino');
  
  // Estados para informações do imóvel
  const [endereco, setEndereco] = useState({
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    cep: '',
    estado: ''
  });
  const [tipoImovel, setTipoImovel] = useState('');
  const [area, setArea] = useState('');
  const [quartos, setQuartos] = useState('');
  const [banheiros, setBanheiros] = useState('');
  const [andar, setAndar] = useState('');
  const [temElevador, setTemElevador] = useState('');
  const [observacoesImovel, setObservacoesImovel] = useState('');

  // Função para formatar telefone
   const formatarTelefone = (valor: string) => {
     // Remove todos os caracteres não numéricos
     const apenasNumeros = valor.replace(/\D/g, '');
     
     // Aplica a formatação baseada no tamanho
     if (apenasNumeros.length <= 2) {
       return `(${apenasNumeros}`;
     } else if (apenasNumeros.length <= 7) {
       return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2)}`;
     } else if (apenasNumeros.length <= 11) {
       return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 7)}-${apenasNumeros.slice(7)}`;
     } else {
       // Limita a 11 dígitos
       return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 7)}-${apenasNumeros.slice(7, 11)}`;
     }
   };

   // Função para lidar com mudança no telefone
   const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const valorFormatado = formatarTelefone(e.target.value);
     setTelefoneSolicitante(valorFormatado);
   };

   // useEffect para carregar tipos de serviço
   useEffect(() => {
     const carregarTiposServico = async () => {
       if (!token) {
         console.error('Token não disponível');
         setCarregandoTipos(false);
         return;
       }
       
       try {
         const { apiGet } = await import('@/lib/api');
         const data = await apiGet('/api/tipos-servico');
         setTiposServico(data.tiposServico || []);

       } catch (error) {
         console.error('Erro ao carregar tipos de serviço:', error);
       } finally {
         setCarregandoTipos(false);
       }
     };
 
     carregarTiposServico();
   }, [token]);

  // Função para adicionar novo serviço
  const adicionarServico = () => {
    const novoServico: ServicoSolicitado = {
      id: Date.now().toString(),
      tipoServicoId: '',
      descricao: '',
      prioridade: 'media',
      observacoes: ''
    };
    setServicos(prev => [...prev, novoServico]);
  };

  // Função para remover serviço
  const removerServico = (id: string) => {
    setServicos(prev => prev.filter(s => s.id !== id));
  };

  // Função para atualizar serviço
  const atualizarServico = (id: string, campo: keyof ServicoSolicitado, valor: any) => {
    setServicos(prev => prev.map(s => 
      s.id === id ? { ...s, [campo]: valor } : s
    ));
  };

  // Função para obter ícone da categoria
  const getIconeCategoria = (categoria: string) => {
    switch (categoria) {
      case 'eletrica': return '⚡';
      case 'hidraulica': return '🚰';
      case 'pintura': return '🎨';
      case 'limpeza': return '🧹';
      case 'jardinagem': return '🌱';
      default: return '🔧';
    }
  };

  // Função para obter cor da prioridade
  const getCorPrioridade = (prioridade: string) => {
    switch (prioridade) {
      case 'baixa': return 'bg-green-100 text-green-800';
      case 'media': return 'bg-yellow-100 text-yellow-800';
      case 'alta': return 'bg-orange-100 text-orange-800';
      case 'urgente': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Função para enviar solicitação
  const enviarSolicitacao = async () => {
    if (servicos.length === 0) {
      alert('Adicione pelo menos um serviço à sua solicitação.');
      return;
    }

    const servicosIncompletos = servicos.filter(s => !s.tipoServicoId || !s.descricao);
    if (servicosIncompletos.length > 0) {
      alert('Preencha todos os campos obrigatórios dos serviços.');
      return;
    }

    // Validar campos obrigatórios do solicitante
    if (!nomeSolicitante || !contatoSolicitante) {
      alert('Preencha o nome e contato do solicitante.');
      return;
    }

    // Validar campos obrigatórios do imóvel
    if (!endereco.rua || !endereco.numero || !endereco.bairro || !endereco.cidade || !endereco.cep || !tipoImovel) {
      alert('Preencha todos os campos obrigatórios do imóvel.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const novaSolicitacao = {
        solicitante: {
          nome: nomeSolicitante,
          email: contatoSolicitante,
          telefone: telefoneSolicitante.replace(/\D/g, ''), // Remove formatação
          tipo: tipoSolicitante
        },
        imovel: {
          endereco: {
            rua: endereco.rua,
            numero: endereco.numero,
            complemento: endereco.complemento,
            bairro: endereco.bairro,
            cidade: endereco.cidade,
            cep: endereco.cep,
            estado: endereco.estado
          },
          tipo: tipoImovel,
          area: area ? parseFloat(area) : null,
          quartos: quartos ? parseInt(quartos) : null,
          banheiros: banheiros ? parseInt(banheiros) : null,
          andar: andar ? parseInt(andar) : null,
          temElevador: temElevador === 'sim',
          observacoes: observacoesImovel
        },
        servicos,
        prazoDesejado: prazoDesejado || null,
        observacoesGerais,
        anexos: anexos.map(file => ({
          filename: file.name,
          originalName: file.name,
          mimetype: file.type,
          size: file.size,
          url: '' // URL seria gerada após upload
        }))
      };

      const token = localStorage.getItem('token');
      if (!token) {
        alert('Você precisa estar logado para enviar uma solicitação.');
        return;
      }

      const { apiPost } = await import('@/lib/api');
      const result = await apiPost('/api/solicitacoes', novaSolicitacao);
      console.log('Solicitação criada:', result.solicitacao);
      
      alert('Solicitação enviada com sucesso!');
      
      // Limpar formulário
      setServicos([]);
      setPrazoDesejado(undefined);
      setObservacoesGerais('');
      setAnexos([]);
      
      // Limpar dados do solicitante
      setNomeSolicitante('');
      setContatoSolicitante('');
      setTelefoneSolicitante('');
      setTipoSolicitante('inquilino');
      
      // Limpar dados do imóvel
      setEndereco({
        rua: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        cep: '',
        estado: ''
      });
      setTipoImovel('');
      setArea('');
      setQuartos('');
      setBanheiros('');
      setAndar('');
      setTemElevador('');
      setObservacoesImovel('');
      
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      alert(`Erro ao enviar solicitação: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtrar solicitações do usuário logado
  const minhasSolicitacoes = solicitacoes.filter(sol => sol.usuarioId === usuario?.id);

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Cabeçalho */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Home className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">
            {mostrarHistorico ? 'Histórico de Solicitações' : 'Nova Solicitação'}
          </h1>
        </div>
        <p className="text-muted-foreground">
          {mostrarHistorico 
            ? 'Visualize suas solicitações anteriores e acompanhe o status'
            : 'Descreva os serviços que você precisa e nossa equipe cuidará do resto'
          }
        </p>
        
        {/* Botões de navegação */}
        <div className="flex justify-center gap-4 mt-4">
          <Button 
            variant={!mostrarHistorico ? "default" : "outline"}
            onClick={() => setMostrarHistorico(false)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nova Solicitação
          </Button>
          <Button 
            variant={mostrarHistorico ? "default" : "outline"}
            onClick={() => setMostrarHistorico(true)}
            className="flex items-center gap-2"
          >
            <History className="h-4 w-4" />
            Histórico ({minhasSolicitacoes.length})
          </Button>
        </div>
      </div>

      {/* Seção de Histórico */}
      {mostrarHistorico && (
        <div className="space-y-4">
          {!usuario || !token ? (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Login necessário</h3>
                <p className="text-muted-foreground mb-4">
                  Você precisa estar logado para visualizar o histórico de solicitações.
                </p>
                <Button 
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Fazer Login
                </Button>
              </CardContent>
            </Card>
          ) : minhasSolicitacoes.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma solicitação encontrada</h3>
                <p className="text-muted-foreground mb-4">
                  Você ainda não fez nenhuma solicitação de serviço.
                </p>
                <Button 
                  onClick={() => setMostrarHistorico(false)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Fazer primeira solicitação
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {minhasSolicitacoes.map((solicitacao) => (
                <Card key={solicitacao.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Wrench className="h-5 w-5" />
                          {solicitacao.tipoManutencao || 'Serviço Geral'}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Solicitado em {format(new Date(solicitacao.dataSolicitacao), 'dd/MM/yyyy', { locale: ptBR })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={solicitacao.status === 'concluida' ? 'default' : 
                                  solicitacao.status === 'execucao' ? 'secondary' : 
                                  solicitacao.status === 'orcamento' ? 'outline' : 'destructive'}
                        >
                          {solicitacao.status === 'pendente' ? 'Pendente' :
                           solicitacao.status === 'orcamento' ? 'Orçamento' :
                           solicitacao.status === 'execucao' ? 'Em Execução' :
                           solicitacao.status === 'concluida' ? 'Concluída' :
                           solicitacao.status === 'cancelada' ? 'Cancelada' : 'Aberta'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-muted-foreground">Endereço:</p>
                          <p>{solicitacao.endereco}</p>
                        </div>
                        <div>
                          <p className="font-medium text-muted-foreground">Cidade:</p>
                          <p>{solicitacao.cidade}</p>
                        </div>
                      </div>
                      
                      {solicitacao.descricao && (
                        <div>
                          <p className="font-medium text-muted-foreground text-sm">Descrição:</p>
                          <p className="text-sm">{solicitacao.descricao}</p>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center pt-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          Prazo: {format(new Date(solicitacao.prazoFinal), 'dd/MM/yyyy', { locale: ptBR })}
                        </div>
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          Ver detalhes
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Formulário de Nova Solicitação */}
      {!mostrarHistorico && (
        <div className="space-y-6">
          {/* Informações do Solicitante */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Informações do Solicitante
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nome Completo *</Label>
                <Input 
                  value={nomeSolicitante}
                  onChange={(e) => setNomeSolicitante(e.target.value)}
                  placeholder="Digite seu nome completo"
                />
              </div>
              <div>
                <Label>E-mail *</Label>
                <Input 
                  type="email"
                  value={contatoSolicitante}
                  onChange={(e) => setContatoSolicitante(e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Telefone</Label>
                <Input 
                  type="tel"
                  value={telefoneSolicitante}
                  onChange={handleTelefoneChange}
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                />
              </div>
              <div>
                <Label>Tipo de Solicitante *</Label>
                <Select value={tipoSolicitante} onValueChange={setTipoSolicitante}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inquilino">Inquilino</SelectItem>
                    <SelectItem value="proprietario">Proprietário</SelectItem>
                    <SelectItem value="imobiliaria">Imobiliária</SelectItem>
                    <SelectItem value="terceiros">Terceiros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            </CardContent>
          </Card>

          {/* Informações do Imóvel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Informações do Imóvel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
          {/* Endereço */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-gray-700">Endereço</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label>Rua/Avenida *</Label>
                <Input
                  value={endereco.rua}
                  onChange={(e) => setEndereco({...endereco, rua: e.target.value})}
                  placeholder="Ex: Rua das Flores"
                />
              </div>
              <div>
                <Label>Número *</Label>
                <Input 
                  value={endereco.numero}
                  onChange={(e) => setEndereco({...endereco, numero: e.target.value})}
                  placeholder="123"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Complemento</Label>
                <Input 
                  value={endereco.complemento}
                  onChange={(e) => setEndereco({...endereco, complemento: e.target.value})}
                  placeholder="Apto 45, Bloco B"
                />
              </div>
              <div>
                <Label>Bairro *</Label>
                <Input 
                  value={endereco.bairro}
                  onChange={(e) => setEndereco({...endereco, bairro: e.target.value})}
                  placeholder="Centro"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Cidade *</Label>
                <Input 
                  value={endereco.cidade}
                  onChange={(e) => setEndereco({...endereco, cidade: e.target.value})}
                  placeholder="São Paulo"
                />
              </div>
              <div>
                <Label>CEP *</Label>
                <Input 
                  value={endereco.cep}
                  onChange={(e) => setEndereco({...endereco, cep: e.target.value})}
                  placeholder="01234-567"
                />
              </div>
              <div>
                <Label>Estado</Label>
                <Input 
                  value={endereco.estado}
                  onChange={(e) => setEndereco({...endereco, estado: e.target.value})}
                  placeholder="SP"
                />
              </div>
            </div>
          </div>

              {/* Características */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-gray-700">Características</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Tipo de Imóvel *</Label>
                <select 
                  value={tipoImovel}
                  onChange={(e) => setTipoImovel(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione o tipo</option>
                  <option value="apartamento">Apartamento</option>
                  <option value="casa">Casa</option>
                  <option value="sobrado">Sobrado</option>
                  <option value="kitnet">Kitnet</option>
                  <option value="loft">Loft</option>
                  <option value="comercial">Comercial</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
              <div>
                <Label>Área (m²)</Label>
                <Input 
                  type="number"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="80"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Quartos</Label>
                <Input 
                  type="number"
                  value={quartos}
                  onChange={(e) => setQuartos(e.target.value)}
                  placeholder="2"
                />
              </div>
              <div>
                <Label>Banheiros</Label>
                <Input 
                  type="number"
                  value={banheiros}
                  onChange={(e) => setBanheiros(e.target.value)}
                  placeholder="1"
                />
              </div>
              <div>
                <Label>Andar</Label>
                <Input 
                  type="number"
                  value={andar}
                  onChange={(e) => setAndar(e.target.value)}
                  placeholder="5"
                />
              </div>
              <div>
                <Label>Tem Elevador?</Label>
                <select 
                  value={temElevador}
                  onChange={(e) => setTemElevador(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione</option>
                  <option value="sim">Sim</option>
                  <option value="nao">Não</option>
                </select>
              </div>
            </div>
            <div>
              <Label>Observações sobre o Imóvel</Label>
              <Textarea 
                value={observacoesImovel}
                onChange={(e) => setObservacoesImovel(e.target.value)}
                placeholder="Informações adicionais sobre o imóvel que podem ser relevantes para o serviço..."
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Serviços Solicitados */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Serviços Necessários
            </CardTitle>
            <Button onClick={adicionarServico} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Serviço
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {servicos.map((servico, index) => {
              const tipoSelecionado = tiposServico.find(t => t.id === servico.tipoServicoId);
              return (
                <div key={servico.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium flex items-center gap-2">
                      <span className="text-lg">
                        {tipoSelecionado ? getIconeCategoria(tipoSelecionado.categoria) : '🔧'}
                      </span>
                      Serviço {index + 1}
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removerServico(servico.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Tipo de Serviço *</Label>
                      <Select 
                        value={servico.tipoServicoId} 
                        onValueChange={(value) => atualizarServico(servico.id, 'tipoServicoId', value)}
                        disabled={carregandoTipos}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={carregandoTipos ? "Carregando..." : "Selecione o tipo de serviço"} />
                        </SelectTrigger>
                        <SelectContent>
                          {tiposServico.map((tipo) => (
                            <SelectItem key={tipo.id} value={tipo.id}>
                              <div className="flex items-center gap-2">
                                <span>{getIconeCategoria(tipo.categoria)}</span>
                                {tipo.nome}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Prioridade</Label>
                      <Select 
                        value={servico.prioridade} 
                        onValueChange={(value) => atualizarServico(servico.id, 'prioridade', value as any)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baixa">Baixa</SelectItem>
                          <SelectItem value="media">Média</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                          <SelectItem value="urgente">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Descrição do Problema *</Label>
                    <Textarea
                      value={servico.descricao}
                      onChange={(e) => atualizarServico(servico.id, 'descricao', e.target.value)}
                      placeholder="Descreva detalhadamente o problema ou serviço necessário..."
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label>Observações Adicionais</Label>
                    <Textarea
                      value={servico.observacoes || ''}
                      onChange={(e) => atualizarServico(servico.id, 'observacoes', e.target.value)}
                      placeholder="Informações extras que podem ajudar o prestador..."
                      rows={2}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Badge className={getCorPrioridade(servico.prioridade)}>
                      {servico.prioridade === 'urgente' && <AlertTriangle className="h-3 w-3 mr-1" />}
                      Prioridade: {servico.prioridade.charAt(0).toUpperCase() + servico.prioridade.slice(1)}
                    </Badge>
                  </div>
                </div>
              );
            })}
            
            {servicos.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum serviço adicionado ainda.</p>
                <p className="text-sm">Clique em "Adicionar Serviço" para começar.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Prazo e Observações Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Prazo Desejado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Prazo Desejado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label>Data Limite (Opcional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {prazoDesejado ? (
                      format(prazoDesejado, 'dd/MM/yyyy', { locale: ptBR })
                    ) : (
                      <span>Selecionar data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={prazoDesejado}
                    onSelect={setPrazoDesejado}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground mt-1">
                Quando você gostaria que o serviço fosse concluído?
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Anexos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Fotos e Documentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FileUpload
              onFileSelect={setAnexos}
              maxFiles={5}
              acceptedTypes={['image/*', '.pdf', '.doc', '.docx']}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Adicione fotos do problema ou documentos relevantes (máx. 5 arquivos)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Observações Gerais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Observações Gerais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={observacoesGerais}
            onChange={(e) => setObservacoesGerais(e.target.value)}
            placeholder="Informações adicionais sobre a solicitação, horários preferenciais para visita, etc..."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Resumo e Envio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Resumo da Solicitação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-primary">{servicos.length}</p>
                <p className="text-muted-foreground">Serviços</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-primary">
                  {servicos.filter(s => s.prioridade === 'urgente' || s.prioridade === 'alta').length}
                </p>
                <p className="text-muted-foreground">Alta Prioridade</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-primary">{anexos.length}</p>
                <p className="text-muted-foreground">Anexos</p>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button 
                onClick={enviarSolicitacao} 
                disabled={isSubmitting || servicos.length === 0}
                size="lg"
                className="w-full md:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Enviar Solicitação
                  </>
                )}
              </Button>
            </div>
          </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SolicitacaoInquilino;