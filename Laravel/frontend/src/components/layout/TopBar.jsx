import { Bell, Search, Sun, Moon, Menu, Settings, ChevronDown } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";

const TITLES = {
  "/":                        { title: "Dashboard",         bread: "Dashboard" },
  "/notificacoes":            { title: "Notificações",       bread: "Dashboard / Notificações" },
  "/financeiro/transacoes":   { title: "Transações",         bread: "Financeiro / Transações" },
  "/financeiro/contestacoes": { title: "Contestações",       bread: "Financeiro / Contestações" },
  "/financeiro/saque":        { title: "Solicitar Saque",    bread: "Financeiro / Solicitar Saque" },
  "/financeiro/recebimento":  { title: "Criar Recebimento",  bread: "Financeiro / Criar Recebimento" },
  "/configuracoes/conta":     { title: "Minha Conta",        bread: "Configurações / Minha Conta" },
  "/configuracoes/seguranca": { title: "Segurança",          bread: "Configurações / Segurança" },
};

export function TopBar({ onMenuClick }) {
  const { theme, toggleTheme } = useTheme();
  const { pathname } = useLocation();
  const { title, bread } = TITLES[pathname] || { title: "Painel", bread: "" };

  return (
    <header className="topbar">
      {/* Hamburger */}
      <button className="tb-hamburger" onClick={onMenuClick} aria-label="Menu">
        <Menu size={19} />
      </button>

      {/* Search */}
      <div className="tb-search">
        <Search size={14} className="tb-search-icon" />
        <input type="text" placeholder="Buscar transação, cliente..." aria-label="Buscar" />
        <kbd className="tb-search-kbd">⌘K</kbd>
      </div>

      <div className="tb-gap" />

      {/* Actions */}
      <div className="tb-actions">
        {/* Theme toggle */}
        <button
          className="tb-btn"
          onClick={toggleTheme}
          title={theme === "light" ? "Modo escuro" : "Modo claro"}
          aria-label="Alternar tema"
        >
          {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
        </button>

        {/* Notifications */}
        <button className="tb-btn" title="Notificações" aria-label="Notificações">
          <Bell size={15} />
          <span className="tb-dot" aria-hidden />
        </button>

        {/* Settings */}
        <button className="tb-btn" title="Configurações" aria-label="Configurações">
          <Settings size={15} />
        </button>

        <div className="tb-sep" />

        {/* User */}
        <button className="tb-user" aria-label="Perfil">
          <div className="tb-avatar">A</div>
          <div>
            <div className="tb-user-name">Admin</div>
            <div className="tb-user-role">Administrador</div>
          </div>
          <ChevronDown size={13} style={{ color: "var(--text-3)", marginLeft: 2 }} />
        </button>
      </div>
    </header>
  );
}
