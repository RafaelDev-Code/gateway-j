import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

const DESKTOP_BP = 1024;
const KEY = "gjj-sb-collapsed";

export function Layout({ children }) {
  const [collapsed,  setCollapsed]  = useState(() => localStorage.getItem(KEY) === "true");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop,  setIsDesktop]  = useState(window.innerWidth > DESKTOP_BP);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${DESKTOP_BP + 1}px)`);
    const fn = (e) => {
      setIsDesktop(e.matches);
      if (e.matches) setSidebarOpen(false);
    };
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  const toggle = () => {
    setCollapsed((c) => { localStorage.setItem(KEY, String(!c)); return !c; });
  };

  const mainCls = [
    "main-wrap",
    isDesktop && collapsed ? "collapsed" : "",
  ].filter(Boolean).join(" ");

  const sbCollapsed = isDesktop ? collapsed : false;
  const toggleLeft = sbCollapsed ? "calc(var(--sb-collapsed) - 12px)" : "calc(var(--sb-width) - 12px)";

  return (
    <div className="shell">
      <Sidebar
        collapsed={sbCollapsed}
        onToggle={toggle}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Toggle fora da sidebar — nunca cortado por overflow */}
      {isDesktop && (
        <button
          className="sb-toggle"
          onClick={toggle}
          title={sbCollapsed ? "Expandir" : "Recolher"}
          style={{ left: toggleLeft }}
        >
          {sbCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      )}

      <div className={mainCls}>
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}
