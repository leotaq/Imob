import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

type Usuario = {
  id: string;
  nome: string;
  email: string;
  isGestor: boolean;
  permissoes: string[];
};

type Empresa = {
  id: string;
  nome: string;
  usuarios: Usuario[];
};

const PAGINAS_DISPONIVEIS = [
  { key: 'dashboard', nome: 'Dashboard', descricao: 'Visão geral do sistema' },
  { key: 'nova_solicitacao', nome: 'Nova Solicitação', descricao: 'Criar novas solicitações' },
  { key: 'solicitacoes', nome: 'Solicitações', descricao: 'Gerenciar solicitações' },
  { key: 'orcamentos', nome: 'Orçamentos', descricao: 'Gerenciar orçamentos' },
  { key: 'execucao', nome: 'Execução', descricao: 'Acompanhar execução de serviços' },
  { key: 'prestadores', nome: 'Prestadores', descricao: 'Gerenciar prestadores de serviço' },
  { key: 'financeiro', nome: 'Financeiro', descricao: 'Relatórios e controle financeiro' },
];

export default function ConfiguracaoPermissoes() {
  const { token, usuario } = useAuth();
  const navigate = useNavigate();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresaSelecionada, setEmpresaSelecionada] = useState<Empresa | null>(null);
  const [gestorSelecionado, setGestorSelecionado] = useState<Usuario | null>(null);
  const [permissoesEditando, setPermissoesEditando] = useState<string[]>([]);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_URL || '';

  // Redireciona se não for usuário master
  if (!usuario || !usuario.isMaster) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-red-700">Acesso restrito</h2>
        <p className="text-gray-600 mt-2">Somente o usuário master pode acessar esta página.</p>
        <button 
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Voltar ao Dashboard
        </button>
      </div>
    );
  }

  // Carregar empresas e usuários
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`${API_BASE}/api/empresas`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Não autorizado");
        return res.json();
      })
      .then((data) => {
        setEmpresas(data.empresas);
        if (data.empresas.length > 0) {
          setEmpresaSelecionada(data.empresas[0]);
        }
      })
      .catch(() => setErro("Não autorizado ou erro ao buscar empresas."))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSelecionarGestor = (gestor: Usuario) => {
    setGestorSelecionado(gestor);
    setPermissoesEditando([...gestor.permissoes]);
    setErro("");
    setSucesso("");
  };

  const handleTogglePermissao = (permissaoKey: string) => {
    setPermissoesEditando(prev => {
      if (prev.includes(permissaoKey)) {
        return prev.filter(p => p !== permissaoKey);
      } else {
        return [...prev, permissaoKey];
      }
    });
  };

  const handleSalvarPermissoes = async () => {
    if (!gestorSelecionado || !empresaSelecionada) return;
    
    setErro("");
    setSucesso("");
    
    try {
      const res = await fetch(`${API_BASE}/api/empresas/${empresaSelecionada.id}/usuarios/${gestorSelecionado.id}/permissoes`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ permissoes: permissoesEditando }),
      });
      
      if (!res.ok) throw new Error("Erro ao atualizar permissões");
      
      // Atualizar a lista local
      const empresasAtualizadas = empresas.map(empresa => {
        if (empresa.id === empresaSelecionada.id) {
          return {
            ...empresa,
            usuarios: empresa.usuarios.map(user => 
              user.id === gestorSelecionado.id 
                ? { ...user, permissoes: permissoesEditando }
                : user
            )
          };
        }
        return empresa;
      });
      
      setEmpresas(empresasAtualizadas);
      setEmpresaSelecionada(empresasAtualizadas.find(e => e.id === empresaSelecionada.id) || null);
      setGestorSelecionado(prev => prev ? { ...prev, permissoes: permissoesEditando } : null);
      setSucesso("Permissões atualizadas com sucesso!");
    } catch {
      setErro("Erro ao atualizar permissões.");
    }
  };

  if (loading) {
    return <div className="p-8">Carregando...</div>;
  }

  const gestores = empresaSelecionada?.usuarios.filter(u => u.isGestor) || [];

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Configuração de Permissões</h1>
        <p className="text-gray-600 mt-2">Configure quais páginas cada gestor pode acessar</p>
      </div>

      {erro && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {erro}
        </div>
      )}

      {sucesso && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {sucesso}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Lista de Empresas e Gestores */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Empresas e Gestores</h2>
          
          {empresas.length > 1 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecionar Empresa:
              </label>
              <select
                value={empresaSelecionada?.id || ""}
                onChange={(e) => {
                  const empresa = empresas.find(emp => emp.id === e.target.value);
                  setEmpresaSelecionada(empresa || null);
                  setGestorSelecionado(null);
                }}
                className="w-full border rounded px-3 py-2"
              >
                {empresas.map((empresa) => (
                  <option key={empresa.id} value={empresa.id}>
                    {empresa.nome}
                  </option>
                ))}
              </select>
            </div>
          )}

          {gestores.length > 0 ? (
            <div>
              <h3 className="font-medium mb-3">Gestores:</h3>
              <div className="space-y-2">
                {gestores.map((gestor) => (
                  <button
                    key={gestor.id}
                    onClick={() => handleSelecionarGestor(gestor)}
                    className={`w-full text-left p-3 rounded border transition-colors ${
                      gestorSelecionado?.id === gestor.id
                        ? 'bg-blue-50 border-blue-300'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium">{gestor.nome}</div>
                    <div className="text-sm text-gray-600">{gestor.email}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {gestor.permissoes.length} permissões configuradas
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              Nenhum gestor encontrado nesta empresa.
            </div>
          )}
        </div>

        {/* Configuração de Permissões */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Permissões de Acesso</h2>
          
          {gestorSelecionado ? (
            <div>
              <div className="mb-4 p-3 bg-blue-50 rounded">
                <div className="font-medium">{gestorSelecionado.nome}</div>
                <div className="text-sm text-gray-600">{gestorSelecionado.email}</div>
              </div>

              <div className="space-y-3 mb-6">
                {PAGINAS_DISPONIVEIS.map((pagina) => (
                  <label key={pagina.key} className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissoesEditando.includes(pagina.key)}
                      onChange={() => handleTogglePermissao(pagina.key)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{pagina.nome}</div>
                      <div className="text-sm text-gray-600">{pagina.descricao}</div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSalvarPermissoes}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Salvar Permissões
                </button>
                <button
                  onClick={() => {
                    setPermissoesEditando(PAGINAS_DISPONIVEIS.map(p => p.key));
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Selecionar Todas
                </button>
                <button
                  onClick={() => {
                    setPermissoesEditando([]);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  Limpar Todas
                </button>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              Selecione um gestor para configurar suas permissões.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}