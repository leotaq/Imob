
import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";

type Usuario = { id: string; nome: string; email: string; isGestor?: boolean };
type Empresa = { id: string; nome: string; usuarios: Usuario[] };

export default function Admin() {
  const [editandoUsuarioId, setEditandoUsuarioId] = useState<string | null>(null);
  const [editGestor, setEditGestor] = useState(false);
  const [editNome, setEditNome] = useState("");
  const [editEmail, setEditEmail] = useState("");

  // Editar papel gestor, nome e email do usuário
  const handleEditarUsuario = (usuario: Usuario) => {
    setEditandoUsuarioId(usuario.id);
    setEditGestor(!!usuario.isGestor);
    setEditNome(usuario.nome);
    setEditEmail(usuario.email);
  };

  // Salvar edição do usuário (PUT)
  const handleSalvarEdicaoUsuario = async (usuario: Usuario) => {
    setErro("");
    try {
      // Atualiza nome/email
      const { apiPut } = await import('@/lib/api');
       await apiPut(`/api/empresas/${empresaSelecionada?.id}/usuarios/${usuario.id}`, { nome: editNome, email: editEmail });
      // Atualiza isGestor (se mudou)
      if (usuario.isGestor !== editGestor) {
        const { apiPatch } = await import('@/lib/api');
        await apiPatch(`/api/empresas/${empresaSelecionada?.id}/usuarios/${usuario.id}`, { isGestor: editGestor });
      }
      // Atualizar lista de empresas/usuários
      const { apiGet } = await import('@/lib/api');
       const empresasData = await apiGet('/api/empresas');
      setEmpresas(empresasData.empresas);
      setEmpresaSelecionada(empresasData.empresas.find((e: Empresa) => e.id === empresaSelecionada?.id) || null);
      setEditandoUsuarioId(null);
    } catch {
      setErro("Erro ao atualizar usuário.");
    }
  };

  // Excluir usuário
  const handleExcluirUsuario = async (usuario: Usuario) => {
    setErro("");
    if (!window.confirm(`Tem certeza que deseja excluir o usuário ${usuario.nome}?`)) return;
    try {
      const { apiDelete } = await import('@/lib/api');
       await apiDelete(`/api/empresas/${empresaSelecionada?.id}/usuarios/${usuario.id}`);
      // Atualizar lista de empresas/usuários
      const { apiGet } = await import('@/lib/api');
       const empresasData = await apiGet('/api/empresas');
      setEmpresas(empresasData.empresas);
      setEmpresaSelecionada(empresasData.empresas.find((e: Empresa) => e.id === empresaSelecionada?.id) || null);
    } catch {
      setErro("Erro ao excluir usuário.");
    }
  };
  const { token, usuario } = useAuth();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresaSelecionada, setEmpresaSelecionada] = useState<Empresa | null>(null);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(true);
  const [novoNomeEmpresa, setNovoNomeEmpresa] = useState("");
  const [novoUsuario, setNovoUsuario] = useState({ nome: "", email: "", senha: "", isGestor: false });

  // Redireciona se não for usuário master
  if (!usuario || !usuario.isMaster) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-red-700">Acesso restrito</h2>
        <p className="text-gray-600 mt-2">Somente o usuário master pode acessar esta página.</p>
      </div>
    );
  }

  // Carregar empresas e usuários
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    import('@/lib/api').then(({ apiGet }) => apiGet('/api/empresas'))
       .then((data) => setEmpresas(data.empresas))
      .catch(() => setErro("Não autorizado ou erro ao buscar empresas."))
      .finally(() => setLoading(false));
  }, [token]);

  // Selecionar empresa
  const handleSelecionarEmpresa = (empresa: Empresa) => {
    setEmpresaSelecionada(empresa);
    setErro("");
  };

  // Cadastrar nova empresa
  const handleCadastrarEmpresa = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    if (!novoNomeEmpresa) return setErro("Preencha o nome da empresa.");
    try {
      const { apiPost } = await import('@/lib/api');
       const data = await apiPost('/api/empresas', { nome: novoNomeEmpresa });
       setNovoNomeEmpresa("");
       // Recarregar empresas
      setEmpresas((prev) => [...prev, { ...data.empresa, usuarios: [] }]);
    } catch {
      setErro("Erro ao cadastrar empresa.");
    }
  };

  // Cadastrar novo usuário na empresa selecionada
  const handleCadastrarUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    if (!empresaSelecionada) return setErro("Selecione uma empresa.");
    const { nome, email, senha, isGestor } = novoUsuario;
    if (!nome || !email || !senha) return setErro("Preencha todos os campos do usuário.");
    try {
      const { apiPost } = await import('@/lib/api');
       await apiPost(`/api/empresas/${empresaSelecionada.id}/usuarios`, { nome, email, senha, isGestor });
       setNovoUsuario({ nome: "", email: "", senha: "", isGestor: false });
       // Recarregar empresas (simples, pode ser otimizado)
       const { apiGet } = await import('@/lib/api');
       const empresasData = await apiGet('/api/empresas');
      setEmpresas(empresasData.empresas);
      setEmpresaSelecionada(empresasData.empresas.find((e: Empresa) => e.id === empresaSelecionada.id) || null);
    } catch {
      setErro("Erro ao cadastrar usuário.");
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Administração de Empresas e Usuários</h2>
      {erro && <div className="text-red-600 mb-2">{erro}</div>}
      <div className="flex gap-8">
        {/* Lista de empresas */}
        <div className="w-1/3">
          <h3 className="font-semibold mb-2">Empresas</h3>
          <ul className="border rounded divide-y">
            {empresas.map((empresa) => (
              <li
                key={empresa.id}
                className={`p-2 cursor-pointer hover:bg-gray-100 ${empresaSelecionada?.id === empresa.id ? "bg-blue-100" : ""}`}
                onClick={() => handleSelecionarEmpresa(empresa)}
              >
                {empresa.nome}
              </li>
            ))}
          </ul>
          {/* Formulário de cadastro de empresa */}
          <form onSubmit={handleCadastrarEmpresa} className="mt-4 space-y-2">
            <input
              type="text"
              className="w-full border rounded px-2 py-1"
              placeholder="Nova empresa"
              value={novoNomeEmpresa}
              onChange={e => setNovoNomeEmpresa(e.target.value)}
            />
            <button type="submit" className="w-full bg-blue-600 text-white rounded py-1">Cadastrar empresa</button>
          </form>
        </div>
        {/* Usuários da empresa selecionada */}
        <div className="flex-1">
          <h3 className="font-semibold mb-2">Usuários da empresa</h3>
          {empresaSelecionada ? (
            <>
              <ul className="border rounded divide-y mb-4">
                {empresaSelecionada.usuarios.map((u) => (
                  <li key={u.id} className="p-2 flex justify-between items-center gap-2">
                    {editandoUsuarioId === u.id ? (
                      <>
                        <input
                          type="text"
                          className="border rounded px-1 py-0.5 text-sm w-28"
                          value={editNome}
                          onChange={e => setEditNome(e.target.value)}
                        />
                        <input
                          type="text"
                          className="border rounded px-1 py-0.5 text-sm w-36"
                          value={editEmail}
                          onChange={e => setEditEmail(e.target.value)}
                        />
                        <label className="flex items-center gap-1">
                          <input type="checkbox" checked={editGestor} onChange={e => setEditGestor(e.target.checked)} /> Gestor
                        </label>
                        <button className="bg-green-600 text-white rounded px-2 py-1 text-xs" onClick={() => handleSalvarEdicaoUsuario(u)}>Salvar</button>
                        <button className="ml-1 text-xs text-gray-500 underline" onClick={() => setEditandoUsuarioId(null)}>Cancelar</button>
                      </>
                    ) : (
                      <>
                        <span>{u.nome} ({u.email}) <span className="text-xs ml-2 font-semibold">{u.isGestor ? 'Gestor' : 'Usuário'}</span></span>
                        <button className="ml-2 text-xs text-blue-600 underline" onClick={() => handleEditarUsuario(u)}>Editar</button>
                        <button className="ml-1 text-xs text-red-600 underline" onClick={() => handleExcluirUsuario(u)}>Excluir</button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
              {/* Formulário de cadastro de usuário */}
              <form onSubmit={handleCadastrarUsuario} className="space-y-2">
                <div className="flex gap-2">
                  <input type="text" className="border rounded px-2 py-1 flex-1" placeholder="Nome" value={novoUsuario.nome} onChange={e => setNovoUsuario(v => ({ ...v, nome: e.target.value }))} />
                  <input type="text" className="border rounded px-2 py-1 flex-1" placeholder="E-mail" value={novoUsuario.email} onChange={e => setNovoUsuario(v => ({ ...v, email: e.target.value }))} />
                  <input type="password" className="border rounded px-2 py-1 flex-1" placeholder="Senha" value={novoUsuario.senha} onChange={e => setNovoUsuario(v => ({ ...v, senha: e.target.value }))} />
                </div>
                <div className="flex gap-4 items-center">
                  <label className="flex items-center gap-1">
                    <input type="checkbox" checked={novoUsuario.isGestor} onChange={e => setNovoUsuario(v => ({ ...v, isGestor: e.target.checked }))} /> Gestor
                  </label>
                  <button type="submit" className="bg-blue-600 text-white rounded px-3 py-1">Cadastrar usuário</button>
                </div>
              </form>
            </>
          ) : (
            <div className="text-gray-500">Selecione uma empresa para ver os usuários.</div>
          )}
        </div>
      </div>
    </div>
  );
}
