import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const API_BASE = import.meta.env.VITE_API_URL || '';

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
      // Determina se é email ou código
      const isEmail = email.includes('@');
      const loginData = isEmail 
        ? { email, senha }
        : { codigo: email, senha };
      
      const res = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
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

  const clearStorage = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setErro('');
    window.location.reload();
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
          <label className="block mb-1 font-medium">E-mail ou ID</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="Digite seu e-mail ou ID"
          />
          <p className="text-xs text-muted-foreground mt-1">
            💡 Você pode usar seu e-mail ou o ID que escolheu no cadastro (ex: joao123, maria, carlos)
          </p>
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
        <button
          type="button"
          onClick={clearStorage}
          className="w-full py-2 rounded font-semibold transition bg-red-500 text-white hover:bg-red-600 text-sm"
        >
          Limpar Cache e Recarregar
        </button>
        
        {/* Botão de Cadastro */}
        <div className="text-center pt-4 border-t">
          <p className="text-sm text-muted-foreground mb-2">Não tem uma conta?</p>
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="w-full py-2 rounded font-semibold transition bg-secondary text-secondary-foreground hover:bg-secondary/80"
          >
            Criar Nova Conta
          </button>
        </div>
        
        {/* Credenciais de teste para a equipe */}
        <div className="space-y-3 pt-4 border-t">
          <p className="text-sm text-center text-muted-foreground font-semibold">🔑 Credenciais para Teste</p>
          <div className="space-y-2 text-xs">
            <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded border">
              <div className="font-semibold text-purple-700 dark:text-purple-300">👑 Master</div>
              <div className="text-gray-600 dark:text-gray-300">ID: <span className="font-mono">master</span></div>
              <div className="text-gray-600 dark:text-gray-300">Email: <span className="font-mono">master@imobigestor.com</span></div>
              <div className="text-gray-600 dark:text-gray-300">Senha: <span className="font-mono">123456</span></div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded border">
              <div className="font-semibold text-blue-700 dark:text-blue-300">👨‍💼 Gestor</div>
              <div className="text-gray-600 dark:text-gray-300">ID: <span className="font-mono">gestor</span></div>
              <div className="text-gray-600 dark:text-gray-300">Email: <span className="font-mono">gestor@imobigestor.com</span></div>
              <div className="text-gray-600 dark:text-gray-300">Senha: <span className="font-mono">123456</span></div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded border">
              <div className="font-semibold text-green-700 dark:text-green-300">🔧 Prestador</div>
              <div className="text-gray-600 dark:text-gray-300">ID: <span className="font-mono">prestador</span></div>
              <div className="text-gray-600 dark:text-gray-300">Email: <span className="font-mono">prestador@imobigestor.com</span></div>
              <div className="text-gray-600 dark:text-gray-300">Senha: <span className="font-mono">123456</span></div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/20 p-2 rounded border">
              <div className="font-semibold text-gray-700 dark:text-gray-300">👤 Usuário</div>
              <div className="text-gray-600 dark:text-gray-300">ID: <span className="font-mono">usuario</span></div>
              <div className="text-gray-600 dark:text-gray-300">Email: <span className="font-mono">usuario@imobigestor.com</span></div>
              <div className="text-gray-600 dark:text-gray-300">Senha: <span className="font-mono">123456</span></div>
            </div>
          </div>
          <p className="text-xs text-center text-muted-foreground italic">💡 Copie e cole as credenciais acima nos campos de login</p>
        </div>
      </form>
    </div>
  );
};

export default Login;
