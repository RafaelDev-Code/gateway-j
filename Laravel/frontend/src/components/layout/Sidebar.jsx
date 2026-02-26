import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Bell, Wallet, ArrowLeftRight, AlertOctagon,
  ArrowUpRight, PlusCircle, Settings, User, Shield,
  ChevronDown, ChevronLeft, ChevronRight, Zap, LogOut,
  BarChart2, HelpCircle, X,
} from "lucide-react";

const NAV = [
  { id: "dashboard",    label: "Dashboard",    icon: LayoutDashboard, to: "/",     exact: true },
  { id: "notificacoes", label: "Notificações",  icon: Bell,            to: "/notificacoes", badge: 3 },
  {
    id: "financeiro", label: "Financeiro", icon: Wallet,
    children: [
      { id: "transacoes",   label: "Transações",       icon: ArrowLeftRight, to: "/financeiro/transacoes" },
      { id: "contestacoes", label: "Contestações",      icon: AlertOctagon,   to: "/financeiro/contestacoes" },
      { id: "saque",        label: "Solicitar Saque",   icon: ArrowUpRight,   to: "/financeiro/saque" },
      { id: "recebimento",  label: "Criar Recebimento", icon: PlusCircle,     to: "/financeiro/recebimento" },
    ],
  },
  {
    id: "configuracoes", label: "Configurações", icon: Settings,
    children: [
      { id: "conta",     label: "Minha Conta", icon: User,   to: "/configuracoes/conta" },
      { id: "seguranca", label: "Segurança",   icon: Shield, to: "/configuracoes/seguranca" },
    ],
  },
];

const BOTTOM_NAV = [
  { id: "suporte", label: "Suporte", icon: HelpCircle, to: "#" },
  { id: "sair",    label: "Sair",    icon: LogOut,     to: "/login" },
];

function NavItem({ item, collapsed, onClose }) {
  const location = useLocation();
  const hasChildren = Boolean(item.children);
  const isChildActive = hasChildren && item.children.some((c) => location.pathname.startsWith(c.to));

  const [open, setOpen] = useState(isChildActive);

  useEffect(() => {
    if (isChildActive) setOpen(true);
  }, [isChildActive]);

  if (hasChildren) {
    return (
      <div>
        <button
          className={`sb-item${isChildActive ? " active" : ""}`}
          onClick={() => !collapsed && setOpen((o) => !o)}
        >
          <item.icon className="sb-icon" size={17} strokeWidth={1.8} />
          <span className="sb-label">{item.label}</span>
          <ChevronDown size={14} className={`sb-chevron${open && !collapsed ? " open" : ""}`} />
          {collapsed && <span className="sb-tooltip">{item.label}</span>}
        </button>

        <div className={`sb-sub${open && !collapsed ? " open" : ""}`}>
          {item.children.map((child) => (
            <NavLink
              key={child.id}
              to={child.to}
              className={({ isActive }) => `sb-subitem${isActive ? " active" : ""}`}
              onClick={onClose}
            >
              <child.icon size={13} strokeWidth={2} style={{ flexShrink: 0, opacity: 0.7 }} />
              {child.label}
            </NavLink>
          ))}
        </div>
      </div>
    );
  }

  return (
    <NavLink
      to={item.to}
      end={item.exact}
      className={({ isActive }) => `sb-item${isActive ? " active" : ""}`}
      onClick={onClose}
    >
      <item.icon className="sb-icon" size={17} strokeWidth={1.8} />
      <span className="sb-label">{item.label}</span>
      {item.badge && <span className="sb-badge">{item.badge}</span>}
      {collapsed && <span className="sb-tooltip">{item.label}</span>}
    </NavLink>
  );
}

export function Sidebar({ collapsed, onToggle, isOpen, onClose }) {
  const cls = [
    "sidebar",
    collapsed ? "collapsed" : "",
    isOpen    ? "is-open"  : "",
  ].filter(Boolean).join(" ");

  return (
    <>
      {/* Overlay — mobile only */}
      <div
        className={`overlay${isOpen ? " visible" : ""}`}
        onClick={onClose}
        aria-hidden
      />

      <aside className={cls}>
        {/* Logo */}
        <div className="sb-logo">
          <div className="sb-logo-icon">
            <Zap size={16} color="#fff" strokeWidth={2.5} />
          </div>
          <span className="sb-logo-name">Gateway JJ</span>
          {/* Mobile close */}
          <button
            onClick={onClose}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "rgba(255,255,255,0.4)",
              display: "flex",
              alignItems: "center",
              borderRadius: 4,
              padding: 3,
            }}
            aria-label="Fechar menu"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="sb-nav">
          <div className="sb-nav-section">Menu</div>

          {NAV.map((item) => (
            <NavItem key={item.id} item={item} collapsed={collapsed} onClose={onClose} />
          ))}

          <div className="sb-nav-section" style={{ marginTop: 6 }}>Outros</div>

          {BOTTOM_NAV.map((item) => (
            <NavLink
              key={item.id}
              to={item.to}
              className={({ isActive }) => `sb-item${isActive ? " active" : ""}`}
              onClick={onClose}
            >
              <item.icon className="sb-icon" size={17} strokeWidth={1.8} />
              <span className="sb-label">{item.label}</span>
              {collapsed && <span className="sb-tooltip">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Upgrade CTA */}
        <div className="sb-upgrade">
          <p className="sb-upgrade-title">Upgrade para Pro</p>
          <p className="sb-upgrade-desc">Acesso completo a recursos avançados.</p>
          <button className="sb-upgrade-btn">Fazer upgrade</button>
        </div>

        {/* Desktop collapse toggle */}
        <button
          className="sb-toggle"
          onClick={onToggle}
          title={collapsed ? "Expandir" : "Recolher"}
        >
          {collapsed
            ? <ChevronRight size={12} />
            : <ChevronLeft  size={12} />
          }
        </button>
      </aside>
    </>
  );
}
