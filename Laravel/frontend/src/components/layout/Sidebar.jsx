import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Bell, ArrowLeftRight, AlertOctagon,
  ArrowUpRight, PlusCircle, User, Shield,
  ChevronLeft, ChevronRight,
  HelpCircle, TrendingUp, ShieldCheck, MessageCircle, Plug,
} from "lucide-react";
import logoImg from "../../assets/logo.webp";
import iconeImg from "../../assets/icone.webp";

/* Seções com mini-título + itens sempre abertos (sem expandir/recolher) */
const SECTIONS = [
  {
    title: "MENU",
    items: [
      { id: "dashboard",    label: "Dashboard",    icon: LayoutDashboard, to: "/",     exact: true },
      { id: "notificacoes",   label: "Notificações",       icon: Bell,         to: "/notificacoes", badge: 3 },
      { id: "verificacao-kyc", label: "Verificação KYC",   icon: ShieldCheck,  to: "/verificacao-kyc" },
    ],
  },
  {
    title: "FINANCEIRO",
    items: [
      { id: "transacoes",   label: "Transações",        icon: ArrowLeftRight, to: "/financeiro/transacoes" },
      { id: "contestacoes", label: "Contestações",      icon: AlertOctagon,   to: "/financeiro/contestacoes" },
      { id: "saque",        label: "Solicitar Saque",   icon: ArrowUpRight,   to: "/financeiro/saque" },
      { id: "recebimento",  label: "Criar Recebimento", icon: PlusCircle,     to: "/financeiro/recebimento" },
    ],
  },
  {
    title: "CONFIGURAÇÕES",
    items: [
      { id: "conta",        label: "Minha Conta",          icon: User,   to: "/configuracoes/conta"        },
      { id: "seguranca",    label: "Segurança",            icon: Shield, to: "/configuracoes/seguranca"    },
      { id: "integracoes",  label: "Integrações",          icon: Plug,   to: "/configuracoes/integracoes"  },
    ],
  },
];


function NavLinkItem({ item, collapsed, onClose }) {
  return (
    <NavLink
      to={item.to}
      end={item.exact}
      className={({ isActive }) => `sb-item${isActive ? " active" : ""}`}
      onClick={onClose}
    >
      <item.icon className="sb-icon" size={17} strokeWidth={1.8} />
      <span className="sb-label">{item.label}</span>
      {item.badge != null && <span className="sb-badge">{item.badge}</span>}
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
      <div
        className={`overlay${isOpen ? " visible" : ""}`}
        onClick={onClose}
        aria-hidden
      />

      <aside className={cls}>
        <div className="sb-logo">
          {collapsed ? (
            <img src={iconeImg} alt="Gateway JJ" className="sb-logo-img sb-logo-icon-only" />
          ) : (
            <img src={logoImg} alt="Gateway JJ" className="sb-logo-img" />
          )}
        </div>

        <nav className="sb-nav">
          {/* Botão Fale com seu Gerente — destaque acima de tudo */}
          <a href="#" className="sb-gerente-btn" onClick={onClose}>
            <MessageCircle size={15} strokeWidth={2} className="sb-gerente-icon" />
            <span className="sb-gerente-label">Fale com seu Gerente</span>
          </a>

          {SECTIONS.map((section) => (
            <div key={section.title} className="sb-nav-block">
              <div className="sb-nav-section">{section.title}</div>
              {section.items.map((item) => (
                <NavLinkItem key={item.id} item={item} collapsed={collapsed} onClose={onClose} />
              ))}
            </div>
          ))}
        </nav>

        <div className="sb-faturamento">
          <div className="sb-faturamento-head">
            <div className="sb-faturamento-icon">
              <TrendingUp size={14} strokeWidth={2} />
            </div>
            <span className="sb-faturamento-title">Seu faturamento</span>
          </div>
          <p className="sb-faturamento-valor">R$ 4.832,02</p>
          <div className="sb-faturamento-bar">
            <div className="sb-faturamento-bar-track">
              <div className="sb-faturamento-bar-fill" style={{ width: "4.8%" }} />
              <span className="sb-faturamento-bar-meta">Meta: R$ 100k</span>
            </div>
          </div>
        </div>


      </aside>
    </>
  );
}
