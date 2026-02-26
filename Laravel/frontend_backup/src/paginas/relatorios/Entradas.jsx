import { TrendingUp, DollarSign, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { PageShell, Card, StatCard, StatusBadge } from "../../componentes/PageShell";
import { theme } from "../../theme";

const ACCENT = theme.accent; const TEXT = theme.text; const TEXT_MUTED = theme.textMuted;

const GRAFICO = [
  { mes: "Ago", valor: 8200 }, { mes: "Set", valor: 6500 }, { mes: "Out", valor: 9400 },
  { mes: "Nov", valor: 7800 }, { mes: "Dez", valor: 11200 }, { mes: "Jan", valor: 7200 },
];

const ENTRADAS = [
  { id: "ENT-001", desc: "PIX — João Silva",          valor: "R$ 1.500,00", origem: "João Silva",    data: "Hoje 14:32",   status: "concluido"   },
  { id: "ENT-002", desc: "Cobrança paga #COB-001",    valor: "R$ 450,00",   origem: "Cobrança",      data: "Ontem 16:20",  status: "concluido"   },
  { id: "ENT-003", desc: "TED — Ana Pereira",         valor: "R$ 3.500,00", origem: "Ana Pereira",   data: "Seg 13:45",    status: "processando" },
  { id: "ENT-004", desc: "PIX — Carlos Lima",         valor: "R$ 800,00",   origem: "Carlos Lima",   data: "Dom 11:00",    status: "concluido"   },
  { id: "ENT-005", desc: "Cobrança paga #COB-005",    valor: "R$ 950,00",   origem: "Cobrança",      data: "Sex 17:30",    status: "concluido"   },
];

export function Entradas() {
  return (
    <PageShell icon={TrendingUp} title="Entradas" subtitle="Todas as receitas e créditos recebidos">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        <StatCard icon={DollarSign} label="Total recebido"  value="R$ 7.200,00" sub="↑ 18% vs. mês anterior" subColor="#22c55e" delay={0}  />
        <StatCard icon={TrendingUp} label="Ticket médio"    value="R$ 1.440,00" sub="5 entradas"              delay={60}  />
        <StatCard icon={Activity}   label="Maior entrada"   value="R$ 3.500,00" sub="TED — Ana Pereira"       delay={120} />
      </div>

      <Card style={{ animation: "cardEnter 0.45s ease 200ms both" }}>
        <h3 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 700, color: TEXT }}>Entradas por mês</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={GRAFICO} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: TEXT_MUTED, fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: TEXT_MUTED, fontSize: 11 }} tickFormatter={v => `${v / 1000}k`} />
            <Tooltip contentStyle={{ background: "#0d0204", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10 }} labelStyle={{ color: TEXT_MUTED }} itemStyle={{ color: "#22c55e" }} formatter={v => [`R$ ${v.toLocaleString("pt-BR")}`, "Entradas"]} />
            <Bar dataKey="valor" radius={[6, 6, 0, 0]} maxBarSize={36}>
              {GRAFICO.map((_, i) => <Cell key={i} fill={i === GRAFICO.length - 1 ? "#22c55e" : "rgba(34,197,94,0.35)"} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card style={{ animation: "cardEnter 0.45s ease 260ms both", padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "18px 20px 12px" }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: TEXT }}>Detalhamento de entradas</h3>
        </div>
        <table style={{ width: "100%", minWidth: 540, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              {["ID", "Descrição", "Origem", "Valor", "Data", "Status"].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ENTRADAS.map(e => (
              <tr key={e.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "13px 16px", fontSize: 12, color: TEXT_MUTED, fontWeight: 600 }}>{e.id}</td>
                <td style={{ padding: "13px 16px", fontSize: 14, color: TEXT }}>{e.desc}</td>
                <td style={{ padding: "13px 16px", fontSize: 13, color: TEXT_MUTED }}>{e.origem}</td>
                <td style={{ padding: "13px 16px", fontSize: 14, fontWeight: 700, color: "#22c55e" }}>{e.valor}</td>
                <td style={{ padding: "13px 16px", fontSize: 12, color: TEXT_MUTED }}>{e.data}</td>
                <td style={{ padding: "13px 16px" }}><StatusBadge status={e.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </PageShell>
  );
}
