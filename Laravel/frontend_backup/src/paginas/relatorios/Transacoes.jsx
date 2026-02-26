import { useState } from "react";
import { ArrowLeftRight, Search, Download, TrendingUp, DollarSign, Activity } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { PageShell, Card, StatCard, StatusBadge } from "../../componentes/PageShell";
import { theme } from "../../theme";

const ACCENT     = theme.accent;
const TEXT       = theme.text;
const TEXT_MUTED = theme.textMuted;

const PERIODOS = ["7 dias", "30 dias", "90 dias"];

const GRAFICO = [
  { dia: "Seg", valor: 4200 }, { dia: "Ter", valor: 6800 }, { dia: "Qua", valor: 3900 },
  { dia: "Qui", valor: 8200 }, { dia: "Sex", valor: 7100 }, { dia: "Sáb", valor: 2100 }, { dia: "Dom", valor: 1500 },
];

const TRANSACOES = [
  { id: "TRX-0001", desc: "PIX recebido — João Silva",     valor: "+R$ 1.500,00", tipo: "entrada", data: "Hoje 14:32",    status: "concluido"   },
  { id: "TRX-0002", desc: "Saque — Bradesco ••2847",       valor: "-R$ 2.000,00", tipo: "saida",   data: "Hoje 09:14",    status: "concluido"   },
  { id: "TRX-0003", desc: "Cobrança paga — Maria Souza",   valor: "+R$ 450,00",   tipo: "entrada", data: "Ontem 16:20",   status: "concluido"   },
  { id: "TRX-0004", desc: "Taxa de processamento",         valor: "-R$ 12,50",    tipo: "saida",   data: "Ontem 16:20",   status: "concluido"   },
  { id: "TRX-0005", desc: "PIX recebido — Carlos Lima",    valor: "+R$ 800,00",   tipo: "entrada", data: "Seg 11:00",     status: "concluido"   },
  { id: "TRX-0006", desc: "Depósito TED — Ana Pereira",    valor: "+R$ 3.500,00", tipo: "entrada", data: "Dom 13:45",     status: "processando" },
  { id: "TRX-0007", desc: "Reembolso — Pedro Costa",       valor: "-R$ 300,00",   tipo: "saida",   data: "Sáb 08:45",     status: "concluido"   },
  { id: "TRX-0008", desc: "Cobrança paga — Lúcia Ferreira",valor: "+R$ 950,00",   tipo: "entrada", data: "Sex 17:30",     status: "concluido"   },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0d0204", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px" }}>
      <p style={{ margin: "0 0 4px", fontSize: 12, color: TEXT_MUTED }}>{label}</p>
      <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: TEXT }}>R$ {payload[0].value.toLocaleString("pt-BR")}</p>
    </div>
  );
};

export function Transacoes() {
  const [periodo, setPeriodo] = useState("7 dias");
  const [busca,   setBusca]   = useState("");
  const [filtro,  setFiltro]  = useState("todas");

  const lista = TRANSACOES.filter((t) => {
    const matchBusca = t.desc.toLowerCase().includes(busca.toLowerCase()) || t.id.toLowerCase().includes(busca.toLowerCase());
    const matchFiltro = filtro === "todas" || t.tipo === filtro;
    return matchBusca && matchFiltro;
  });

  return (
    <PageShell icon={ArrowLeftRight} title="Transações" subtitle="Histórico completo de movimentações"
      actions={
        <button className="btn-futurist btn-futurist-outline" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          <Download size={15} /> Exportar
        </button>
      }
    >
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        <StatCard icon={TrendingUp}    label="Volume total"     value="R$ 32.840,00" sub="↑ 12% vs. semana anterior" subColor="#22c55e" delay={0}   />
        <StatCard icon={DollarSign}    label="Entradas"         value="R$ 7.200,00"  sub="6 transações"               delay={60}  />
        <StatCard icon={Activity}      label="Saídas"           value="R$ 2.312,50"  sub="3 transações"               delay={120} />
        <StatCard icon={ArrowLeftRight} label="Total de operações" value="9"         sub="Neste período"              delay={180} />
      </div>

      {/* Gráfico */}
      <Card style={{ animation: "cardEnter 0.45s ease 200ms both" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: TEXT }}>Volume de transações</h3>
          <div style={{ display: "flex", gap: 6 }}>
            {PERIODOS.map((p) => (
              <button key={p} onClick={() => setPeriodo(p)} style={{ padding: "6px 14px", borderRadius: 99, border: "1px solid", borderColor: periodo === p ? ACCENT : "rgba(255,255,255,0.1)", background: periodo === p ? "rgba(243,15,34,0.1)" : "transparent", color: periodo === p ? ACCENT : TEXT_MUTED, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)", transition: "all 0.18s" }}>
                {p}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={GRAFICO} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="tgrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={ACCENT} stopOpacity={0.25} />
                <stop offset="95%" stopColor={ACCENT} stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{ fill: TEXT_MUTED, fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: TEXT_MUTED, fontSize: 11 }} tickFormatter={v => `${v / 1000}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="valor" stroke={ACCENT} strokeWidth={2} fill="url(#tgrad)" dot={false} activeDot={{ r: 5, fill: ACCENT }} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Tabela */}
      <Card style={{ animation: "cardEnter 0.45s ease 260ms both", padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "18px 20px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 8 }}>
            {["todas", "entrada", "saida"].map((f) => (
              <button key={f} onClick={() => setFiltro(f)} style={{ padding: "6px 14px", borderRadius: 99, border: "1px solid", borderColor: filtro === f ? ACCENT : "rgba(255,255,255,0.1)", background: filtro === f ? "rgba(243,15,34,0.1)" : "transparent", color: filtro === f ? ACCENT : TEXT_MUTED, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)", textTransform: "capitalize", transition: "all 0.18s" }}>
                {f === "todas" ? "Todas" : f === "entrada" ? "Entradas" : "Saídas"}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "rgba(255,255,255,0.04)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)" }}>
            <Search size={14} style={{ color: TEXT_MUTED }} />
            <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar..." style={{ background: "transparent", border: "none", outline: "none", color: TEXT, fontSize: 13, fontFamily: "var(--font-body)", width: 160 }} />
          </div>
        </div>
        <table style={{ width: "100%", minWidth: 580, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              {["ID", "Descrição", "Valor", "Data", "Status"].map((h) => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lista.map((t) => (
              <tr key={t.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "13px 16px", fontSize: 12, color: TEXT_MUTED, fontWeight: 600 }}>{t.id}</td>
                <td style={{ padding: "13px 16px", fontSize: 14, color: TEXT }}>{t.desc}</td>
                <td style={{ padding: "13px 16px", fontSize: 14, fontWeight: 700, color: t.tipo === "entrada" ? "#22c55e" : "#ef4444" }}>{t.valor}</td>
                <td style={{ padding: "13px 16px", fontSize: 12, color: TEXT_MUTED }}>{t.data}</td>
                <td style={{ padding: "13px 16px" }}><StatusBadge status={t.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </PageShell>
  );
}
