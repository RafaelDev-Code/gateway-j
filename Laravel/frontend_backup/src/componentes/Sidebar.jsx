import { Home, Wallet, ArrowLeftRight, Settings } from "lucide-react";

const itensMenu = [
  { icone: Home, label: "Início", ativo: true },
  { icone: Wallet, label: "Contas", ativo: false },
  { icone: ArrowLeftRight, label: "Transações", ativo: false },
  { icone: Settings, label: "Configurações", ativo: false },
];

export function Sidebar({ aberto, onToggle }) {
  return (
    <>
      {aberto && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 40,
          }}
          className="lg:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}
      <aside
        className="sidebar-bg sidebar-desktop"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 50,
          width: 80,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxShadow: "4px 0 24px rgba(0,0,0,0.3)",
          transform: aberto ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease",
        }}
      >
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            borderBottom: "1px solid #262626",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            F
          </div>
        </div>
        <nav
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            paddingTop: 24,
            width: "100%",
          }}
        >
          {itensMenu.map((item) => {
            const Icon = item.icone;
            return (
              <button
                key={item.label}
                className={item.ativo ? "menu-item-ativo" : "menu-item-inativo"}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                  border: "none",
                  cursor: "pointer",
                }}
                title={item.label}
              >
                <Icon size={22} strokeWidth={2} />
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
