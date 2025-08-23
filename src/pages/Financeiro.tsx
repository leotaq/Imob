import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockOrcamentos } from '@/data/mockData';
import { 
  DollarSign, 
  TrendingUp, 
  Download, 
  BarChart3, 
  PieChart,
  Calendar
} from 'lucide-react';

const Financeiro = () => {
  // Cálculos financeiros
  const totalMaoDeObra = mockOrcamentos.reduce((acc, orc) => acc + orc.maoDeObra, 0);
  const totalMateriais = mockOrcamentos.reduce((acc, orc) => acc + orc.materiais, 0);
  const totalTaxaAdm = mockOrcamentos.reduce((acc, orc) => 
    acc + (orc.maoDeObra + orc.materiais) * (orc.taxaAdm / 100), 0
  );
  const totalGeral = mockOrcamentos.reduce((acc, orc) => acc + orc.total, 0);

  const despesasPorTipo = [
    { tipo: 'Elétrica', valor: 353, percentual: 60.5 },
    { tipo: 'Hidráulica', valor: 230, percentual: 39.5 },
    { tipo: 'Pintura', valor: 0, percentual: 0 }
  ];

  const resumoMensal = [
    { mes: 'Janeiro', valor: 583, crescimento: 12.5 },
    { mes: 'Dezembro', valor: 450, crescimento: -5.2 },
    { mes: 'Novembro', valor: 380, crescimento: 8.1 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Financeiro</h1>
          <p className="text-muted-foreground mt-1">
            Relatórios e controle financeiro das manutenções
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar Excel
          </Button>
          <Button className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Gerar Relatório
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Mão de Obra
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              R$ {totalMaoDeObra.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {((totalMaoDeObra / totalGeral) * 100).toFixed(1)}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Materiais
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              R$ {totalMateriais.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {((totalMateriais / totalGeral) * 100).toFixed(1)}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa Administrativa
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              R$ {totalTaxaAdm.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {((totalTaxaAdm / totalGeral) * 100).toFixed(1)}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Geral
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              R$ {totalGeral.toFixed(2)}
            </div>
            <p className="text-xs text-success">
              +12.5% desde último mês
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Despesas por Tipo de Manutenção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {despesasPorTipo.map((item) => (
                <div key={item.tipo} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-foreground">{item.tipo}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {item.percentual.toFixed(1)}%
                      </Badge>
                      <span className="text-sm font-bold text-foreground">
                        R$ {item.valor.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${item.percentual}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Resumo Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {resumoMensal.map((mes) => (
                <div
                  key={mes.mes}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{mes.mes}</p>
                    <p className="text-xs text-muted-foreground">
                      {mes.crescimento > 0 ? '+' : ''}{mes.crescimento.toFixed(1)}% vs mês anterior
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">
                      R$ {mes.valor.toFixed(2)}
                    </p>
                    <Badge 
                      variant={mes.crescimento > 0 ? 'success' : 'destructive'}
                      className="text-xs"
                    >
                      {mes.crescimento > 0 ? '↗' : '↘'} {Math.abs(mes.crescimento).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Despesas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockOrcamentos.map((orcamento) => (
              <div
                key={orcamento.id}
                className="flex items-center justify-between p-3 border border-border rounded-lg"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    {orcamento.prestador.nome}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {orcamento.dataOrcamento.toLocaleDateString('pt-BR')} • 
                    Mão de obra: R$ {orcamento.maoDeObra.toFixed(2)} • 
                    Materiais: R$ {orcamento.materiais.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">
                    R$ {orcamento.total.toFixed(2)}
                  </p>
                  {orcamento.isPrincipal && (
                    <Badge variant="success" className="text-xs">
                      Aprovado
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Financeiro;