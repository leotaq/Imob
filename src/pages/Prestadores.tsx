import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { mockPrestadores } from '@/data/mockData';
import { Plus, Search, Eye, Edit, Trash2, Phone, CreditCard, FileText } from 'lucide-react';
import { Prestador } from '@/types';

const getTipoPagamentoLabel = (tipo: string) => {
  switch (tipo) {
    case 'pix': return 'PIX';
    case 'transferencia': return 'Transferência';
    case 'dinheiro': return 'Dinheiro';
    case 'cartao': return 'Cartão';
    default: return tipo;
  }
};

const getTipoPagamentoColor = (tipo: string) => {
  switch (tipo) {
    case 'pix': return 'success';
    case 'transferencia': return 'primary';
    case 'dinheiro': return 'warning';
    case 'cartao': return 'secondary';
    default: return 'secondary';
  }
};

const getNotaReciboLabel = (tipo: string) => {
  return tipo === 'nota' ? 'Nota Fiscal' : 'Recibo';
};

const Prestadores = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [prestadores] = useState<Prestador[]>(mockPrestadores);

  const filteredPrestadores = prestadores.filter(
    (prestador) =>
      prestador.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prestador.contato.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Prestadores</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus prestadores de serviços
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Prestador
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou contato..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Prestadores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrestadores.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">Nenhum prestador encontrado.</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredPrestadores.map((prestador) => (
            <Card key={prestador.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{prestador.nome}</CardTitle>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <span className="text-sm">{prestador.contato}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Pagamento</span>
                    </div>
                    <Badge variant={getTipoPagamentoColor(prestador.tipoPagamento) as any}>
                      {getTipoPagamentoLabel(prestador.tipoPagamento)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Documento</span>
                    </div>
                    <Badge variant="outline">
                      {getNotaReciboLabel(prestador.notaRecibo)}
                    </Badge>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Orçamentos</span>
                    <span className="font-medium text-foreground">3 realizados</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-muted-foreground">Última atividade</span>
                    <span className="font-medium text-foreground">Há 2 dias</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Prestadores;