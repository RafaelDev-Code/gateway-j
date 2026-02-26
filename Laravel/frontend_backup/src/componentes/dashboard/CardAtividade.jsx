import { ArrowUpRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const dados = [
  { dia: "Sáb", horas: 22, ativo: false },
  { dia: "Dom", horas: 18, ativo: false },
  { dia: "Seg", horas: 28, ativo: false },
  { dia: "Ter", horas: 25, ativo: false },
  { dia: "Qua", horas: 12, ativo: true },
  { dia: "Qui", horas: 30, ativo: false },
  { dia: "Sex", horas: 26, ativo: false },
];

export function CardAtividade() {
  return (
    <div className="dashboard-card p-5 min-h-[220px] flex flex-col">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <h3 style={{ fontSize: 14, fontWeight: 500, color: "#a3a3a3" }}>Atividade</h3>
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
      <p style={{ fontSize: 18, fontWeight: 600, color: "#fff", margin: "8px 0 0 0" }}>
        Trabalhou esta semana 187h
      </p>
      <div style={{ flex: 1, minHeight: 120, marginTop: 16 }}>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={dados} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="dia"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#a3a3a3", fontSize: 11 }}
            />
            <YAxis hide domain={[0, 35]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#141414",
                border: "1px solid #262626",
                borderRadius: 8,
                padding: "10px 14px",
              }}
              labelStyle={{ color: "#a3a3a3" }}
              formatter={(value) => [`${value}h`, "Horas"]}
            />
            <Bar dataKey="horas" radius={[4, 4, 0, 0]} maxBarSize={28}>
              {dados.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.ativo ? "#38bdf8" : "rgba(255,255,255,0.15)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
