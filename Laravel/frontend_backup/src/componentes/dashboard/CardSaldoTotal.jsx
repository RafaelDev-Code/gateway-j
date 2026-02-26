import { ArrowUpRight } from "lucide-react";

export function CardSaldoTotal() {
  return (
    <div className="dashboard-card relative overflow-hidden min-h-[220px]">
      <div
        className="gradiente-saldo"
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.9,
        }}
      />
      <div style={{ position: "relative", padding: 24, display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <h3 style={{ fontSize: 14, fontWeight: 500, color: "#a3a3a3" }}>Saldo Total</h3>
          <button
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              border: "none",
              background: "rgba(255,255,255,0.1)",
              color: "#a3a3a3",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            className="hover:bg-white/15 hover:text-white"
          >
            <ArrowUpRight size={18} />
          </button>
        </div>
        <div style={{ marginTop: 20 }}>
          <p style={{ fontSize: 12, color: "#737373", marginBottom: 4 }}>Saldo atual</p>
          <p style={{ fontSize: "2rem", fontWeight: 700, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>
            R$ 32.568,00
          </p>
        </div>
        <div style={{ marginTop: "auto", paddingTop: 20, display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
          <span style={{ color: "#737373" }}>Mês passado 28.940,00 BRL</span>
          <span className="tag-tempo">4h</span>
        </div>
      </div>
    </div>
  );
}
