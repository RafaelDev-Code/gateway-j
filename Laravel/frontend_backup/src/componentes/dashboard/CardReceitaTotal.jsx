import { ArrowUpRight } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const dados = [
  { mes: "Jan", lucro: 12, perda: 4 },
  { mes: "Fev", lucro: 18, perda: 6 },
  { mes: "Mar", lucro: 15, perda: 8 },
  { mes: "Abr", lucro: 22, perda: 5 },
  { mes: "Mai", lucro: 28, perda: 10 },
  { mes: "Jun", lucro: 35, perda: 12 },
  { mes: "Jul", lucro: 42, perda: 8 },
  { mes: "Ago", lucro: 38, perda: 15 },
  { mes: "Set", lucro: 48, perda: 10 },
];

export function CardReceitaTotal() {
  return (
    <div className="dashboard-card p-5 min-h-[220px] flex flex-col">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 500, color: "#a3a3a3" }}>Receita Total</h3>
          <p style={{ fontSize: 12, color: "#737373", margin: "4px 0 0 0" }}>
            Veja sua receita em um determinado período
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
      <p style={{ fontSize: 12, color: "#a3a3a3", marginTop: 8, fontWeight: 500 }}>Lucro e Perda</p>
      <div style={{ flex: 1, minHeight: 160, marginTop: 8 }}>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={dados} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
            <XAxis
              dataKey="mes"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#a3a3a3", fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#a3a3a3", fontSize: 10 }}
              domain={[0, 50]}
              ticks={[0, 10, 20, 30, 40, 50]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#141414",
                border: "1px solid #262626",
                borderRadius: 8,
                padding: "10px 14px",
              }}
              labelStyle={{ color: "#a3a3a3" }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11 }}
              formatter={(value) => (value === "lucro" ? "Lucro" : "Perda")}
              iconType="circle"
              iconSize={8}
            />
            <Line
              type="monotone"
              dataKey="lucro"
              name="lucro"
              stroke="#38bdf8"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="perda"
              name="perda"
              stroke="#a3a3a3"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
