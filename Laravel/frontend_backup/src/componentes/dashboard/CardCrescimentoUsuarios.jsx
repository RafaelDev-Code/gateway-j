import { useState } from "react";
import { ArrowUpRight, TrendingUp } from "lucide-react";

const filtros = ["12h", "24h", "Semana", "Mês"];

export function CardCrescimentoUsuarios() {
  const [filtroAtivo, setFiltroAtivo] = useState("Semana");

  return (
    <div className="dashboard-card p-5 min-h-[220px] flex flex-col">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <h3 style={{ fontSize: 14, fontWeight: 500, color: "#a3a3a3" }}>Crescimento de Usuários</h3>
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
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
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
            className={filtroAtivo !== f ? "hover:bg-white/5 hover:text-white" : ""}
          >
            {f}
          </button>
        ))}
      </div>
      <div style={{ marginTop: 16, display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: "1.75rem", fontWeight: 700, color: "#fff" }}>187K</span>
        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 14, color: "#22c55e" }}>
          <TrendingUp size={14} /> +124 Hoje
        </span>
      </div>
      <div style={{ marginTop: 16, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="barra-progresso" style={{ flex: 1, height: 8 }}>
            <div className="barra-progresso-fill" style={{ width: "75%" }} />
          </div>
          <span style={{ fontSize: 12, color: "#737373" }}>Verificação tonal</span>
        </div>
      </div>
    </div>
  );
}
