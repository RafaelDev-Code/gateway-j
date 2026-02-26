import { TopBarFinexy } from "./TopBarFinexy";
import { SidebarFinexy } from "./SidebarFinexy";

export function Layout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8F8F8" }}>
      <SidebarFinexy />
      <div className="conteudo-main" style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <TopBarFinexy />
        <main style={{ flex: 1, padding: "16px 20px 20px 20px", overflow: "auto", background: "#F8F8F8", minWidth: 0 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
