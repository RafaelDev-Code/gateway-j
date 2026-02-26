import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  DollarSign,
  ArrowUpFromLine,
  QrCode,
  RefreshCw,
  MoreHorizontal,
  Eye,
  EyeOff,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  Filter,
  Download,
  Calendar,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  Area,
  AreaChart,
  Legend,
} from "recharts";

/* ─── Mock data ─── */
const MONTHLY_DATA = [
  { mes: "Jan", entradas: 42000, saidas: 18000 },
  { mes: "Fev", entradas: 38000, saidas: 21000 },
  { mes: "Mar", entradas: 55000, saidas: 24000 },
  { mes: "Abr", entradas: 47000, saidas: 19000 },
  { mes: "Mai", entradas: 63000, saidas: 28000 },
  { mes: "Jun", entradas: 58000, saidas: 22000 },
  { mes: "Jul", entradas: 72000, saidas: 31000 },
  { mes: "Ago", entradas: 68000, saidas: 27000 },
  { mes: "Set", entradas: 80000, saidas: 34000 },
  { mes: "Out", entradas: 74000, saidas: 29000 },
  { mes: "Nov", entradas: 91000, saidas: 38000 },
  { mes: "Dez", entradas: 86000, saidas: 32000 },
];

const WEEKLY_DATA = [
  { dia: "Seg", valor: 12400 },
  { dia: "Ter", valor: 18200 },
  { dia: "Qua", valor: 15800 },
  { dia: "Qui", valor: 22100 },
  { dia: "Sex", valor: 19600 },
  { dia: "Sáb", valor: 9800 },
  { dia: "Dom", valor: 7200 },
];

const ACQUIRERS = [
  { name: "PagPix",  status: "online",   latency: "42ms"  },
  { name: "RapDyn",  status: "online",   latency: "38ms"  },
  { name: "WiteTec", status: "online",   latency: "61ms"  },
  { name: "Strike",  status: "degraded", latency: "180ms" },
  { name: "Versell", status: "online",   latency: "55ms"  },
  { name: "BSPay",   status: "offline",  latency: "—"     },
];

const RECENT_TXS = [
  { id: "TXN-8821", tipo: "PIX Entrada", cliente: "Loja do João",    valor: 1250.00,  status: "aprovado",   adq: "PagPix",  data: "26/02 14:32" },
  { id: "TXN-8820", tipo: "PIX Saída",   cliente: "Fornecedor ABC",  valor: -340.50,  status: "aprovado",   adq: "RapDyn",  data: "26/02 13:18" },
  { id: "TXN-8819", tipo: "PIX Entrada", cliente: "Maria Silva",     valor: 5000.00,  status: "pendente",   adq: "WiteTec", data: "26/02 12:45" },
  { id: "TXN-8818", tipo: "PIX Saída",   cliente: "Saque Manual",    valor: -2000.00, status: "aprovado",   adq: "PagPix",  data: "26/02 11:20" },
  { id: "TXN-8817", tipo: "PIX Entrada", cliente: "E-commerce XYZ",  valor: 785.90,   status: "aprovado",   adq: "Versell", data: "26/02 10:55" },
  { id: "TXN-8816", tipo: "PIX Entrada", cliente: "Carlos Pereira",  valor: 320.00,   status: "falhou",     adq: "Strike",  data: "26/02 09:30" },
  { id: "TXN-8815", tipo: "PIX Saída",   cliente: "Estorno #8810",   valor: -150.00,  status: "estornado",  adq: "WiteTec", data: "25/02 18:14" },
  { id: "TXN-8814", tipo: "PIX Entrada", cliente: "Startup Dev",     valor: 9800.00,  status: "aprovado",   adq: "PagPix",  data: "25/02 16:00" },
];

