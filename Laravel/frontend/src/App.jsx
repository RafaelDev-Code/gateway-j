import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Layout } from "./components/layout/Layout";

import { Dashboard }         from "./pages/Dashboard";
import { Notificacoes }      from "./pages/Notificacoes";
import { Transacoes }        from "./pages/financeiro/Transacoes";
import { Contestacoes }      from "./pages/financeiro/Contestacoes";
import { SolicitarSaque }    from "./pages/financeiro/SolicitarSaque";
import { CriarRecebimento }  from "./pages/financeiro/CriarRecebimento";
import { MinhaConta }        from "./pages/configuracoes/MinhaConta";
import { Seguranca }         from "./pages/configuracoes/Seguranca";
import { Login }             from "./pages/auth/Login";

function AppLayout({ children }) {
  return <Layout>{children}</Layout>;
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />

          {/* Authenticated routes */}
          <Route path="/"                          element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/notificacoes"              element={<AppLayout><Notificacoes /></AppLayout>} />
          <Route path="/financeiro/transacoes"     element={<AppLayout><Transacoes /></AppLayout>} />
          <Route path="/financeiro/contestacoes"   element={<AppLayout><Contestacoes /></AppLayout>} />
          <Route path="/financeiro/saque"          element={<AppLayout><SolicitarSaque /></AppLayout>} />
          <Route path="/financeiro/recebimento"    element={<AppLayout><CriarRecebimento /></AppLayout>} />
          <Route path="/configuracoes/conta"       element={<AppLayout><MinhaConta /></AppLayout>} />
          <Route path="/configuracoes/seguranca"   element={<AppLayout><Seguranca /></AppLayout>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
