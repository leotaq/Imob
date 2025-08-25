import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";

type Usuario = { id: string; nome: string; email: string; isAdmin?: boolean };

export default function Admin() {
  const { token, usuario } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(true);
  const [aba, setAba] = useState<'usuarios' | 'empresa'>('usuarios');
  const [empresa, setEmpresa] = useState<any>(usuario?.empresa || null);

  // Redireciona se não for usuário master
  if (!usuario || !usuario.isMaster) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-red-700">Acesso restrito</h2>
        <p className="text-gray-600 mt-2">Somente o usuário master pode acessar esta página.</p>
      </div>
    );
  }

  // Carregar usuários
  useEffect(() => {
    if (!token) return;
    if (aba !== 'usuarios') return;
    setLoading(true);
    fetch("http://localhost:3001/api/usuarios", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Não autorizado");
        return res.json();
      })
      .then((data) => setUsuarios(data.usuarios))
      .catch(() => setErro("Não autorizado ou erro ao buscar usuários."))
      .finally(() => setLoading(false));
  }, [token, aba]);

  // Carregar empresa (mock, pois depende do backend)
  useEffect(() => {
    if (aba !== 'empresa') return;
    setEmpresa(usuario?.empresa || { nome: 'Minha Empresa', id: '1' });
  }, [aba, usuario]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Administração</h2>
      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded font-semibold ${aba === 'usuarios' ? 'bg-blue-600 text-white' : 'bg-muted text-blue-700'}`}
          onClick={() => setAba('usuarios')}
        >Usuários</button>
        <button
          className={`px-4 py-2 rounded font-semibold ${aba === 'empresa' ? 'bg-blue-600 text-white' : 'bg-muted text-blue-700'}`}
          onClick={() => setAba('empresa')}
        >Empresa</button>
      </div>

      {aba === 'usuarios' && (
        <div>
          <h3 className="text-lg font-bold mb-2">Usuários da Empresa</h3>
          {loading ? (
            <div>Carregando...</div>
          ) : erro ? (
            <div className="text-red-500">{erro}</div>
          ) : (
            <table className="w-full border text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="p-2 text-left">Nome</th>
                  <th className="p-2 text-left">E-mail</th>
                  <th className="p-2 text-left">Admin</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="p-2">{u.nome}</td>
                    <td className="p-2">{u.email}</td>
                    <td className="p-2">{u.isAdmin ? 'Sim' : 'Não'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {aba === 'empresa' && empresa && (
        <div>
          <h3 className="text-lg font-bold mb-2">Dados da Empresa</h3>
          <div className="mb-2">Nome: <span className="font-semibold">{empresa.nome}</span></div>
          <div className="mb-2">ID: <span className="font-mono">{empresa.id}</span></div>
          {/* Adicione mais campos conforme necessário */}
        </div>
      )}
    </div>
  );
}
