import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import EscolherUnidade from "./pages/EscolherUnidade";
import Catalogo from "./pages/Catalogo";
import Localizacao from "./pages/Localizacao";
import Informacoes from "./pages/Informacoes";
import NotFound from "./pages/NotFound";
import { unidadeDoSite } from "./config/site";

const queryClient = new QueryClient();

// Cada página nova abre do topo
const RolarParaOTopo = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RolarParaOTopo />
        <Routes>
          {/* A página inicial é o catálogo: primeiro a pessoa escolhe a unidade.
              No site de uma unidade só, já abre o catálogo dela (ver src/config/site.ts). */}
          <Route path="/" element={unidadeDoSite ? <Catalogo /> : <EscolherUnidade />} />
          <Route path="/catalogo/:loja" element={unidadeDoSite ? <Navigate to="/" replace /> : <Catalogo />} />
          <Route path="/localizacao" element={<Localizacao />} />
          <Route path="/informacoes" element={<Informacoes />} />
          {/* Endereços antigos, ainda em links salvos */}
          <Route path="/catalogo" element={<Navigate to="/" replace />} />
          <Route path="/products" element={<Navigate to="/" replace />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
