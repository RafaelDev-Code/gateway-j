import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

const DESKTOP_BP = 1024;
const STORAGE_KEY = "gjj-sidebar-collapsed";

export function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === "true";
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > DESKTOP_BP);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${DESKTOP_BP + 1}px)`);
    const handler = (e) => {
      setIsDesktop(e.matches);
      if (e.matches) setMobileOpen(false);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const handleToggleCollapse = () => {
    setCollapsed((c) => {
      localStorage.setItem(STORAGE_KEY, String(!c));
      return !c;
    });
  };

  const handleOpenMobile = () => setMobileOpen(true);
  const handleCloseMobile = () => setMobileOpen(false);

  const contentClass = [
    "app-content",
    isDesktop && collapsed ? "collapsed" : "",
    !isDesktop ? "full-width" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="app-shell">
      <Sidebar
        collapsed={isDesktop ? collapsed : false}
        onToggle={handleToggleCollapse}
        mobileOpen={mobileOpen}
        onMobileClose={handleCloseMobile}
      />

      <div className={contentClass}>
        <TopBar onMenuClick={handleOpenMobile} />
        <main className="app-main">
          {children}
        </main>
      </div>
    </div>
  );
}