const STATUS_CONFIG = {
  aprovado:  { label: "Aprovado",  cls: "badge-success", icon: CheckCircle2, dot: "success" },
  pendente:  { label: "Pendente",  cls: "badge-warning", icon: Clock,        dot: "warning" },
  falhou:    { label: "Falhou",    cls: "badge-danger",  icon: XCircle,      dot: "danger"  },
  estornado: { label: "Estornado", cls: "badge-info",    icon: RotateCcw,    dot: "info"    },
};

const ACQUIRER_COLORS = { online: "success", offline: "danger", degraded: "warning" };

/* ─── Custom tooltip for charts ─── */
function CustomTooltip({ active, payload, label, currency }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      padding: "10px 14px",
      boxShadow: "var(--shadow-md)",
      fontSize: 13,
    }}>
      <p style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color, margin: "2px 0" }}>
          {p.name}: {currency ? `R$ ${Number(p.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : p.value}
        </p>
      ))}
    </div>
  );
}

/* ─── KPI Card ─── */
function KPICard({ label, value, delta, deltaType, icon: Icon, iconBg, iconColor, delay }) {
  return (
    <div className={`kpi-card animate-fade-up anim-delay-${delay}`}>
      <div
        className="kpi-icon-wrap"
        style={{ background: iconBg }}
      >
        <Icon size={20} color={iconColor} strokeWidth={2} />
      </div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      <span className={`kpi-delta ${deltaType}`}>
        {deltaType === "up"
          ? <TrendingUp size={11} />
          : deltaType === "down"
          ? <TrendingDown size={11} />
          : <Activity size={11} />
        }
        {delta}
      </span>
    </div>
  );
}

/* ─── Main Dashboard ─── */
export function Dashboard() {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [period, setPeriod] = useState("anual");

  const fmt = (v) =>
    balanceVisible
      ? `R$ ${Math.abs(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
      : "R$ ••••••";

  return (
    <div>
      {/* Page header */}
      <div className="page-header animate-fade-in">
        <div>
          <h1 className="page-title">Bom dia, Admin 👋</h1>
          <p className="page-subtitle">Quinta-feira, 26 de Fevereiro de 2026</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary btn-sm">
            <Calendar size={14} /> Filtrar período
          </button>
          <button className="btn btn-primary btn-sm">
            <QrCode size={14} /> Criar cobrança
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <KPICard
          label="Saldo Disponível"
          value={balanceVisible ? "R$ 48.240,00" : "R$ ••••••"}
          delta="+8.2% este mês"
          deltaType="up"
          icon={DollarSign}
          iconBg="var(--accent-soft)"
          iconColor="var(--accent)"
          delay={1}
        />
        <KPICard
          label="Entradas Hoje"
          value={balanceVisible ? "R$ 12.350,00" : "R$ ••••••"}
          delta="+12.4% ontem"
          deltaType="up"
          icon={ArrowUpRight}
          iconBg="var(--success-bg)"
          iconColor="var(--success)"
          delay={2}
        />
        <KPICard
          label="Saídas Hoje"
          value={balanceVisible ? "R$ 3.820,00" : "R$ ••••••"}
          delta="-3.1% ontem"
          deltaType="down"
          icon={ArrowDownRight}
          iconBg="var(--danger-bg)"
          iconColor="var(--danger)"
          delay={3}
        />
        <KPICard
          label="Transações Hoje"
          value="247"
          delta="+18 esta hora"
          deltaType="neutral"
          icon={Activity}
          iconBg="var(--info-bg)"
          iconColor="var(--info)"
          delay={4}
        />
      </div>

      {/* Main grid */}
      <div className="dashboard-grid">
        {/* Left column */}
        <div className="dashboard-left">
          {/* Bar chart — transactions this year */}
          <div className="card card-p animate-fade-up anim-delay-2">
            <div className="card-header">
              <div>
                <p className="card-title">Movimentações do Ano</p>
                <p className="card-subtitle">Entradas e saídas mensais em 2026</p>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn btn-secondary btn-sm">
                  <Download size={13} /> Exportar
                </button>
                <button className="btn btn-secondary btn-sm btn-icon">
                  <MoreHorizontal size={14} />
                </button>
              </div>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={MONTHLY_DATA}
                  margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                  barGap={3}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="mes"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                    tickFormatter={(v) => `${v / 1000}k`}
                  />
                  <Tooltip
                    content={<CustomTooltip currency />}
                    cursor={{ fill: "var(--bg-hover)", radius: 4 }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                    formatter={(v) => (
                      <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                        {v === "entradas" ? "Entradas" : "Saídas"}
                      </span>
                    )}
                  />
                  <Bar
                    dataKey="entradas"
                    name="entradas"
                    fill="#4361EE"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={22}
                  />
                  <Bar
                    dataKey="saidas"
                    name="saidas"
                    fill="#E2E8F0"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={22}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Area chart — weekly volume */}
          <div className="card card-p animate-fade-up anim-delay-3">
            <div className="card-header">
              <div>
                <p className="card-title">Volume desta Semana</p>
                <p className="card-subtitle">Total de entradas por dia</p>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {["semanal", "mensal", "anual"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className="btn btn-sm"
                    style={{
                      background: period === p ? "var(--accent)" : "var(--bg-surface-2)",
                      color: period === p ? "#fff" : "var(--text-secondary)",
                      border: `1px solid ${period === p ? "var(--accent)" : "var(--border)"}`,
                      padding: "5px 12px",
                      fontSize: 12,
                    }}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={WEEKLY_DATA}
                  margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="gradEntrada" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4361EE" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#4361EE" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 11 }} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip content={<CustomTooltip currency />} cursor={{ stroke: "var(--border)" }} />
                  <Area
                    type="monotone"
                    dataKey="valor"
                    name="Volume"
                    stroke="#4361EE"
                    strokeWidth={2.5}
                    fill="url(#gradEntrada)"
                    dot={{ r: 4, fill: "#4361EE", strokeWidth: 2, stroke: "var(--bg-surface)" }}
                    activeDot={{ r: 6, fill: "#4361EE", stroke: "var(--bg-surface)", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="card animate-fade-up anim-delay-4">
            <div className="card-header card-p" style={{ borderBottom: "1px solid var(--border)", marginBottom: 0, paddingBottom: 16 }}>
              <div>
                <p className="card-title">Transações Recentes</p>
                <p className="card-subtitle">Últimas 8 movimentações</p>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn btn-secondary btn-sm">
                  <Filter size={13} /> Filtrar
                </button>
                <button className="btn btn-primary btn-sm" style={{ textDecoration: "none" }}>
                  Ver todas
                </button>
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tipo</th>
                    <th>Cliente</th>
                    <th style={{ textAlign: "right" }}>Valor</th>
                    <th>Status</th>
                    <th>Adquirente</th>
                    <th>Data</th>
                    <th style={{ width: 40 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {RECENT_TXS.map((tx) => {
                    const s = STATUS_CONFIG[tx.status];
                    const positive = tx.valor > 0;
                    return (
                      <tr key={tx.id}>
                        <td>
                          <span style={{ fontWeight: 600, color: "var(--text-primary)", fontFamily: "monospace", fontSize: 12 }}>
                            {tx.id}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{
                              width: 30,
                              height: 30,
                              borderRadius: "var(--radius-sm)",
                              background: positive ? "var(--success-bg)" : "var(--danger-bg)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}>
                              {positive
                                ? <ArrowUpRight size={14} color="var(--success)" />
                                : <ArrowDownRight size={14} color="var(--danger)" />
                              }
                            </div>
                            <span style={{ fontSize: 13 }}>{tx.tipo}</span>
                          </div>
                        </td>
                        <td style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
                          {tx.cliente}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <span style={{
                            fontWeight: 700,
                            fontSize: 14,
                            color: positive ? "var(--success)" : "var(--danger)",
                          }}>
                            {positive ? "+" : ""}
                            {tx.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${s.cls}`}>
                            <span className={`status-dot ${s.dot}`} />
                            {s.label}
                          </span>
                        </td>
                        <td>
                          <span style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "var(--text-muted)",
                            background: "var(--bg-surface-2)",
                            border: "1px solid var(--border)",
                            padding: "2px 8px",
                            borderRadius: "999px",
                          }}>
                            {tx.adq}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                          {tx.data}
                        </td>
                        <td>
                          <button
                            className="btn btn-secondary btn-icon btn-sm"
                            style={{ border: "none", background: "transparent" }}
                            title="Ver detalhes"
                          >
                            <MoreHorizontal size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="dashboard-right">
          {/* Balance Panel */}
          <div className="balance-panel animate-fade-up anim-delay-2">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
              <p className="balance-label">Saldo Total</p>
              <button
                onClick={() => setBalanceVisible((v) => !v)}
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: "var(--radius-sm)",
                  padding: "4px 8px",
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.6)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11,
                  fontFamily: "var(--font)",
                  transition: "all 0.2s",
                }}
                title={balanceVisible ? "Ocultar saldo" : "Mostrar saldo"}
              >
                {balanceVisible ? <EyeOff size={12} /> : <Eye size={12} />}
                {balanceVisible ? "Ocultar" : "Mostrar"}
              </button>
            </div>

            <p className="balance-amount">{fmt(48240)}</p>
            <p className="balance-sub">+R$ 3.840,00 esta semana</p>

            <div className="balance-stat-row">
              <div className="balance-stat">
                <p className="balance-stat-label">Entradas (mês)</p>
                <p className="balance-stat-value" style={{ color: "#4ADE80" }}>{fmt(48350)}</p>
              </div>
              <div className="balance-stat">
                <p className="balance-stat-label">Saídas (mês)</p>
                <p className="balance-stat-value" style={{ color: "#F87171" }}>{fmt(12820)}</p>
              </div>
            </div>

            <div className="balance-limit-bar">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.50)", fontWeight: 500 }}>Limite de saque mensal</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.70)", fontWeight: 600 }}>64%</span>
              </div>
              <div className="balance-limit-track">
                <div className="balance-limit-fill" style={{ width: "64%" }} />
              </div>
              <div className="balance-limit-labels">
                <span>R$ 0</span>
                <span>R$ 50.000</span>
              </div>
            </div>

            <button className="balance-btn balance-btn-primary">
              <ArrowUpFromLine size={15} /> Solicitar Saque
            </button>
            <button className="balance-btn balance-btn-secondary">
              <QrCode size={15} /> Criar Cobrança PIX
            </button>
          </div>

          {/* Acquirer status */}
          <div className="card card-p animate-fade-up anim-delay-3">
            <div className="card-header" style={{ marginBottom: 12 }}>
              <p className="card-title">Status dos Adquirentes</p>
              <button
                className="btn btn-secondary btn-icon btn-sm"
                title="Atualizar"
              >
                <RefreshCw size={13} />
              </button>
            </div>
            <div className="acquirer-grid">
              {ACQUIRERS.map((a) => (
                <div key={a.name} className="acquirer-card">
                  <span className={`acquirer-dot ${a.status}`} />
                  <div style={{ minWidth: 0 }}>
                    <p className="acquirer-name">{a.name}</p>
                    <p className="acquirer-latency">{a.latency}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick stats */}
          <div className="card card-p animate-fade-up anim-delay-4">
            <div className="card-header" style={{ marginBottom: 14 }}>
              <p className="card-title">Resumo Rápido</p>
            </div>
            {[
              { label: "Taxa de aprovação",  value: "94.7%",    color: "var(--success)" },
              { label: "Ticket médio",        value: "R$ 287,40", color: "var(--accent)" },
              { label: "Contestações abertas", value: "3",       color: "var(--warning)" },
              { label: "Saques pendentes",    value: "1",        color: "var(--danger)" },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 0",
                  borderBottom: "1px solid var(--border-light)",
                }}
              >
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{stat.label}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: stat.color }}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
