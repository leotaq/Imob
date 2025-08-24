import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nomeEmpresa, nome, email, senha })
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error || "Erro ao cadastrar.");
      } else {
        // Cadastro feito, redireciona para login
        navigate("/login");
      }
    } catch {
      setErro("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <form onSubmit={handleSubmit} className="bg-card p-8 rounded-lg shadow-md w-full max-w-md space-y-4">
        <div className="flex justify-center mb-2">
          <img src="/logo-imobigestor.png" alt="Logo" className="h-32 w-auto" />
        </div>
        <h2 className="text-2xl font-bold mb-4 text-center">Cadastro</h2>
        <div>
          <label className="block mb-1 font-medium">Empresa</label>
          <input type="text" className="w-full border rounded px-3 py-2" value={nomeEmpresa} onChange={e => setNomeEmpresa(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1 font-medium">Seu nome</label>
          <input type="text" className="w-full border rounded px-3 py-2" value={nome} onChange={e => setNome(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1 font-medium">E-mail</label>
          <input type="email" className="w-full border rounded px-3 py-2" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1 font-medium">Senha</label>
          <input type="password" className="w-full border rounded px-3 py-2" value={senha} onChange={e => setSenha(e.target.value)} required />
        </div>
        {erro && <div className="text-red-500 text-sm text-center">{erro}</div>}
        <button type="submit" className={`w-full py-2 rounded font-semibold transition ${loading ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-60' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`} disabled={loading}>
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
        <div className="text-center text-sm mt-2">
          Já tem conta? <Link to="/login" className="text-primary underline">Entrar</Link>
        </div>
      </form>
    </div>
  );
}
