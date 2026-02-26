import { useState } from "react";
import { ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";

const filtros = ["Semana", "Mês", "Ano"];

export function CardDinheiroGuardado() {
  const [filtroAtivo, setFiltroAtivo] = useState("Semana");

  return (
    <div className="dashboard-card p-5 min-h-[220px] flex flex-col">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 500, color: "#a3a3a3" }}>Dinheiro Guardado</h3>
          <p style={{ fontSize: 12, color: "#737373", margin: "4px 0 0 0" }}>
            Acompanhe como seu dinheiro está sendo utilizado
          </p>
        </div>
        <button
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            border: "none",
            background: "transparent",
            color: "#a3a3a3",
            cursor: "pointer",
          }}
          className="hover:bg-white/5"
        >
          <ArrowUpRight size={18} />
        </button>
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
        {filtros.map((f) => (
          <button
            key={f}
            onClick={() => setFiltroAtivo(f)}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 500,
              border: "none",
              cursor: "pointer",
              background: filtroAtivo === f ? "rgba(56, 189, 248, 0.2)" : "transparent",
              color: filtroAtivo === f ? "#38bdf8" : "#737373",
            }}
            className={filtroAtivo !== f ? "hover:bg-white/5" : ""}
          >
            {f}
          </button>
        ))}
      </div>
      <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#22c55e" }}>
            <TrendingUp size={18} />
          </span>
          <div>
            <p style={{ fontSize: 20, fontWeight: 700, color: "#fff", margin: 0 }}>R$ 1.320,00</p>
            <p style={{ fontSize: 12, color: "#737373", margin: 0 }}>Receita</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#ef4444" }}>
            <TrendingDown size={18} />
          </span>
          <div>
            <p style={{ fontSize: 20, fontWeight: 700, color: "#fff", margin: 0 }}>R$ 856,82</p>
            <p style={{ fontSize: 12, color: "#737373", margin: 0 }}>Despesas</p>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 20 }}>
        <div
          style={{
            height: 8,
            borderRadius: 9999,
            background: "rgba(255,255,255,0.1)",
            overflow: "hidden",
            display: "flex",
          }}
        >
          <div
            style={{
              width: "61%",
              height: "100%",
              borderRadius: "9999px 0 0 9999px",
              background: "#22c55e",
            }}
          />
          <div
            style={{
              width: "39%",
              height: "100%",
              borderRadius: "0 9999px 9999px 0",
              background: "rgba(239, 68, 68, 0.6)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
