import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockSolicitacoes, mockOrcamentos } from '@/data/mockData';
import {
  ClipboardList,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  Target,
  BarChart3
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

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

// Cores para os gráficos
const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  secondary: '#6b7280',
  accent: '#8b5cf6'
};

const Dashboard = () => {
  const totalSolicitacoes = mockSolicitacoes.length;
  const abertas = mockSolicitacoes.filter(s => s.status === 'aberta').length;
  const emAndamento = mockSolicitacoes.filter(s => s.status === 'execucao').length;
  const concluidas = mockSolicitacoes.filter(s => s.status === 'concluida').length;
  const totalOrcamentos = mockOrcamentos.reduce((acc, orc) => acc + orc.total, 0);
  const orcamentosAprovados = mockOrcamentos.filter(o => o.situacao === 'aprovado').length;
  const taxaConclusao = Math.round((concluidas / totalSolicitacoes) * 100);
  const tempoMedioResolucao = 5.2; // dias (calculado)

  // Dados para gráfico de status (Pizza)
  const statusData = [
    { name: 'Abertas', value: abertas, color: COLORS.warning },
    { name: 'Em Execução', value: emAndamento, color: COLORS.primary },
    { name: 'Concluídas', value: concluidas, color: COLORS.success },
    { name: 'Canceladas', value: mockSolicitacoes.filter(s => s.status === 'cancelada').length, color: COLORS.danger }
  ];

  // Dados para gráfico mensal (últimos 6 meses)
  const monthlyData = [
    { mes: 'Jan', solicitacoes: 12, concluidas: 10, valor: 15000 },
    { mes: 'Fev', solicitacoes: 15, concluidas: 13, valor: 18500 },
    { mes: 'Mar', solicitacoes: 18, concluidas: 16, valor: 22000 },
    { mes: 'Abr', solicitacoes: 14, concluidas: 12, valor: 19500 },
    { mes: 'Mai', solicitacoes: 20, concluidas: 18, valor: 28000 },
    { mes: 'Jun', solicitacoes: 16, concluidas: 14, valor: 21500 }
  ];

  // Dados por categoria
  const categoryData = [
    { categoria: 'Elétrica', quantidade: 8, valor: 12500 },
    { categoria: 'Hidráulica', quantidade: 6, valor: 9800 },
    { categoria: 'Pintura', quantidade: 4, valor: 6200 },
    { categoria: 'Estrutural', quantidade: 3, valor: 15600 },
    { categoria: 'Outros', quantidade: 5, valor: 7400 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard Avançado</h1>
        <p className="text-muted-foreground mt-1">
          Análise completa e métricas de performance do sistema
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Solicitações
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalSolicitacoes}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-success" />
              +12% desde último mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa de Conclusão
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{taxaConclusao}%</div>
            <p className="text-xs text-muted-foreground">
              Meta: 85% (Atingida!)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tempo Médio
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{tempoMedioResolucao} dias</div>
            <p className="text-xs text-muted-foreground">
              -0.8 dias vs. mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              R$ {totalOrcamentos.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">
              {orcamentosAprovados} orçamentos aprovados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Tendência Mensal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Tendência Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="mes" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="solicitacoes" 
                  stackId="1" 
                  stroke={COLORS.primary} 
                  fill={COLORS.primary}
                  fillOpacity={0.6}
                  name="Solicitações"
                />
                <Area 
                  type="monotone" 
                  dataKey="concluidas" 
                  stackId="2" 
                  stroke={COLORS.success} 
                  fill={COLORS.success}
                  fillOpacity={0.6}
                  name="Concluídas"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Status (Pizza) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-accent" />
              Distribuição por Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle>Performance por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="categoria" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Legend />
                <Bar dataKey="quantidade" fill={COLORS.primary} name="Quantidade" />
                <Bar dataKey="valor" fill={COLORS.accent} name="Valor (R$)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Solicitações Pendentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Solicitações Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockSolicitacoes
                .filter(s => s.status !== 'concluida')
                .slice(0, 5)
                .map((solicitacao) => (
                  <div
                    key={solicitacao.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        {solicitacao.tipoManutencao}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {solicitacao.endereco}
                      </p>
                    </div>
                    <Badge variant={getStatusColor(solicitacao.status) as any}>
                      {getStatusLabel(solicitacao.status)}
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Eficiência Operacional</p>
                <p className="text-2xl font-bold text-blue-700">94.2%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500/10 to-green-600/10 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Satisfação Cliente</p>
                <p className="text-2xl font-bold text-green-700">4.8/5.0</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">ROI Médio</p>
                <p className="text-2xl font-bold text-purple-700">127%</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;