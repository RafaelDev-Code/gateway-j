import { RefreshCw, HelpCircle, Bell, Moon, User } from "lucide-react";

const COR_DESTAQUE = "#AEDB2F";

function getSaudacao() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Bom dia";
  if (h >= 12 && h < 18) return "Boa tarde";
  if (h >= 18 && h < 24) return "Boa noite";
  return "Boa madrugada";
}

function getDataFormatada() {
  const options = { day: "numeric", month: "long", year: "numeric", weekday: "long" };
  return new Date().toLocaleDateString("pt-BR", options);
}

export function TopBarFinexy() {
  const saudacao = getSaudacao();
  const dataCompleta = getDataFormatada();

  return (
    <header
      style={{
        minHeight: 80,
        background: "#fff",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px 0 20px",
        flexShrink: 0,
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      <div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#1f2937" }}>
          {saudacao}, Code1 👋
        </h1>
        <p style={{ margin: "6px 0 0 0", fontSize: 14, color: "#6b7280", fontWeight: 400 }}>
          {dataCompleta}
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button
          style={{
            width: 42,
            height: 42,
            borderRadius: 10,
            border: "none",
            background: "transparent",
            color: "#374151",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          className="hover:bg-gray-100"
          aria-label="Atualizar"
        >
          <RefreshCw size={20} />
        </button>

        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 20px",
            background: COR_DESTAQUE,
            color: "#1f2937",
            border: "none",
            borderRadius: 9999,
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
          }}
        >
          <HelpCircle size={20} strokeWidth={2} />
          Central de Ajuda
        </button>

        <div style={{ width: 1, height: 24, background: "#e5e7eb" }} />

        <button
          style={{
            width: 42,
            height: 42,
            borderRadius: 10,
            border: "none",
            background: "transparent",
            color: "#374151",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
          className="hover:bg-gray-100"
          aria-label="Notificações"
        >
          <Bell size={20} />
          <span
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: COR_DESTAQUE,
              border: "2px solid #fff",
            }}
          />
        </button>

        <button
          style={{
            width: 42,
            height: 42,
            borderRadius: 10,
            border: "none",
            background: "transparent",
            color: "#374151",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          className="hover:bg-gray-100"
          aria-label="Modo escuro"
        >
          <Moon size={20} />
        </button>

        <button
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            border: "none",
            background: COR_DESTAQUE,
            color: "#1f2937",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="Perfil"
        >
          <User size={22} strokeWidth={2} />
        </button>
      </div>
    </header>
  );
}
