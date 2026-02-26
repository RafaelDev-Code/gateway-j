import { ChevronDown, TrendingUp, TrendingDown, Plus } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const dadosDonut = [
  { nome: "Entretenimento", valor: 30, cor: "#eab308" },
  { nome: "Casa", valor: 29, cor: "#e5e7eb" },
  { nome: "Filhos", valor: 41, cor: "#6b7280" },
];

export function PainelDireito() {
  return (
    <aside
      className="painel-direito painel-direito-resumo"
      style={{
        width: 320,
        minWidth: 320,
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 24,
        overflowY: "auto",
      }}
    >
      {/* Transações - Donut */}
      <div className="card-escuro" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#e5e7eb" }}>Transações</h3>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "6px 10px",
              background: "transparent",
              border: "1px solid #4b5563",
              borderRadius: 8,
              color: "#9ca3af",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Por gastos <ChevronDown size={14} />
          </button>
        </div>
        <div style={{ height: 180, position: "relative" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dadosDonut}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={2}
                dataKey="valor"
              >
                {dadosDonut.map((entry, index) => (
                  <Cell key={index} fill={entry.cor} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#25282d",
                  border: "1px solid #374151",
                  borderRadius: 8,
                }}
                formatter={(value, name) => [`${value}%`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: 24,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            12K
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#9ca3af" }}>
            <span>Entretenimento 30%</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#9ca3af" }}>
            <span>Casa 29%</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#eab308" }}>
            <span>Filhos 41%</span>
          </div>
        </div>
        <button
          style={{
            marginTop: 12,
            width: "100%",
            padding: "8px 12px",
            background: "transparent",
            border: "1px dashed #4b5563",
            borderRadius: 8,
            color: "#9ca3af",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Adicionar categoria +
        </button>
      </div>

      {/* Saldo total */}
      <div className="card-escuro" style={{ padding: 20 }}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: 15, fontWeight: 600, color: "#e5e7eb" }}>
          Saldo total
        </h3>
        <p style={{ margin: "0 0 16px 0", fontSize: 28, fontWeight: 700, color: "#fff" }}>R$ 15.300</p>
        <div
          style={{
            height: 10,
            background: "#374151",
            borderRadius: 9999,
            overflow: "hidden",
            marginBottom: 8,
          }}
        >
          <div
            style={{
              width: "56%",
              height: "100%",
              background: "#eab308",
              borderRadius: 9999,
            }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#9ca3af", marginBottom: 4 }}>
          <span>R$ 1.260</span>
          <span>56%</span>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: "#9ca3af" }}>Limite de pagamento mensal R$ 2.590</p>
      </div>

      {/* Outcome / Income */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="card-escuro" style={{ padding: 16, textAlign: "center" }}>
          <TrendingUp size={20} style={{ color: "#9ca3af", marginBottom: 8 }} />
          <p style={{ margin: "0 0 4px 0", fontSize: 12, color: "#9ca3af" }}>Saídas</p>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#fff" }}>R$ 3.600</p>
        </div>
        <div className="card-escuro" style={{ padding: 16, textAlign: "center" }}>
          <TrendingDown size={20} style={{ color: "#9ca3af", marginBottom: 8 }} />
          <p style={{ margin: "0 0 4px 0", fontSize: 12, color: "#9ca3af" }}>Entradas</p>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#fff" }}>R$ 10.400</p>
        </div>
      </div>

      {/* Cartões de saldo atual */}
      <div className="card-escuro" style={{ padding: 16 }}>
        <p style={{ margin: "0 0 8px 0", fontSize: 12, color: "#9ca3af" }}>Saldo atual</p>
        <p style={{ margin: "0 0 8px 0", fontSize: 20, fontWeight: 700, color: "#eab308" }}>R$ 5.750</p>
        <p style={{ margin: "0 0 4px 0", fontSize: 13, color: "#6b7280", letterSpacing: 1 }}>
          5282 3456 7890 1289
        </p>
        <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>09/25</p>
        <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
          <div
            style={{
              width: 44,
              height: 24,
              borderRadius: 12,
              background: "#374151",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 2,
                right: 2,
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "#eab308",
              }}
            />
          </div>
        </div>
      </div>
      <div className="card-escuro" style={{ padding: 16 }}>
        <p style={{ margin: "0 0 8px 0", fontSize: 12, color: "#9ca3af" }}>Saldo atual</p>
        <p style={{ margin: "0 0 8px 0", fontSize: 20, fontWeight: 700, color: "#eab308" }}>R$ 1.200</p>
        <p style={{ margin: "0 0 4px 0", fontSize: 13, color: "#6b7280", letterSpacing: 1 }}>
          5129 2874 1963 3773
        </p>
        <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>02/25</p>
        <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
          <div
            style={{
              width: 44,
              height: 24,
              borderRadius: 12,
              background: "#374151",
            }}
          />
        </div>
      </div>

      {/* Botão + */}
      <button
        style={{
          width: "100%",
          height: 56,
          borderRadius: 12,
          border: "2px dashed #4b5563",
          background: "transparent",
          color: "#9ca3af",
          fontSize: 24,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Plus size={28} />
      </button>
    </aside>
  );
}
