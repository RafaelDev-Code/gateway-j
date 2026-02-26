import { LayoutGrid, PiggyBank, Calendar, CreditCard, TrendingUp, Link2 } from "lucide-react";

const itensMenu = [
  { icone: LayoutGrid, label: "Analytics", ativo: true },
  { icone: PiggyBank, label: "Budget" },
  { icone: Calendar, label: "Calendar" },
  { icone: CreditCard, label: "Accounts" },
  { icone: TrendingUp, label: "Saving" },
  { icone: Link2, label: "Debts" },
];

export function SidebarCredz() {
  return (
    <aside
      className="sidebar-esquerda"
      style={{
        width: 260,
        minWidth: 260,
        padding: 24,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Perfil */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #eab308 0%, #ea580c 100%)",
              flexShrink: 0,
            }}
          />
          <div>
            <p style={{ margin: 0, fontWeight: 600, color: "#374151", fontSize: 15 }}>
              Jeremy Martins
            </p>
            <a
              href="#"
              style={{
                fontSize: 13,
                color: "#6b7280",
                textDecoration: "none",
              }}
              className="hover:underline"
            >
              Editar perfil
            </a>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
        {itensMenu.map((item) => {
          const Icon = item.icone;
          return (
            <button
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: item.ativo ? "12px 16px" : "12px 16px",
                border: "none",
                borderRadius: 9999,
                background: item.ativo ? "#374151" : "transparent",
                color: item.ativo ? "#fff" : "#374151",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                textAlign: "left",
              }}
              className={!item.ativo ? "hover:bg-gray-100" : ""}
            >
              <Icon size={20} strokeWidth={2} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Upgrade to Pro */}
      <div
        style={{
          marginTop: "auto",
          padding: 20,
          background: "#f9fafb",
          borderRadius: 12,
          border: "1px solid #e5e7eb",
        }}
      >
        <p style={{ margin: "0 0 4px 0", fontWeight: 600, color: "#374151", fontSize: 14 }}>
          Upgrade to Pro
        </p>
        <p style={{ margin: "0 0 12px 0", fontSize: 13, color: "#6b7280" }}>
          Get full access and benefits.
        </p>
        <button
          style={{
            width: "100%",
            padding: "10px 16px",
            background: "#374151",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          UPGRADE
        </button>
      </div>
    </aside>
  );
}
