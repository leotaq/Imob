import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Layers, CheckCircle, AlertCircle } from 'lucide-react';

interface ImovelCardProps {
  imovel: {
    imovelId: string;
    endereco: string;
    cidade: string;
    solicitacoes: any[];
  };
  orcamentos: any[];
  onOpenConsolidado: (imovelId: string) => void;
}

export const ImovelCard: React.FC<ImovelCardProps> = ({ 
  imovel, 
  orcamentos, 
  onOpenConsolidado 
}) => {
  const solicitacoesSemOrcamento = imovel.solicitacoes.filter(
    (sol: any) => !orcamentos.some(orc => orc.solicitacaoId === sol.id)
  );

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {imovel.imovelId}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {imovel.endereco}, {imovel.cidade}
            </p>
          </div>
          <div className="flex gap-2">
            {solicitacoesSemOrcamento.length > 1 && (
              <Button
                onClick={() => onOpenConsolidado(imovel.imovelId)}
                className="gap-2"
              >
                <Layers className="h-4 w-4" />
                Orçamento Consolidado
              </Button>
            )}
            <Badge variant="secondary">
              {imovel.solicitacoes.length} solicitações
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {imovel.solicitacoes.map((solicitacao: any) => {
            const temOrcamento = orcamentos.some(orc => orc.solicitacaoId === solicitacao.id);
            
            return (
              <div key={solicitacao.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={temOrcamento ? "default" : "outline"}
                    className={temOrcamento ? "bg-green-100 text-green-800" : ""}
                  >
                    {solicitacao.tipoManutencao}
                  </Badge>
                  <div>
                    <p className="font-medium">{solicitacao.descricao}</p>
                    <p className="text-sm text-muted-foreground">
                      Prazo: {solicitacao.prazoFinal.toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {temOrcamento ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Com Orçamento
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-orange-600">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Sem Orçamento
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};