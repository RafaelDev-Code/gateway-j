import { useState, useRef, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Bell,
  Wallet,
  ArrowLeftRight,
  AlertOctagon,
  ArrowUpRight,
  PlusCircle,
  Settings,
  User,
  Shield,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Zap,
  X,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    to: "/",
    exact: true,
  },
  {
    id: "notificacoes",
    label: "Notificações",
    icon: Bell,
    to: "/notificacoes",
    badge: 3,
  },
  {
    id: "financeiro",
    label: "Financeiro",
    icon: Wallet,
    children: [
      { id: "transacoes",   label: "Transações",       icon: ArrowLeftRight, to: "/financeiro/transacoes" },
      { id: "contestacoes", label: "Contestações",      icon: AlertOctagon,   to: "/financeiro/contestacoes" },
      { id: "saque",        label: "Solicitar Saque",   icon: ArrowUpRight,   to: "/financeiro/saque" },
      { id: "recebimento",  label: "Criar Recebimento", icon: PlusCircle,     to: "/financeiro/recebimento" },
    ],
  },
  {
    id: "configuracoes",
    label: "Configurações",
    icon: Settings,
    children: [
      { id: "conta",     label: "Minha Conta", icon: User,   to: "/configuracoes/conta" },
      { id: "seguranca", label: "Segurança",   icon: Shield, to: "/configuracoes/seguranca" },
    ],
  },
];

function SidebarItem({ item, collapsed, onMobileClose }) {
  const location = useLocation();
  const [open, setOpen] = useState(() => {
    if (!item.children) return false;
    return item.children.some((c) => location.pathname.startsWith(c.to));
  });

  const isActiveParent =
    item.children && item.children.some((c) => location.pathname.startsWith(c.to));

  useEffect(() => {
    if (isActiveParent) setOpen(true);
  }, [isActiveParent]);

  if (item.children) {
    return (
      <div>
        <button
          className={`sb-item${isActiveParent ? " active" : ""}`}
          onClick={() => !collapsed && setOpen((o) => !o)}
          style={{ position: "relative" }}
          title={collapsed ? item.label : undefined}
        >
          <item.icon className="sb-item-icon" size={18} strokeWidth={2} />
          <span className="sb-item-label">{item.label}</span>
          {!collapsed && (
            <ChevronDown
              size={15}
              className={`sb-item-chevron${open ? " open" : ""}`}
            />
          )}
          {collapsed && <span className="sb-tooltip">{item.label}</span>}
        </button>

        <div className={`sb-submenu${open && !collapsed ? " open" : ""}`}>
          {item.children.map((child) => (
            <NavLink
              key={child.id}
              to={child.to}
              className={({ isActive }) =>
                `sb-subitem${isActive ? " active" : ""}`
              }
              onClick={onMobileClose}
            >
              <child.icon size={14} strokeWidth={2} style={{ flexShrink: 0, color: "inherit", opacity: 0.7 }} />
              {child.label}
            </NavLink>
          ))}
        </div>
      </div>
    );
  }

  const isExact = item.exact;

  return (
    <NavLink
      to={item.to}
      end={isExact}
      className={({ isActive }) => `sb-item${isActive ? " active" : ""}`}
      style={{ position: "relative" }}
      onClick={onMobileClose}
      title={collapsed ? item.label : undefined}
    >
      <item.icon className="sb-item-icon" size={18} strokeWidth={2} />
      <span className="sb-item-label">{item.label}</span>
      {item.badge && (
        <span className="sb-item-badge">{item.badge}</span>
      )}
      {collapsed && <span className="sb-tooltip">{item.label}</span>}
    </NavLink>
  );
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const sidebarClass = [
    "app-sidebar",
    collapsed ? "collapsed" : "",
    mobileOpen ? "mobile-visible" : "mobile-hidden",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay${mobileOpen ? " visible" : ""}`}
        onClick={onMobileClose}
        aria-hidden="true"
      />

      <aside className={sidebarClass}>
        {/* Header */}
        <div className="sb-header">
          <div className="sb-logo-icon">
            <Zap size={18} color="#fff" strokeWidth={2.5} />
          </div>
          <span className="sb-logo-text">Gateway JJ</span>

          {/* Mobile close */}
          <button
            onClick={onMobileClose}
            style={{
              marginLeft: "auto",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "rgba(255,255,255,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "6px",
              padding: "4px",
              transition: "color 0.2s",
            }}
            className="lg-hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sb-nav">
          <div className="sb-section-label">Menu</div>

          {NAV_ITEMS.map((item) => (
            <SidebarItem
              key={item.id}
              item={item}
              collapsed={collapsed}
              onMobileClose={onMobileClose}
            />
          ))}
        </nav>

        {/* Footer — user card */}
        <div className="sb-footer">
          <div className="sb-user-card" title={collapsed ? "Admin" : undefined}>
            <div className="sb-avatar">A</div>
            <div className="sb-user-info">
              <div className="sb-user-name">Admin</div>
              <div className="sb-user-role">Administrador</div>
            </div>
            {!collapsed && (
              <LogOut
                size={15}
                style={{ color: "rgba(255,255,255,0.35)", flexShrink: 0 }}
              />
            )}
            {collapsed && <span className="sb-tooltip">Admin</span>}
          </div>
        </div>

        {/* Desktop collapse toggle */}
        <button
          className="sb-toggle"
          onClick={onToggle}
          title={collapsed ? "Expandir menu" : "Recolher menu"}
          style={{ display: "none" }}
          id="sb-desktop-toggle"
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
      </aside>

      {/* Desktop toggle trigger — outside sidebar */}
      <style>{`
        @media (min-width: 1025px) {
          #sb-desktop-toggle { display: flex !important; }
          .lg-hidden { display: none !important; }
        }
      `}</style>
    </>
  );
}
