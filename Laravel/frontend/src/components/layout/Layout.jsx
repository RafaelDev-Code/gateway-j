import { useState, useEffect } from "react";
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

  return (
    <div className="shell">
      <Sidebar
        collapsed={isDesktop ? collapsed : false}
        onToggle={toggle}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className={mainCls}>
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}
