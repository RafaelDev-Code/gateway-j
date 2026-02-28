import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { Layout } from "./components/layout/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";

import { Dashboard }         from "./pages/Dashboard";
import { Notificacoes }      from "./pages/Notificacoes";
import { Transacoes }        from "./pages/financeiro/Transacoes";
import { Contestacoes }      from "./pages/financeiro/Contestacoes";
import { SolicitarSaque }    from "./pages/financeiro/SolicitarSaque";
import { CriarRecebimento }  from "./pages/financeiro/CriarRecebimento";
import { MinhaConta }            from "./pages/configuracoes/MinhaConta";
import { Seguranca }             from "./pages/configuracoes/Seguranca";
import { IntegracoesExternas }   from "./pages/configuracoes/IntegracoesExternas";
import { Login }             from "./pages/auth/Login";
import { Cadastro }          from "./pages/auth/Cadastro";
import { RedefinirSenha }    from "./pages/auth/RedefinirSenha";
import { KYC }               from "./pages/auth/KYC";

function AppLayout({ children }) {
  return <Layout>{children}</Layout>;
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login"           element={<Login />} />
            <Route path="/cadastro"        element={<Cadastro />} />
            <Route path="/redefinir-senha" element={<RedefinirSenha />} />

            {/* Rotas protegidas (Sanctum) */}
            <Route path="/verificacao-kyc" element={<ProtectedRoute><AppLayout><KYC /></AppLayout></ProtectedRoute>} />
            <Route path="/"                element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/notificacoes"    element={<ProtectedRoute><AppLayout><Notificacoes /></AppLayout></ProtectedRoute>} />
            <Route path="/financeiro/transacoes"     element={<ProtectedRoute><AppLayout><Transacoes /></AppLayout></ProtectedRoute>} />
            <Route path="/financeiro/contestacoes"   element={<ProtectedRoute><AppLayout><Contestacoes /></AppLayout></ProtectedRoute>} />
            <Route path="/financeiro/saque"          element={<ProtectedRoute><AppLayout><SolicitarSaque /></AppLayout></ProtectedRoute>} />
            <Route path="/financeiro/recebimento"    element={<ProtectedRoute><AppLayout><CriarRecebimento /></AppLayout></ProtectedRoute>} />
            <Route path="/configuracoes/conta"       element={<ProtectedRoute><AppLayout><MinhaConta /></AppLayout></ProtectedRoute>} />
            <Route path="/configuracoes/seguranca"   element={<ProtectedRoute><AppLayout><Seguranca /></AppLayout></ProtectedRoute>} />
            <Route path="/configuracoes/integracoes" element={<ProtectedRoute><AppLayout><IntegracoesExternas /></AppLayout></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
