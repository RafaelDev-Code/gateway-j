import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Bell,
  DollarSign,
  BarChart3,
  Plug,
  Settings,
  User,
  Building2,
  Shield,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Menu as MenuIcon,
  /* Financeiro subitems */
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
  /* Relatórios subitems */
  ArrowLeftRight,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  /* Integrações subitems */
  Webhook,
  Globe,
  KeyRound,
  /* Card de faturamento */
  TrendingUp as TrendingUpIcon,
  Target,
} from "lucide-react";
import { theme } from "../theme";
import logoImg  from "../assets/logo.webp";
import iconeImg from "../assets/icone.webp";

/* ─── tokens (Design System) ───────────────────────────────── */
const BG           = "rgba(6, 1, 2, 0.42)";
const BG_ELEVATED  = "transparent";
const BG_ACTIVE    = "rgba(255, 255, 255, 0.08)";
const BORDER       = "rgba(255, 255, 255, 0.06)";
const SEP          = "rgba(255, 255, 255, 0.06)";
const TEXT         = theme.text;
const MUTED        = theme.textMuted;
const ACCENT       = theme.accent;
const LINE_VERTICAL = "rgba(255, 255, 255, 0.14)"; /* guia branca discreta */

export const SIDEBAR_WIDTH_EXPANDED  = 260;
export const SIDEBAR_WIDTH_COLLAPSED = 72;

/* ─── dados do menu ───────────────────────────────────────── */
const MENU_ITEMS = [
  { id: "dashboard",    icon: Home, label: "Dashboard",    route: "/"              },
  { id: "notificacoes", icon: Bell, label: "Notificações", route: "/notificacoes"  },
];

const EXPANDABLE = [
  {
    id: "financeiro",
    icon: DollarSign,
    label: "Financeiro",
    items: [
      { id: "efetuar-saque",          label: "Efetuar Saque",          icon: ArrowUpRight,  route: "/financeiro/saque"     },
      { id: "efetuar-deposito",       label: "Efetuar Depósito",       icon: ArrowDownLeft, route: "/financeiro/deposito"  },
      { id: "cobranca-personalizada", label: "Cobrança Personalizada", icon: Receipt,       route: "/financeiro/cobranca"  },
    ],
  },
  {
    id: "relatorios",
    icon: BarChart3,
    label: "Relatórios",
    items: [
      { id: "transacoes", label: "Transações", icon: ArrowLeftRight, route: "/relatorios/transacoes" },
      { id: "reembolsos", label: "Reembolsos", icon: RotateCcw,      route: "/relatorios/reembolsos" },
      { id: "entradas",   label: "Entradas",   icon: TrendingUp,     route: "/relatorios/entradas"   },
      { id: "saidas",     label: "Saídas",     icon: TrendingDown,   route: "/relatorios/saidas"     },
    ],
  },
  {
    id: "integracoes",
    icon: Plug,
    label: "Integrações",
    items: [
      { id: "webhooks",    label: "Webhooks",    icon: Webhook,  route: "/integracoes/webhooks"    },
      { id: "plataformas", label: "Plataformas", icon: Globe,    route: "/integracoes/plataformas" },
      { id: "credenciais", label: "Credenciais", icon: KeyRound, route: "/integracoes/credenciais" },
    ],
  },
  {
    id: "configuracoes",
    icon: Settings,
    label: "Configurações",
    items: [
      { id: "meu-perfil",      label: "Meu Perfil",      icon: User,      route: "/configuracoes/perfil"          },
      { id: "conta-bancaria",  label: "Conta Bancária",  icon: Building2, route: "/configuracoes/conta-bancaria"  },
      { id: "seguranca",       label: "Segurança",       icon: Shield,    route: "/configuracoes/seguranca"        },
    ],
  },
];

/* ─── Card de Faturamento ────────────────────────────────── */
const FATURAMENTO_ATUAL = 3294.09;
const FATURAMENTO_META  = 100000;
const PROGRESSO = Math.min((FATURAMENTO_ATUAL / FATURAMENTO_META) * 100, 100);

