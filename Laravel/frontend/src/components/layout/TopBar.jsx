import { useState, useEffect, useRef } from "react";
import { Bell, Sun, Moon, Menu, ChevronDown, User, Shield, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";

const TZ_BRASILIA = "America/Sao_Paulo";

function formatDataBrasilia() {
  const now = new Date();
  const weekday = now.toLocaleDateString("pt-BR", { timeZone: TZ_BRASILIA, weekday: "long" });
  const datePart = now.toLocaleDateString("pt-BR", {
    timeZone: TZ_BRASILIA,
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const capitalized = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  return `${capitalized} - ${datePart}`;
}

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

const ROLE_LABEL = { USER: "Merchant", MANAGER: "Gerente", ADMIN: "Administrador" };

export function TopBar({ onMenuClick, unreadCount = 0 }) {
  const { theme, toggleTheme } = useTheme();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { title, bread } = TITLES[pathname] || { title: "Painel", bread: "" };
  const userName = user?.name || "Usuário";
  const roleLabel = ROLE_LABEL[user?.role] || user?.role || "—";
  const iniciais = (userName || "?").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "?";

  const [dataBrasilia,   setDataBrasilia]   = useState(() => formatDataBrasilia());
  const [dropdownAberto, setDropdownAberto] = useState(false);

  const dropRef = useRef(null);

  useEffect(() => {
    const tick = () => setDataBrasilia(formatDataBrasilia());
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  /* Fecha dropdown ao clicar fora */
  useEffect(() => {
    if (!dropdownAberto) return;
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropdownAberto(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownAberto]);

  const irPara = (path) => {
    setDropdownAberto(false);
    navigate(path);
  };

  return (
    <header className="topbar">
      {/* Hamburger */}
      <button className="tb-hamburger" onClick={onMenuClick} aria-label="Menu">
        <Menu size={19} />
      </button>

      {/* Saudação */}
      <div className="tb-greeting">
        <p className="tb-greeting-line">
          <span className="tb-greeting-ola">Olá,</span>{" "}
          <span className="tb-greeting-name">{userName}.</span>
        </p>
        <p className="tb-greeting-date">{dataBrasilia}</p>
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

        {/* Sino — navega para /notificacoes */}
        <button
          className="tb-btn"
          title="Notificações"
          aria-label="Notificações"
          onClick={() => navigate("/notificacoes")}
        >
          <Bell size={15} />
          {unreadCount > 0 && <span className="tb-dot" aria-hidden />}
        </button>

        <div className="tb-sep" />

        {/* Área de perfil com dropdown */}
        <div ref={dropRef} style={{ position: "relative" }}>
          <button
            className="tb-user"
            aria-label="Perfil"
            aria-expanded={dropdownAberto}
            onClick={() => setDropdownAberto((v) => !v)}
          >
            <div className="tb-avatar">{iniciais}</div>
            <div>
              <div className="tb-user-name">{userName}</div>
              <div className="tb-user-role">{roleLabel}</div>
            </div>
            <ChevronDown
              size={13}
              style={{
                color: "var(--text-3)", marginLeft: 2,
                transition: "transform 200ms",
                transform: dropdownAberto ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </button>

          {dropdownAberto && (
            <div className="tb-dropdown">
              <button className="tb-dropdown-item" onClick={() => irPara("/configuracoes/conta")}>
                <User size={14} />
                Minha conta
              </button>
              <button className="tb-dropdown-item" onClick={() => irPara("/configuracoes/seguranca")}>
                <Shield size={14} />
                Segurança
              </button>
              <div className="tb-dropdown-sep" />
              <button className="tb-dropdown-item tb-dropdown-danger" onClick={() => { setDropdownAberto(false); logout(); }}>
                <LogOut size={14} />
                Sair da conta
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
