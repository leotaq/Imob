import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { useAuth } from "./hooks/useAuth";
import { useViewMode } from "./hooks/useViewMode";
import { Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Solicitacoes from "./pages/Solicitacoes";
import Prestadores from "./pages/Prestadores";
import Orcamentos from "./pages/Orcamentos";
import Execucao from "./pages/Execucao";
import Financeiro from "./pages/Financeiro";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Perfil from "./pages/Perfil";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import SolicitacaoInquilino from "./pages/SolicitacaoInquilino";

import ConfiguracaoPermissoes from "./pages/ConfiguracaoPermissoes";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { token } = useAuth();
  // Se não há token, o useAuth já redireciona, então apenas renderizamos o children
  // O redirecionamento é feito pelo useEffect no useAuth
  return children;
}

// Só permite acesso se o usuário for admin
function AdminGuard({ children }: { children: JSX.Element }) {
  const { usuario } = useAuth();
  if (!usuario?.isAdmin) return <Navigate to="/" replace />;
  return children;
}

// Componente para redirecionar baseado no viewMode
function HomeRedirect() {
  const { viewMode } = useViewMode();
  const { usuario } = useAuth();
  
  // Verificação adicional: se o usuário é prestador mas viewMode não está correto
  if (usuario?.prestador && typeof usuario.prestador === 'object' && viewMode !== 'prestador') {
    // Aguarda o useViewMode corrigir automaticamente
    return null;
  }
  
  // Se for usuário comum, redireciona para nova solicitação
  if (viewMode === 'usuario') {
    return <Navigate to="/solicitacao-inquilino" replace />;
  }
  
  // Se for prestador, redireciona para orçamentos
  if (viewMode === 'prestador') {
    return <Navigate to="/orcamentos" replace />;
  }
  
  // Para master e gestor, mostra o dashboard
  return <Dashboard />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/solicitacoes" element={<Solicitacoes />} />
            <Route path="/nova-solicitacao" element={<SolicitacaoInquilino />} />
            <Route path="/solicitacao-inquilino" element={<SolicitacaoInquilino />} />
            <Route path="/orcamentos" element={<Orcamentos />} />
            <Route path="/execucao" element={<Execucao />} />
            <Route path="/prestadores" element={<Prestadores />} />
            <Route path="/financeiro" element={<Financeiro />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/admin" element={
              <AdminGuard>
                <Admin />
              </AdminGuard>
            } />
            <Route path="/configuracao-permissoes" element={<ConfiguracaoPermissoes />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
