import { TrendingDown, DollarSign, ArrowUpRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { PageShell, Card, StatCard, StatusBadge } from "../../componentes/PageShell";
import { theme } from "../../theme";

const TEXT = theme.text; const TEXT_MUTED = theme.textMuted; const ACCENT = theme.accent;

const GRAFICO = [
  { mes: "Ago", valor: 1800 }, { mes: "Set", valor: 2400 }, { mes: "Out", valor: 1600 },
  { mes: "Nov", valor: 3200 }, { mes: "Dez", valor: 2800 }, { mes: "Jan", valor: 2312 },
];

const SAIDAS = [
  { id: "SAI-001", desc: "Saque — Bradesco ••2847",   valor: "R$ 2.000,00", tipo: "Saque",  data: "Hoje 09:14",   status: "concluido" },
  { id: "SAI-002", desc: "Taxa de processamento",     valor: "R$ 12,50",    tipo: "Taxa",   data: "Ontem 16:20",  status: "concluido" },
  { id: "SAI-003", desc: "Reembolso — Pedro Costa",   valor: "R$ 300,00",   tipo: "Reemb.", data: "Sáb 08:45",    status: "concluido" },
];

export function Saidas() {
  return (
    <PageShell icon={TrendingDown} title="Saídas" subtitle="Todos os débitos, saques e despesas">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        <StatCard icon={DollarSign}    label="Total de saídas"   value="R$ 2.312,50" sub="↓ 8% vs. mês anterior" subColor="#ef4444" delay={0}   />
        <StatCard icon={ArrowUpRight}  label="Saques"            value="R$ 2.000,00" sub="1 saque realizado"      delay={60}  />
        <StatCard icon={TrendingDown}  label="Taxas cobradas"    value="R$ 12,50"    sub="Processamento"          delay={120} />
      </div>

      <Card style={{ animation: "cardEnter 0.45s ease 200ms both" }}>
        <h3 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 700, color: TEXT }}>Saídas por mês</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={GRAFICO} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: TEXT_MUTED, fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: TEXT_MUTED, fontSize: 11 }} tickFormatter={v => `${v / 1000}k`} />
            <Tooltip contentStyle={{ background: "#0d0204", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10 }} labelStyle={{ color: TEXT_MUTED }} itemStyle={{ color: "#ef4444" }} formatter={v => [`R$ ${v.toLocaleString("pt-BR")}`, "Saídas"]} />
            <Bar dataKey="valor" radius={[6, 6, 0, 0]} maxBarSize={36}>
              {GRAFICO.map((_, i) => <Cell key={i} fill={i === GRAFICO.length - 1 ? "#ef4444" : "rgba(239,68,68,0.35)"} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card style={{ animation: "cardEnter 0.45s ease 260ms both", padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "18px 20px 12px" }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: TEXT }}>Detalhamento de saídas</h3>
        </div>
        <table style={{ width: "100%", minWidth: 520, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              {["ID", "Descrição", "Tipo", "Valor", "Data", "Status"].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SAIDAS.map(s => (
              <tr key={s.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "13px 16px", fontSize: 12, color: TEXT_MUTED, fontWeight: 600 }}>{s.id}</td>
                <td style={{ padding: "13px 16px", fontSize: 14, color: TEXT }}>{s.desc}</td>
                <td style={{ padding: "13px 16px", fontSize: 13, color: TEXT_MUTED }}>{s.tipo}</td>
                <td style={{ padding: "13px 16px", fontSize: 14, fontWeight: 700, color: "#ef4444" }}>{s.valor}</td>
                <td style={{ padding: "13px 16px", fontSize: 12, color: TEXT_MUTED }}>{s.data}</td>
                <td style={{ padding: "13px 16px" }}><StatusBadge status={s.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </PageShell>
  );
}
