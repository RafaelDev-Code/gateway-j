import { Calendar, Plus } from "lucide-react";

export function TopBar() {
  return (
    <header
      style={{
        height: 72,
        background: "#ffffff",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* Logo Credz - C e Z amarelos em fundo escuro */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: "#374151",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#eab308",
            fontWeight: 800,
            fontSize: 18,
          }}
        >
          CZ
        </div>
        <span style={{ fontSize: 20, fontWeight: 700, color: "#374151" }}>Credz</span>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#374151", margin: 0, marginLeft: 8 }}>
          Dashboard
        </h1>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 14px",
            background: "#f9fafb",
            borderRadius: 10,
            border: "1px solid #e5e7eb",
            color: "#6b7280",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          <Calendar size={18} />
          25 Fev, 23 - 25 Fev, 24
        </div>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 18px",
            background: "#ea580c",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          <Plus size={18} strokeWidth={2.5} />
          Transação
        </button>
      </div>
    </header>
  );
}