function FaturamentoCard() {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 120);
    return () => clearTimeout(t);
  }, []);

  const fmt = (v) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div style={{
      margin:       "0 10px 10px",
      padding:      "14px 14px 12px",
      borderRadius: 12,
      background:   "rgba(255,255,255,0.03)",
      border:       "1px solid rgba(255,255,255,0.07)",
      flexShrink:   0,
    }}>
      {/* Header: ícone + label */}
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
        <div style={{
          width: 26, height: 26, borderRadius: 8,
          background: "rgba(243,15,34,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <TrendingUpIcon size={13} strokeWidth={2.5} style={{ color: ACCENT }} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.55)", letterSpacing: "0.02em" }}>
          Seu faturamento
        </span>
      </div>

      {/* Valores */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 10, gap: 6 }}>
        {/* Atual */}
        <div>
          <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 500, marginBottom: 1 }}>Realizado</p>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#fff", lineHeight: 1, letterSpacing: "-0.02em" }}>
            {fmt(FATURAMENTO_ATUAL)}
          </p>
        </div>
        {/* Divisor */}
        <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.08)", flexShrink: 0 }} />
        {/* Meta */}
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 500, marginBottom: 1 }}>
            Meta
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Target size={11} strokeWidth={2} style={{ color: "rgba(255,255,255,0.3)" }} />
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.45)", lineHeight: 1 }}>
              {fmt(FATURAMENTO_META)}
            </p>
          </div>
        </div>
      </div>

      {/* Barra de progresso */}
      <div>
        {/* trilha */}
        <div style={{ height: 5, borderRadius: 99, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
          {/* preenchimento */}
          <div style={{
            height:     "100%",
            borderRadius: 99,
            width:      animated ? `${PROGRESSO}%` : "0%",
            background: `linear-gradient(90deg, ${ACCENT} 0%, #ff4d5a 100%)`,
            boxShadow:  `0 0 8px rgba(243,15,34,0.5)`,
            transition: "width 1.1s cubic-bezier(0.4,0,0.2,1)",
          }} />
        </div>
      </div>

      {/* Link discreto abaixo da barra */}
      <button
        type="button"
        style={{
          ...baseBtn,
          marginTop: 10,
          padding: 0,
          width: "auto",
          alignSelf: "flex-start",
          gap: 4,
          color: "rgba(255,255,255,0.38)",
          fontSize: 11,
          fontWeight: 500,
          background: "none",
          border: "none",
        }}
      >
        Visualizar premiações
        <span style={{ fontSize: 10 }}>→</span>
      </button>
    </div>
  );
}

/* ─── estilo base dos botões ──────────────────────────────── */
const baseBtn = {
  display:    "flex",
  alignItems: "center",
  width:      "100%",
  background: "transparent",
  border:     "none",
  cursor:     "pointer",
  textAlign:  "left",
  fontFamily: "var(--font-body)",
};

