import { useState } from "react";
import {
  Home,
  BarChart3,
  DollarSign,
  Users,
  Bell,
  Zap,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Crown,
  HelpCircle,
  LogOut,
  Menu,
  Plus,
} from "lucide-react";

const COR = "#AEDB2F";
const FUNDO = "#0a0a0a";
const CARD = "#141414";
const BORDA = "#262626";

const itensMenu = [
  { icone: Home, label: "Dashboard", ativo: true, dot: true },
  { icone: BarChart3, label: "Análises", ativo: false },
  { icone: DollarSign, label: "Financeiro", ativo: false },
  { icone: Users, label: "Base de Clientes", ativo: false },
  { icone: Bell, label: "Alertas Importantes", ativo: false },
];

export function SidebarFinexy() {
  const [menuAberto, setMenuAberto] = useState(true);
  const [automacoesAberto, setAutomacoesAberto] = useState(false);

  return (
    <aside
      className="sidebar-raven"
      style={{
        width: 240,
        minWidth: 240,
        flexShrink: 0,
        background: FUNDO,
        padding: "16px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        borderRight: "1px solid " + BORDA,
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, paddingLeft: 4 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: COR,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#000",
            flexShrink: 0,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2C8 2 6 5 6 8c0 4 2 6 6 10 4-4 6-6 6-10 0-3-2-6-6-6z" />
            <path d="M12 22v-4" />
            <path d="M8 18l4 4 4-4" />
          </svg>
        </div>
        <span style={{ fontSize: 17, fontWeight: 700, color: "#fff", letterSpacing: "0.04em" }}>
          RAVEN
        </span>
      </div>

      {/* Botão CTA */}
      <button
        className="sidebar-btn-add"
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "12px 16px",
          background: COR,
          color: "#000",
          border: "none",
          borderRadius: 12,
          fontWeight: 700,
          fontSize: 13,
          cursor: "pointer",
          marginBottom: 20,
          transition: "all 0.2s",
        }}
      >
        <Plus size={18} strokeWidth={2.5} />
        Adicionar novo bot
      </button>

      {/* Menu */}
      <button
        onClick={() => setMenuAberto(!menuAberto)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 12px",
          background: "transparent",
          border: "none",
          color: "#a3a3a3",
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          marginBottom: 6,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        <Menu size={18} />
        Menu
        <span style={{ marginLeft: "auto" }}>
          {menuAberto ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {menuAberto && (
        <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 12 }}>
          {itensMenu.map((item) => {
            const Icon = item.icone;
            return (
              <div
                key={item.label}
                className="sidebar-item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  background: item.ativo ? CARD : "transparent",
                  borderRadius: 10,
                  cursor: "pointer",
                  color: item.ativo ? COR : "#e5e5e5",
                  border: item.ativo ? "1px solid " + BORDA : "1px solid transparent",
                  transition: "all 0.15s",
                }}
              >
                <Icon size={19} strokeWidth={2} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{item.label}</span>
                {item.dot && (
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: COR,
                      flexShrink: 0,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Automações */}
      <button
        onClick={() => setAutomacoesAberto(!automacoesAberto)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 12px",
          background: "transparent",
          border: "none",
          color: "#e5e5e5",
          fontSize: 14,
          fontWeight: 500,
          cursor: "pointer",
          marginBottom: 16,
          transition: "color 0.15s",
        }}
        className="sidebar-automacoes"
      >
        <Zap size={19} style={{ color: COR, flexShrink: 0 }} />
        Automações
        <span style={{ marginLeft: "auto" }}>
          {automacoesAberto ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {/* Card Faturamento */}
      <div
        style={{
          background: CARD,
          borderRadius: 12,
          padding: 14,
          marginBottom: 16,
          border: "1px solid " + BORDA,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Crown size={18} style={{ color: COR, flexShrink: 0 }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>Faturamento</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13, color: "#fff" }}>
          <span>R$ 2,33</span>
          <span style={{ color: "#a3a3a3" }}>R$ 10.000</span>
        </div>
        <div style={{ height: 6, background: "#262626", borderRadius: 9999, overflow: "hidden", marginBottom: 10 }}>
          <div style={{ width: "0.02%", height: "100%", background: COR, borderRadius: 9999, transition: "width 0.3s" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
          <span style={{ color: "#737373" }}>Próximo Nível:</span>
          <span style={{ color: COR, fontWeight: 600 }}>Dark Egg</span>
        </div>
      </div>

      {/* Rodapé */}
      <div style={{ marginTop: "auto", paddingTop: 12, borderTop: "1px solid " + BORDA, display: "flex", flexDirection: "column", gap: 2 }}>
        <button
          className="sidebar-footer-btn"
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 12px",
            background: "transparent",
            border: "none",
            color: "#e5e5e5",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
            borderRadius: 10,
            transition: "all 0.15s",
          }}
        >
          <HelpCircle size={18} style={{ color: COR, flexShrink: 0 }} />
          Suporte
          <ChevronRight size={16} style={{ marginLeft: "auto", opacity: 0.7 }} />
        </button>
        <button
          className="sidebar-footer-btn sidebar-sair"
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 12px",
            background: "transparent",
            border: "none",
            color: COR,
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
            borderRadius: 10,
            transition: "all 0.15s",
          }}
        >
          <LogOut size={18} style={{ flexShrink: 0 }} />
          Sair da Conta
        </button>
      </div>
    </aside>
  );
}
