import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { useAuth } from "./hooks/useAuth";
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
            <Route path="/" element={<Dashboard />} />
            <Route path="/solicitacoes" element={<Solicitacoes />} />
            <Route path="/nova-solicitacao" element={<SolicitacaoInquilino />} />
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
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
