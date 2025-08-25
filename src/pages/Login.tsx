import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';


const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    }
    return 'light';
  });
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error || 'Erro ao fazer login.');
      } else {
        login(data.usuario, data.token);
        navigate('/');
      }
    } catch (err) {
      setErro('Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background relative">
      <button
        className="absolute top-4 right-4 px-3 py-1 rounded border text-xs"
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        aria-label="Alternar tema"
      >
        {theme === 'light' ? '🌙 Modo Escuro' : '☀️ Modo Claro'}
      </button>
      <form onSubmit={handleSubmit} className="bg-card p-8 rounded-lg shadow-md w-full max-w-md space-y-4">
        <div className="flex justify-center mb-2">
          <img src="/logo-imobigestor.png" alt="Logo" className="h-32 w-auto" />
        </div>
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
        <div>
          <label className="block mb-1 font-medium">E-mail</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="E-mail ou ID"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Senha</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            required
          />
        </div>
        {erro && <div className="text-red-500 text-sm text-center">{erro}</div>}
        <button
          type="submit"
          className={
            `w-full py-2 rounded font-semibold transition
            ${loading
              ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'}
            `
          }
          disabled={loading}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
};

export default Login;
