import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Clock, User, FileText, Edit, Plus } from 'lucide-react';
import { Comentario, HistoricoCompleto } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SolicitacaoHistoricoProps {
  solicitacaoId: string;
  comentarios: Comentario[];
  historico: HistoricoCompleto[];
  onAddComentario: (texto: string) => void;
  loading?: boolean;
}

const SolicitacaoHistorico: React.FC<SolicitacaoHistoricoProps> = ({
  solicitacaoId,
  comentarios,
  historico,
  onAddComentario,
  loading = false
}) => {
  const [novoComentario, setNovoComentario] = useState('');
  const [activeTab, setActiveTab] = useState<'comentarios' | 'historico'>('comentarios');

  const handleSubmitComentario = () => {
    if (novoComentario.trim()) {
      onAddComentario(novoComentario.trim());
      setNovoComentario('');
    }
  };

  const getIconeHistorico = (tipo: string) => {
    switch (tipo) {
      case 'comentario': return <MessageSquare className="h-4 w-4" />;
      case 'status': return <Clock className="h-4 w-4" />;
      case 'criacao': return <Plus className="h-4 w-4" />;
      case 'edicao': return <Edit className="h-4 w-4" />;
      case 'anexo': return <FileText className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getCorTipo = (tipo: string) => {
    switch (tipo) {
      case 'comentario': return 'bg-blue-100 text-blue-800';
      case 'status': return 'bg-green-100 text-green-800';
      case 'criacao': return 'bg-purple-100 text-purple-800';
      case 'edicao': return 'bg-orange-100 text-orange-800';
      case 'anexo': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comentários e Histórico
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'comentarios' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('comentarios')}
          >
            Comentários ({comentarios.length})
          </Button>
          <Button
            variant={activeTab === 'historico' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('historico')}
          >
            Histórico ({historico.length})
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Formulário para novo comentário */}
        <div className="space-y-2">
          <Textarea
            placeholder="Adicione um comentário..."
            value={novoComentario}
            onChange={(e) => setNovoComentario(e.target.value)}
            className="min-h-[80px]"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSubmitComentario}
              disabled={!novoComentario.trim() || loading}
              size="sm"
            >
              {loading ? 'Enviando...' : 'Adicionar Comentário'}
            </Button>
          </div>
        </div>

        <Separator />

        {/* Lista de comentários ou histórico */}
        <ScrollArea className="h-[300px] w-full">
          {activeTab === 'comentarios' ? (
            <div className="space-y-4">
              {comentarios.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum comentário ainda. Seja o primeiro a comentar!
                </p>
              ) : (
                comentarios.map((comentario) => (
                  <div key={comentario.id} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{comentario.usuario}</span>
                        <Badge variant="outline" className={getCorTipo(comentario.tipo)}>
                          {comentario.tipo}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(comentario.data, { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </span>
                      </div>
                      <p className="text-sm">{comentario.texto}</p>
                      {comentario.anexos && comentario.anexos.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {comentario.anexos.map((anexo, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              <FileText className="h-3 w-3 mr-1" />
                              Anexo {index + 1}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {historico.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum histórico disponível.
                </p>
              ) : (
                historico.map((item) => (
                  <div key={item.id} className="flex gap-3 p-3 rounded-lg border">
                    <div className={`p-2 rounded-full ${getCorTipo(item.tipo)}`}>
                      {getIconeHistorico(item.tipo)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{item.usuario}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(item.data, { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </span>
                      </div>
                      <p className="text-sm">{item.descricao}</p>
                      {item.detalhes && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {item.detalhes.statusAnterior && item.detalhes.statusNovo && (
                            <span>
                              Status: {item.detalhes.statusAnterior} → {item.detalhes.statusNovo}
                            </span>
                          )}
                          {item.detalhes.camposAlterados && (
                            <span>
                              Campos alterados: {item.detalhes.camposAlterados.join(', ')}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default SolicitacaoHistorico;