/* ─── componente ──────────────────────────────────────────── */
export function SidebarVorix({
  collapsed: collapsedProp = false,
  onToggle,
  isOverlay   = false,
  overlayOpen = false,
  onOverlayClose,
}) {
  const isControlled = onToggle != null;
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const collapsed     = isOverlay ? false : (isControlled ? collapsedProp : internalCollapsed);
  const toggleSidebar = () =>
    isControlled ? onToggle(!collapsed) : setInternalCollapsed((c) => !c);

  /*
   * Accordion unificado: "menu" = grupo Menu, section.id = seção expandível.
   * Abrir um fecha automaticamente todos os outros.
   * activeId derivado da URL atual via useLocation.
   */
  const navigate  = useNavigate();
  const location  = useLocation();

  /* Deriva o activeId a partir da rota atual */
  const activeId = (() => {
    const path = location.pathname;
    const menuMatch = MENU_ITEMS.find(m => m.route === path);
    if (menuMatch) return menuMatch.id;
    for (const sec of EXPANDABLE) {
      const sub = sec.items.find(s => s.route === path);
      if (sub) return sub.id;
    }
    return "dashboard";
  })();

  /* Abre automaticamente a seção da rota ativa */
  const defaultOpen = (() => {
    const path = location.pathname;
    if (MENU_ITEMS.find(m => m.route === path) || path === "/") return "menu";
    for (const sec of EXPANDABLE) {
      if (sec.items.find(s => s.route === path)) return sec.id;
    }
    return "menu";
  })();

  const [openId,       setOpenId]       = useState(defaultOpen);
  const [tooltipItem,  setTooltipItem]  = useState(null);
  const [floatSection, setFloatSection] = useState(null);
  const [floatPos,     setFloatPos]     = useState({ left: 0, top: 0 });
  const floatRef = useRef(null);

  const toggle   = (id) => setOpenId((prev) => (prev === id ? null : id));
  const activate = (item) => {
    if (item.route) navigate(item.route);
    if (isOverlay) onOverlayClose?.();
  };

  /* fechar submenu flutuante ao clicar fora */
  useEffect(() => {
    if (!floatSection) return;
    const h = (e) => {
      if (floatRef.current && !floatRef.current.contains(e.target))
        setFloatSection(null);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [floatSection]);

  /* fechar overlay com Escape */
  useEffect(() => {
    if (!isOverlay || !overlayOpen || !onOverlayClose) return;
    const h = (e) => { if (e.key === "Escape") onOverlayClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [isOverlay, overlayOpen, onOverlayClose]);

  const openFloat = (section, e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setFloatPos({ left: r.right + 8, top: r.top });
    setFloatSection((prev) => (prev === section.id ? null : section.id));
  };

  const floatData = EXPANDABLE.find((s) => s.id === floatSection) ?? null;

  /* ─── render ────────────────────────────────────────────── */
  return (
    <>
      {/* ── backdrop overlay ── */}
      {isOverlay && overlayOpen && (
        <div
          role="button" tabIndex={-1}
          aria-label="Fechar menu"
          onClick={onOverlayClose}
          onKeyDown={(e) => e.key === "Escape" && onOverlayClose()}
          style={{
            position: "fixed", inset: 0, zIndex: 9998,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
            animation: "fadeIn 0.25s ease",
          }}
        />
      )}

      <aside style={{
        position: "fixed", top: 0, left: 0,
        height:    "100vh",
        width:     collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED,
        minWidth:  collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED,
        background: BG,
        backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)",
        borderRight: `1px solid ${BORDER}`,
        boxShadow:   "4px 0 24px rgba(0,0,0,0.3)",
        display:     "flex",
        flexDirection: "column",
        transition:  "width 0.22s ease, transform 0.32s cubic-bezier(0.25,0.1,0.25,1)",
        overflow:    "hidden",
        zIndex:      9999,
        fontFamily:  "var(--font-body)",
        transform:   isOverlay
          ? (overlayOpen ? "translateX(0)" : "translateX(-100%)")
          : "translateX(0)",
      }}>
        <div className="glass-grain" aria-hidden />

        {/* ── Logomarca ──────────────────────────────────────── */}
        <div style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: collapsed ? "center" : "flex-start",
          padding:        collapsed ? "14px 0" : "16px 16px 14px",
          borderBottom:   `1px solid ${SEP}`,
          flexShrink:     0,
          transition:     "padding 0.3s ease",
        }}>
          {collapsed ? (
            <img
              src={iconeImg}
              alt="Ícone"
              style={{ width: 32, height: 32, objectFit: "contain", display: "block" }}
            />
          ) : (
            <img
              src={logoImg}
              alt="Logo"
              style={{ height: 34, maxWidth: "100%", objectFit: "contain", display: "block" }}
            />
          )}
        </div>

        {/* ── bloco do usuário ─────────────────────────────── */}
        <div className="sb-user-block" style={{
          display:       "flex",
          flexDirection: collapsed ? "column" : "row",
          alignItems:    "center",
          gap:           12,
          padding:       collapsed ? "14px 12px" : "16px 14px 14px",
          borderBottom:  `1px solid ${SEP}`,
          flexShrink:    0,
          background:    BG_ELEVATED,
        }}>
          {isOverlay ? (
            <>
              <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: BG_ACTIVE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: MUTED }}>
                  <User size={24} strokeWidth={2} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 10, fontWeight: 600, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em" }}>Seja bem-vindo(a)</p>
                  <p style={{ margin: "2px 0 0", fontSize: 18, fontWeight: 800, color: TEXT, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Rafael Araujo</p>
                </div>
              </div>
              <button type="button" onClick={onOverlayClose}
                style={{ ...baseBtn, width: 40, height: 40, borderRadius: 10, background: BG_ACTIVE, border: "1px solid rgba(255,255,255,0.1)", color: TEXT, justifyContent: "center", flexShrink: 0 }}
                aria-label="Fechar menu">
                <X size={20} />
              </button>
            </>
          ) : collapsed ? (
            <button type="button" onClick={toggleSidebar}
              style={{ ...baseBtn, height: 40, borderRadius: 10, background: BG_ACTIVE, border: "1px solid rgba(255,255,255,0.1)", color: TEXT, justifyContent: "center" }}
              aria-label="Expandir menu">
              <ChevronRight size={20} />
            </button>
          ) : (
            <>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: BG_ACTIVE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: MUTED }}>
                <User size={24} strokeWidth={2} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 600, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em" }}>Seja bem-vindo(a)</p>
                <p style={{ margin: "2px 0 0", fontSize: 18, fontWeight: 800, color: TEXT, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Rafael Araujo</p>
              </div>
              <button type="button" onClick={toggleSidebar}
                style={{ ...baseBtn, width: 28, height: 28, borderRadius: 6, color: MUTED, justifyContent: "center", flexShrink: 0 }}
                aria-label="Recolher menu">
                <ChevronLeft size={18} />
              </button>
            </>
          )}
        </div>

        {/* ══════════════════════════════════════════════════
            MODO EXPANDIDO
        ══════════════════════════════════════════════════ */}
        {!collapsed && (
          <>
            {/* nav cresce e rola se necessário */}
            <nav className="sb-nav" style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "8px 10px 12px" }}>

              {/* ── Grupo "Menu" ── */}
              <div className="sb-section">
                <button
                  type="button"
                  onClick={() => toggle("menu")}
                  className={`sb-section-header${openId === "menu" ? " sb-section-open" : ""}`}
                  style={{ ...baseBtn, gap: 10, padding: "10px 8px", color: TEXT, borderRadius: 8 }}
                >
                  <MenuIcon size={18} strokeWidth={2.5} style={{ flexShrink: 0, color: ACCENT }} />
                  <span style={{ flex: 1, fontSize: 15, fontWeight: 700, letterSpacing: "0.02em" }}>Menu</span>
                  <ChevronDown size={14} style={{
                    color: MUTED, flexShrink: 0,
                    transition: "transform 0.26s cubic-bezier(0.4,0,0.2,1)",
                    transform: openId === "menu" ? "rotate(180deg)" : "none",
                  }} />
                </button>

                {/* subitens animados com linha lateral */}
                <div style={{
                  overflow:   "hidden",
                  maxHeight:  openId === "menu" ? `${MENU_ITEMS.length * 48 + 16}px` : "0px",
                  opacity:    openId === "menu" ? 1 : 0,
                  transition: "max-height 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.24s ease",
                }}>
                  <div style={{ position: "relative", marginLeft: 4, paddingLeft: 20, paddingBottom: 8, paddingTop: 4, display: "flex", flexDirection: "column", gap: 2 }}>
                    <div style={{ position: "absolute", left: 7, top: 4, bottom: 8, width: 1.5, background: LINE_VERTICAL, borderRadius: 1 }} />
                    {MENU_ITEMS.map((item) => {
                      const Icon     = item.icon;
                      const isActive = activeId === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => activate(item)}
                          className={`sb-nav-item${isActive ? " sb-nav-item-active" : ""}`}
                          style={{
                            ...baseBtn,
                            gap:        9,
                            padding:    "8px 10px",
                            color:      isActive ? TEXT : "rgba(255,255,255,0.55)",
                            fontWeight: isActive ? 600 : 400,
                            fontSize:   14,
                            borderRadius: 7,
                          }}
                        >
                          <Icon size={15} strokeWidth={isActive ? 2.5 : 1.8} style={{ flexShrink: 0, color: isActive ? ACCENT : "rgba(255,255,255,0.4)" }} />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ── Seções expandíveis ── */}
              {EXPANDABLE.map((section) => {
                const Icon   = section.icon;
                const isOpen = openId === section.id;

                return (
                  <div key={section.id} className="sb-section" style={{ marginTop: 6 }}>
                    <button
                      type="button"
                      onClick={() => toggle(section.id)}
                      className={`sb-section-header${isOpen ? " sb-section-open" : ""}`}
                      style={{ ...baseBtn, gap: 10, padding: "10px 8px", color: TEXT, borderRadius: 8 }}
                    >
                      <Icon size={18} strokeWidth={2.5} style={{ flexShrink: 0, color: ACCENT }} />
                      <span style={{ flex: 1, fontSize: 15, fontWeight: 700, letterSpacing: "0.02em" }}>{section.label}</span>
                      <ChevronDown size={14} style={{
                        color: MUTED, flexShrink: 0,
                        transition: "transform 0.26s cubic-bezier(0.4,0,0.2,1)",
                        transform: isOpen ? "rotate(180deg)" : "none",
                      }} />
                    </button>

                    <div style={{
                      overflow:   "hidden",
                      maxHeight:  isOpen ? `${section.items.length * 48 + 16}px` : "0px",
                      opacity:    isOpen ? 1 : 0,
                      transition: "max-height 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.24s ease",
                    }}>
                      <div style={{ position: "relative", marginLeft: 4, paddingLeft: 20, paddingBottom: 8, paddingTop: 4, display: "flex", flexDirection: "column", gap: 2 }}>
                        <div style={{ position: "absolute", left: 7, top: 4, bottom: 8, width: 1.5, background: LINE_VERTICAL, borderRadius: 1 }} />
                        {section.items.map((sub) => {
                          const SubIcon  = sub.icon ?? null;
                          const isActive = activeId === sub.id;
                          return (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={() => activate(sub)}
                              className={`sb-nav-item${isActive ? " sb-nav-item-active" : ""}`}
                              style={{
                                ...baseBtn,
                                gap:        9,
                                padding:    "8px 10px",
                                color:      isActive ? TEXT : "rgba(255,255,255,0.55)",
                                fontWeight: isActive ? 600 : 400,
                                fontSize:   14,
                                borderRadius: 7,
                              }}
                            >
                              {SubIcon && <SubIcon size={15} strokeWidth={2} style={{ flexShrink: 0, color: isActive ? ACCENT : "rgba(255,255,255,0.4)" }} />}
                              {sub.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </nav>

            {/* ── Card de Faturamento ── */}
            <FaturamentoCard />

            {/* ── Rodapé fixo no fundo ── */}
            <div className="sb-footer" style={{
              flexShrink: 0,
              borderTop:  `1px solid ${SEP}`,
              padding:    "8px 10px 12px",
              display:    "flex",
              gap:        6,
            }}>
              {/* Central de Ajuda — metade esquerda */}
              <button
                type="button"
                onClick={() => { if (isOverlay) onOverlayClose?.(); }}
                className="sb-footer-btn"
                style={{
                  ...baseBtn,
                  flex: 1,
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                  padding: "10px 6px",
                  color: "rgba(255,255,255,0.42)",
                  fontSize: 11.5,
                  fontWeight: 500,
                  borderRadius: 8,
                  textAlign: "center",
                }}
              >
                <HelpCircle size={18} strokeWidth={1.6} />
                Central de Ajuda
              </button>

              {/* divisor vertical */}
              <div style={{ width: 1, background: SEP, alignSelf: "stretch", margin: "6px 0" }} />

              {/* Sair da Conta — metade direita */}
              <button
                type="button"
                onClick={() => { if (isOverlay) onOverlayClose?.(); }}
                className="sb-footer-logout"
                style={{
                  ...baseBtn,
                  flex: 1,
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                  padding: "10px 6px",
                  color: "rgba(243, 15, 34, 0.72)",
                  fontSize: 11.5,
                  fontWeight: 500,
                  borderRadius: 8,
                  textAlign: "center",
                }}
              >
                <LogOut size={18} strokeWidth={1.6} />
                Sair da Conta
              </button>
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════════════
            MODO RECOLHIDO — só ícones + tooltip
        ══════════════════════════════════════════════════ */}
        {collapsed && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, padding: "8px 10px", overflow: "hidden" }}>
            {MENU_ITEMS.map((item) => {
              const Icon     = item.icon;
              const isActive = activeId === item.id;
              return (
                <div key={item.id} style={{ position: "relative" }}>
                  <button type="button"
                    onClick={() => activate(item)}
                    onMouseEnter={() => setTooltipItem(item.id)}
                    onMouseLeave={() => setTooltipItem(null)}
                    style={{ ...baseBtn, height: 44, justifyContent: "center", borderRadius: 10, color: isActive ? ACCENT : MUTED }}>
                    <Icon size={21} strokeWidth={2} />
                  </button>
                  {tooltipItem === item.id && (
                    <div style={{ position: "absolute", left: "100%", marginLeft: 10, top: "50%", transform: "translateY(-50%)", padding: "7px 12px", background: "#1a0304", border: `1px solid ${BORDER}`, borderRadius: 8, color: TEXT, fontSize: 13, whiteSpace: "nowrap", zIndex: 10000, boxShadow: "0 4px 16px rgba(0,0,0,0.4)", pointerEvents: "none" }}>
                      {item.label}
                    </div>
                  )}
                </div>
              );
            })}

            <div style={{ height: 1, background: SEP, margin: "4px 0" }} />

            {EXPANDABLE.map((section) => {
              const Icon = section.icon;
              return (
                <div key={section.id} style={{ position: "relative" }}>
                  <button type="button"
                    onClick={(e) => openFloat(section, e)}
                    onMouseEnter={() => setTooltipItem(section.id)}
                    onMouseLeave={() => setTooltipItem(null)}
                    style={{ ...baseBtn, height: 44, justifyContent: "center", borderRadius: 10, color: ACCENT }}>
                    <Icon size={21} strokeWidth={2.5} />
                  </button>
                  {tooltipItem === section.id && !floatSection && (
                    <div style={{ position: "absolute", left: "100%", marginLeft: 10, top: "50%", transform: "translateY(-50%)", padding: "7px 12px", background: "#1a0304", border: `1px solid ${BORDER}`, borderRadius: 8, color: TEXT, fontSize: 13, whiteSpace: "nowrap", zIndex: 10000, boxShadow: "0 4px 16px rgba(0,0,0,0.4)", pointerEvents: "none" }}>
                      {section.label}
                    </div>
                  )}
                </div>
              );
            })}

            {/* ── Footer recolhido: Central de Ajuda + Sair da Conta ── */}
            <div style={{ marginTop: "auto", borderTop: `1px solid ${SEP}`, paddingTop: 6, display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Central de Ajuda */}
              <div style={{ position: "relative" }}>
                <button type="button"
                  onClick={() => { if (isOverlay) onOverlayClose?.(); }}
                  onMouseEnter={() => setTooltipItem("central-ajuda")}
                  onMouseLeave={() => setTooltipItem(null)}
                  className="sb-footer-btn"
                  style={{ ...baseBtn, height: 44, justifyContent: "center", borderRadius: 10, color: "rgba(255,255,255,0.42)" }}>
                  <HelpCircle size={20} strokeWidth={1.6} />
                </button>
                {tooltipItem === "central-ajuda" && (
                  <div style={{ position: "absolute", left: "100%", marginLeft: 10, top: "50%", transform: "translateY(-50%)", padding: "7px 12px", background: "#1a0304", border: `1px solid ${BORDER}`, borderRadius: 8, color: TEXT, fontSize: 13, whiteSpace: "nowrap", zIndex: 10000, boxShadow: "0 4px 16px rgba(0,0,0,0.4)", pointerEvents: "none" }}>
                    Central de Ajuda
                  </div>
                )}
              </div>
              {/* Sair da Conta */}
              <div style={{ position: "relative" }}>
                <button type="button"
                  onClick={() => { if (isOverlay) onOverlayClose?.(); }}
                  onMouseEnter={() => setTooltipItem("sair-conta")}
                  onMouseLeave={() => setTooltipItem(null)}
                  className="sb-footer-logout"
                  style={{ ...baseBtn, height: 44, justifyContent: "center", borderRadius: 10, color: "rgba(243,15,34,0.72)" }}>
                  <LogOut size={20} strokeWidth={1.6} />
                </button>
                {tooltipItem === "sair-conta" && (
                  <div style={{ position: "absolute", left: "100%", marginLeft: 10, top: "50%", transform: "translateY(-50%)", padding: "7px 12px", background: "#1a0304", border: `1px solid ${BORDER}`, borderRadius: 8, color: TEXT, fontSize: 13, whiteSpace: "nowrap", zIndex: 10000, boxShadow: "0 4px 16px rgba(0,0,0,0.4)", pointerEvents: "none" }}>
                    Sair da Conta
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </aside>

      {/* ── submenu flutuante (modo recolhido) ── */}
      {floatData && createPortal(
        <div ref={floatRef} style={{
          position: "fixed", left: floatPos.left, top: floatPos.top,
          minWidth: 200, padding: "6px 0",
          background: "#100203",
          backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)",
          borderRadius: 10, border: `1px solid ${BORDER}`,
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)", zIndex: 99999,
        }}>
          <p style={{ margin: 0, padding: "8px 14px 6px", fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {floatData.label}
          </p>
          {floatData.items.map((sub) => (
            <button key={sub.id} type="button"
              onClick={() => { activate(sub); setFloatSection(null); }}
              style={{ ...baseBtn, padding: "10px 14px", color: activeId === sub.id ? TEXT : MUTED, fontSize: 13, fontWeight: activeId === sub.id ? 600 : 400 }}>
              {sub.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}
