import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function useAuth() {
  const [usuario, setUsuario] = useState(() => {
    const u = localStorage.getItem('usuario');
    if (!u) return null;
    const parsed = JSON.parse(u);
    // Garante que isAdmin e isMaster sempre serão booleanos
    parsed.isAdmin = Boolean(parsed.isAdmin);
    parsed.isMaster = Boolean(parsed.isMaster);
    return parsed;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  function login(usuario: any, token: string) {
    setUsuario(usuario);
    setToken(token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
    localStorage.setItem('token', token);
  }

  function logout() {
    setUsuario(null);
    setToken(null);
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    navigate('/login');
  }

  return { usuario, token, login, logout };
}
