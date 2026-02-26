import { ArrowUpRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const dados = [
  { dia: "Dom", valor: 400 },
  { dia: "Seg", valor: 620 },
  { dia: "Ter", valor: 380 },
  { dia: "Qua", valor: 857 },
  { dia: "Qui", valor: 720 },
  { dia: "Sex", valor: 590 },
];

export function CardEstatisticas() {
  return (
    <div className="dashboard-card p-5 min-h-[220px] flex flex-col">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <h3 style={{ fontSize: 14, fontWeight: 500, color: "#a3a3a3" }}>Estatísticas</h3>
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
      <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fff", margin: "8px 0 0 0" }}>
        R$ 147.480,00
      </p>
      <div style={{ flex: 1, minHeight: 120, marginTop: 16 }}>
        <ResponsiveContainer width="100%" height={120}>
          <AreaChart data={dados} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradEstatisticas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="dia"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#a3a3a3", fontSize: 11 }}
            />
            <YAxis hide domain={[0, 900]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#141414",
                border: "1px solid #262626",
                borderRadius: 8,
                padding: "10px 14px",
              }}
              formatter={(value) => [`R$ ${value}`, "Valor"]}
            />
            <Area
              type="monotone"
              dataKey="valor"
              stroke="#38bdf8"
              strokeWidth={2}
              fill="url(#gradEstatisticas)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p style={{ fontSize: 12, color: "#38bdf8", marginTop: 4, fontWeight: 500 }}>Qua: R$ 857</p>
    </div>
  );
}
