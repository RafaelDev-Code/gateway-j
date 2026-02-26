import { Search, Bell, ChevronDown, Menu } from "lucide-react";

export function Header({ onMenuClick }) {
  return (
    <header
      className="header-bg"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "0 16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <button
          onClick={onMenuClick}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 40,
            height: 40,
            borderRadius: 10,
            border: "none",
            background: "transparent",
            color: "#a3a3a3",
            cursor: "pointer",
          }}
          className="lg:hidden hover:bg-white/5"
          aria-label="Abrir menu"
        >
          <Menu size={24} />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #38bdf8 0%, #a78bfa 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            F
          </div>
          <span style={{ fontWeight: 600, color: "#fff", fontSize: 16 }}>Finexa</span>
        </div>
        <span style={{ color: "#737373", fontSize: 14, marginLeft: 8 }} className="hidden md:inline">
          Início &gt; Dashboard
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 12px",
            borderRadius: 10,
            background: "#141414",
            border: "1px solid #262626",
            minWidth: 160,
            maxWidth: 200,
          }}
          className="hidden sm:flex"
        >
          <Search size={18} style={{ color: "#737373", flexShrink: 0 }} />
          <span style={{ color: "#737373", fontSize: 14 }}>Buscar</span>
        </div>
        <button
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            border: "none",
            background: "transparent",
            color: "#a3a3a3",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          className="hover:bg-white/5"
        >
          <Bell size={20} />
        </button>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "6px 12px",
            borderRadius: 10,
            border: "none",
            background: "transparent",
            cursor: "pointer",
          }}
          className="hover:bg-white/5"
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #38bdf8 0%, #a78bfa 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 600,
              fontSize: 12,
            }}
          >
            KM
          </div>
          <div style={{ textAlign: "left" }} className="hidden md:block">
            <p style={{ fontSize: 14, fontWeight: 500, color: "#fff", margin: 0 }}>Kathryn Murphy</p>
            <p style={{ fontSize: 12, color: "#737373", margin: 0 }}>Plano Premium</p>
          </div>
          <ChevronDown size={16} style={{ color: "#737373" }} className="hidden sm:block" />
        </button>
      </div>
    </header>
  );
}
