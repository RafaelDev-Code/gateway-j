import { useState, useEffect } from "react";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { TopBarVorix } from "./TopBarVorix";
import { SidebarVorix, SIDEBAR_WIDTH_EXPANDED, SIDEBAR_WIDTH_COLLAPSED } from "./SidebarVorix";

/** Breakpoint: abaixo disso o menu lateral vira drawer (ícone hamburger na TopBar). */
const SIDEBAR_DRAWER_BREAKPOINT = 1024;

export function LayoutVorix({ children, pageTitle = "Pagamentos" }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isDrawerMode = useMediaQuery(`(max-width: ${SIDEBAR_DRAWER_BREAKPOINT}px)`);
  const sidebarWidth = sidebarCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;
  const mainMarginLeft = isDrawerMode ? 0 : sidebarWidth;

  // Bloquear scroll do body quando o menu overlay está aberto (mobile/tablet)
  useEffect(() => {
    if (isDrawerMode && mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [isDrawerMode, mobileMenuOpen]);

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        overflow: "visible",
      }}
    >
      {/* Fundo mais escuro + iluminação forte em várias áreas + vermelho/branco sutil (superior esquerda e outras) */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          background: `
            radial-gradient(ellipse 100% 90% at 8% 12%, rgba(255, 255, 255, 0.1) 0%, rgba(243, 15, 34, 0.04) 35%, transparent 55%),
            radial-gradient(ellipse 90% 80% at 92% 18%, rgba(255, 255, 255, 0.09) 0%, transparent 48%),
            radial-gradient(ellipse 80% 60% at 50% 98%, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
            radial-gradient(ellipse 60% 60% at 50% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 58%),
            radial-gradient(ellipse 70% 50% at 78% 40%, rgba(243, 15, 34, 0.06) 0%, rgba(255, 255, 255, 0.02) 40%, transparent 55%),
            radial-gradient(ellipse 50% 50% at 20% 75%, rgba(255, 255, 255, 0.04) 0%, rgba(243, 15, 34, 0.03) 50%, transparent 60%),
            radial-gradient(ellipse 55% 45% at 85% 80%, rgba(255, 255, 255, 0.03) 0%, transparent 55%),
            #060102
          `,
        }}
      />
      {/* Chuvisco / grain no fundo — destaque para ver o blur dos cards */}
      <div
        className="layout-bg-grain"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      <SidebarVorix
        collapsed={sidebarCollapsed}
        onToggle={setSidebarCollapsed}
        isOverlay={isDrawerMode}
        overlayOpen={mobileMenuOpen}
        onOverlayClose={() => setMobileMenuOpen(false)}
      />
      <div
        style={{
          position: "relative",
          zIndex: 0,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          marginLeft: mainMarginLeft,
          transition: "margin-left 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)",
        }}
      >
        <TopBarVorix
          pageTitle={pageTitle}
          showMenuButton={isDrawerMode}
          onMenuClick={() => setMobileMenuOpen((o) => !o)}
        />
        <main
          className="conteudo-main dashboard-page"
          style={{
            flex: 1,
            overflow: "auto",
            background: "transparent",
            minWidth: 0,
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
