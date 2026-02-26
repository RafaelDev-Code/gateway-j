import { Bell, Search, Sun, Moon, Menu, Settings, ChevronDown } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { useLocation } from "react-router-dom";

const PAGE_TITLES = {
  "/":                            { title: "Dashboard",         sub: "Visão geral do seu negócio" },
  "/notificacoes":                { title: "Notificações",       sub: "Suas mensagens e alertas" },
  "/financeiro/transacoes":       { title: "Transações",         sub: "Financeiro" },
  "/financeiro/contestacoes":     { title: "Contestações",       sub: "Financeiro" },
  "/financeiro/saque":            { title: "Solicitar Saque",    sub: "Financeiro" },
  "/financeiro/recebimento":      { title: "Criar Recebimento",  sub: "Financeiro" },
  "/configuracoes/conta":         { title: "Minha Conta",        sub: "Configurações" },
  "/configuracoes/seguranca":     { title: "Segurança",          sub: "Configurações" },
};

export function TopBar({ onMenuClick }) {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const page = PAGE_TITLES[location.pathname] || { title: "Painel", sub: "" };

  return (
    <header className="app-topbar">
      {/* Mobile hamburger */}
      <button className="tb-menu-btn" onClick={onMenuClick} aria-label="Abrir menu">
        <Menu size={20} />
      </button>

      {/* Page info */}
      <div style={{ display: "flex", flexDirection: "column", gap: 0, minWidth: 0 }}>
        <span style={{
          fontSize: 16,
          fontWeight: 700,
          color: "var(--text-primary)",
          letterSpacing: "-0.02em",
          lineHeight: 1.2,
          whiteSpace: "nowrap",
        }}>
          {page.title}
        </span>
        {page.sub && page.sub !== page.title && (
          <span style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.3 }}>
            {page.sub} / {page.title}
          </span>
        )}
      </div>

      {/* Search */}
      <div className="tb-search" style={{ marginLeft: 16 }}>
        <Search size={15} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Buscar transação, cliente..."
          aria-label="Buscar"
        />
        <kbd style={{
          fontSize: 10,
          background: "var(--bg-hover)",
          border: "1px solid var(--border)",
          borderRadius: 4,
          padding: "2px 5px",
          color: "var(--text-muted)",
          fontFamily: "inherit",
          flexShrink: 0,
        }}>
          ⌘K
        </kbd>
      </div>

      <div className="tb-spacer" />

      {/* Actions */}
      <div className="tb-actions">
        {/* Theme toggle */}
        <button
          className="tb-icon-btn"
          onClick={toggleTheme}
          aria-label={theme === "light" ? "Ativar modo escuro" : "Ativar modo claro"}
          title={theme === "light" ? "Modo escuro" : "Modo claro"}
        >
          {theme === "light"
            ? <Moon size={16} />
            : <Sun size={16} />
          }
        </button>

        {/* Notifications */}
        <button className="tb-icon-btn" aria-label="Notificações" title="Notificações">
          <Bell size={16} />
          <span className="tb-notif-badge" aria-hidden="true" />
        </button>

        {/* Settings */}
        <button className="tb-icon-btn" aria-label="Configurações rápidas" title="Configurações">
          <Settings size={16} />
        </button>

        <div className="tb-divider" />

        {/* User */}
        <button className="tb-user" aria-label="Menu do usuário">
          <div className="tb-user-avatar">A</div>
          <div className="tb-user-info">
            <span className="tb-user-name">Admin</span>
            <span className="tb-user-role">Administrador</span>
          </div>
          <ChevronDown size={14} style={{ color: "var(--text-muted)", marginLeft: 2 }} />
        </button>
      </div>
    </header>
  );
}
