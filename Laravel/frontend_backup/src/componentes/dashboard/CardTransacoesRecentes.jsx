import { ArrowUpRight, ArrowDownRight } from "lucide-react";

const transacoes = [
  { id: 1, descricao: "Depósito PIX", valor: 150.0, tipo: "entrada", data: "Hoje, 14:32" },
  { id: 2, descricao: "Saque", valor: -80.5, tipo: "saida", data: "Hoje, 12:15" },
  { id: 3, descricao: "Transferência recebida", valor: 320.0, tipo: "entrada", data: "Ontem, 18:00" },
  { id: 4, descricao: "Pagamento", valor: -45.9, tipo: "saida", data: "Ontem, 09:22" },
  { id: 5, descricao: "Depósito PIX", valor: 500.0, tipo: "entrada", data: "24 Jan, 16:45" },
];

export function CardTransacoesRecentes() {
  return (
    <div className="dashboard-card p-5">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 500, color: "#a3a3a3" }}>Transações Recentes</h3>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            borderRadius: 8,
            border: "none",
            background: "transparent",
            color: "#a3a3a3",
            cursor: "pointer",
            fontSize: 12,
          }}
          className="hover:bg-white/5 hover:text-white"
        >
          Ver todas <ArrowUpRight size={14} />
        </button>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", minWidth: 400, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #262626" }}>
              <th
                style={{
                  textAlign: "left",
                  padding: "12px 8px",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#a3a3a3",
                }}
              >
                Descrição
              </th>
              <th
                style={{
                  textAlign: "right",
                  padding: "12px 8px",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#a3a3a3",
                }}
              >
                Valor
              </th>
              <th
                style={{
                  textAlign: "right",
                  padding: "12px 8px",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#a3a3a3",
                }}
                className="hidden sm:table-cell"
              >
                Data
              </th>
            </tr>
          </thead>
          <tbody>
            {transacoes.map((t) => (
              <tr
                key={t.id}
                style={{
                  borderBottom: "1px solid rgba(38,38,38,0.5)",
                }}
                className="hover:bg-white/[0.02]"
              >
                <td style={{ padding: "14px 8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: t.tipo === "entrada" ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)",
                      }}
                    >
                      {t.tipo === "entrada" ? (
                        <ArrowDownRight size={14} style={{ color: "#22c55e" }} />
                      ) : (
                        <ArrowUpRight size={14} style={{ color: "#ef4444" }} />
                      )}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: "#fff" }}>{t.descricao}</span>
                  </div>
                </td>
                <td
                  style={{
                    padding: "14px 8px",
                    textAlign: "right",
                    fontWeight: 600,
                    fontSize: 14,
                    color: t.valor >= 0 ? "#22c55e" : "#ef4444",
                  }}
                >
                  {t.valor >= 0 ? "+" : ""}R$ {Math.abs(t.valor).toFixed(2).replace(".", ",")}
                </td>
                <td
                  style={{
                    padding: "14px 8px",
                    textAlign: "right",
                    fontSize: 12,
                    color: "#737373",
                  }}
                  className="hidden sm:table-cell"
                >
                  {t.data}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
