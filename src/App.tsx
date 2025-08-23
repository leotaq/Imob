import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Solicitacoes from "./pages/Solicitacoes";
import Prestadores from "./pages/Prestadores";
import Orcamentos from "./pages/Orcamentos";
import Execucao from "./pages/Execucao";
import Financeiro from "./pages/Financeiro";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/solicitacoes" element={<Solicitacoes />} />
            <Route path="/orcamentos" element={<Orcamentos />} />
            <Route path="/execucao" element={<Execucao />} />
            <Route path="/prestadores" element={<Prestadores />} />
            <Route path="/financeiro" element={<Financeiro />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
