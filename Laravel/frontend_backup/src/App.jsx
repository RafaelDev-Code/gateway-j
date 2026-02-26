import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LayoutVorix } from "./componentes/LayoutVorix";

/* ── Páginas autenticadas ── */
import { Payment }               from "./paginas/Payment";
import { Dashboard }             from "./paginas/Dashboard";
import { Notificacoes }          from "./paginas/Notificacoes";
import { EfetuarSaque }          from "./paginas/financeiro/EfetuarSaque";
import { EfetuarDeposito }       from "./paginas/financeiro/EfetuarDeposito";
import { CobrancaPersonalizada } from "./paginas/financeiro/CobrancaPersonalizada";
import { Transacoes }            from "./paginas/relatorios/Transacoes";
import { Reembolsos }            from "./paginas/relatorios/Reembolsos";
import { Entradas }              from "./paginas/relatorios/Entradas";
import { Saidas }                from "./paginas/relatorios/Saidas";
import { Webhooks }              from "./paginas/integracoes/Webhooks";
import { Plataformas }           from "./paginas/integracoes/Plataformas";
import { Credenciais }           from "./paginas/integracoes/Credenciais";
import { MeuPerfil }             from "./paginas/configuracoes/MeuPerfil";
import { ContaBancaria }         from "./paginas/configuracoes/ContaBancaria";
import { Seguranca }             from "./paginas/configuracoes/Seguranca";

/* ── Páginas públicas (sem layout) ── */
import { Login }    from "./paginas/auth/Login";
import { Cadastro } from "./paginas/auth/Cadastro";
import { KYC }      from "./paginas/auth/KYC";

/* ── Wrapper com layout ── */
function AppLayout({ children, title }) {
  return <LayoutVorix pageTitle={title}>{children}</LayoutVorix>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Autenticação (sem sidebar) ── */}
        <Route path="/login"    element={<Login />}    />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/kyc"      element={<KYC />}      />

        {/* ── App autenticado (com sidebar) ── */}
        <Route path="/"               element={<AppLayout title="Dashboard">       <Payment />                 </AppLayout>} />
        <Route path="/notificacoes"   element={<AppLayout title="Notificações">    <Notificacoes />            </AppLayout>} />

        <Route path="/financeiro/saque"    element={<AppLayout title="Efetuar Saque">        <EfetuarSaque />          </AppLayout>} />
        <Route path="/financeiro/deposito" element={<AppLayout title="Efetuar Depósito">     <EfetuarDeposito />       </AppLayout>} />
        <Route path="/financeiro/cobranca" element={<AppLayout title="Cobrança Personalizada"><CobrancaPersonalizada /> </AppLayout>} />

        <Route path="/relatorios/transacoes" element={<AppLayout title="Transações"> <Transacoes /> </AppLayout>} />
        <Route path="/relatorios/reembolsos" element={<AppLayout title="Reembolsos"> <Reembolsos /> </AppLayout>} />
        <Route path="/relatorios/entradas"   element={<AppLayout title="Entradas">   <Entradas />   </AppLayout>} />
        <Route path="/relatorios/saidas"     element={<AppLayout title="Saídas">     <Saidas />     </AppLayout>} />

        <Route path="/integracoes/webhooks"    element={<AppLayout title="Webhooks">    <Webhooks />    </AppLayout>} />
        <Route path="/integracoes/plataformas" element={<AppLayout title="Plataformas"> <Plataformas /> </AppLayout>} />
        <Route path="/integracoes/credenciais" element={<AppLayout title="Credenciais"> <Credenciais /> </AppLayout>} />

        <Route path="/configuracoes/perfil"          element={<AppLayout title="Meu Perfil">      <MeuPerfil />     </AppLayout>} />
        <Route path="/configuracoes/conta-bancaria"  element={<AppLayout title="Conta Bancária">  <ContaBancaria /> </AppLayout>} />
        <Route path="/configuracoes/seguranca"       element={<AppLayout title="Segurança">       <Seguranca />     </AppLayout>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
