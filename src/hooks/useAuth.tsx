import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function useAuth() {
  const [usuario, setUsuario] = useState(() => {
    // Tenta primeiro 'usuario', depois 'user' para compatibilidade
    let u = localStorage.getItem('usuario') || localStorage.getItem('user');
    if (!u) return null;
    const parsed = JSON.parse(u);
    // Garante que as propriedades booleanas sempre serão booleanos
    parsed.isAdmin = Boolean(parsed.isAdmin);
    parsed.isMaster = Boolean(parsed.isMaster);
    parsed.isGestor = Boolean(parsed.isGestor);
    return parsed;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
      navigate('/login');
    }
  }, [token, navigate]);

  function login(usuario: any, token: string) {
    setUsuario(usuario);
    setToken(token);
    // Salva em ambas as chaves para compatibilidade
    localStorage.setItem('usuario', JSON.stringify(usuario));
    localStorage.setItem('user', JSON.stringify(usuario));
    localStorage.setItem('token', token);
  }

  function logout() {
    setUsuario(null);
    setToken(null);
    // Remove ambas as chaves
    localStorage.removeItem('usuario');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  }

  return { usuario, token, login, logout };
}
