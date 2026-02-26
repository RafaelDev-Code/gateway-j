import { useState } from "react";
import {
  TrendingUp, TrendingDown, Activity, DollarSign,
  ArrowUpRight, ArrowDownRight, Filter, Download,
  MoreHorizontal, RefreshCw, CheckCircle2, Clock,
  XCircle, RotateCcw, Eye, EyeOff,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell,
} from "recharts";

/* ── Mock data ────────────────────────────────────────── */
const BAR_DATA = [
  { mes: "Jan", entradas: 38, saidas: 18 },
  { mes: "Fev", entradas: 42, saidas: 22 },
  { mes: "Mar", entradas: 35, saidas: 14 },
  { mes: "Abr", entradas: 55, saidas: 28 },
  { mes: "Mai", entradas: 68, saidas: 32 },
  { mes: "Jun", entradas: 61, saidas: 27 },
  { mes: "Jul", entradas: 74, saidas: 35 },
  { mes: "Ago", entradas: 69, saidas: 30 },
  { mes: "Set", entradas: 82, saidas: 40 },
  { mes: "Out", entradas: 77, saidas: 36 },
  { mes: "Nov", entradas: 91, saidas: 44 },
  { mes: "Dez", entradas: 86, saidas: 38 },
];

const ACQUIRERS = [
  { name: "PagPix",  status: "online",   lat: "42ms"  },
  { name: "RapDyn",  status: "online",   lat: "38ms"  },
  { name: "WiteTec", status: "online",   lat: "61ms"  },
  { name: "Strike",  status: "degraded", lat: "180ms" },
  { name: "Versell", status: "online",   lat: "55ms"  },
  { name: "BSPay",   status: "offline",  lat: "—"     },
];

const TXS = [
  { id: "TXN-8821", tipo: "PIX Entrada", cliente: "Loja do João",    valor:  1250.00, status: "aprovado",  adq: "PagPix",  data: "26/02 14:32" },
  { id: "TXN-8820", tipo: "PIX Saída",   cliente: "Fornecedor ABC",  valor: -340.50,  status: "aprovado",  adq: "RapDyn",  data: "26/02 13:18" },
  { id: "TXN-8819", tipo: "PIX Entrada", cliente: "Maria Silva",     valor:  5000.00, status: "pendente",  adq: "WiteTec", data: "26/02 12:45" },
  { id: "TXN-8818", tipo: "PIX Saída",   cliente: "Saque Manual",    valor: -2000.00, status: "aprovado",  adq: "PagPix",  data: "26/02 11:20" },
  { id: "TXN-8817", tipo: "PIX Entrada", cliente: "E-commerce XYZ",  valor:  785.90,  status: "aprovado",  adq: "Versell", data: "26/02 10:55" },
  { id: "TXN-8816", tipo: "PIX Entrada", cliente: "Carlos Pereira",  valor:  320.00,  status: "falhou",    adq: "Strike",  data: "26/02 09:30" },
  { id: "TXN-8815", tipo: "PIX Saída",   cliente: "Estorno #8810",   valor: -150.00,  status: "estornado", adq: "WiteTec", data: "25/02 18:14" },
  { id: "TXN-8814", tipo: "PIX Entrada", cliente: "Startup Dev",     valor:  9800.00, status: "aprovado",  adq: "PagPix",  data: "25/02 16:00" },
];

const STATUS = {
  aprovado:  { label: "Aprovado",  cls: "badge-green",  icon: CheckCircle2 },
  pendente:  { label: "Pendente",  cls: "badge-yellow", icon: Clock        },
  falhou:    { label: "Falhou",    cls: "badge-red",     icon: XCircle      },
  estornado: { label: "Estornado", cls: "badge-blue",   icon: RotateCcw    },
};

/* ── Custom Tooltip ───────────────────────────────────── */
function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      padding: "10px 14px",
      boxShadow: "var(--shadow)",
      fontSize: 13,
    }}>
      <p style={{ fontWeight: 600, color: "var(--text-1)", marginBottom: 6 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: R$ {p.value}k
        </p>
      ))}
    </div>
  );
}

/* ── KPI Card ─────────────────────────────────────────── */
function KPI({ label, value, delta, up, icon: Icon, iconBg, iconColor, delay, hidden }) {
  return (
    <div className={`kpi-card fade-up d${delay}`}>
      <div className="kpi-top">
        <span className="kpi-label">{label}</span>
        <div className="kpi-icon" style={{ background: iconBg }}>
          <Icon size={16} color={iconColor} strokeWidth={2} />
        </div>
      </div>
      <div className="kpi-value">
        {hidden ? "R$ ••••" : value}
      </div>
      <span className={`kpi-delta ${up ? "up" : typeof up === "boolean" ? "down" : "flat"}`}>
        {up === true  && <TrendingUp  size={11} />}
        {up === false && <TrendingDown size={11} />}
        {up === null  && <Activity    size={11} />}
        {delta}
      </span>
    </div>
  );
}

/* ── Main ─────────────────────────────────────────────── */
export function Dashboard() {
  const [period,  setPeriod]  = useState("Mensal");
  const [hidden,  setHidden]  = useState(false);

  return (
    <div className="fade-in">
      {/* Page header */}
      <div className="page-head">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-bread">Dashboard <span>/ Visão Geral</span></p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setHidden((h) => !h)}
            title={hidden ? "Mostrar valores" : "Ocultar valores"}
          >
            {hidden ? <Eye size={14} /> : <EyeOff size={14} />}
            {hidden ? "Mostrar" : "Ocultar"}
          </button>
          <button className="btn btn-ghost btn-sm">
            <Filter size={14} /> Filtrar
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="kpi-row">
        <KPI
          label="Saldo Disponível" value="R$ 48.240,00"
          delta="+8,2% este mês" up={true}
          icon={DollarSign} iconBg="var(--accent-faint)" iconColor="var(--accent)"
          delay={1} hidden={hidden}
        />
        <KPI
          label="Entradas (mês)" value="R$ 48.350,00"
          delta="+12,4% mês anterior" up={true}
          icon={ArrowUpRight} iconBg="var(--green-faint)" iconColor="var(--green)"
          delay={2} hidden={hidden}
        />
        <KPI
          label="Saídas (mês)" value="R$ 12.820,00"
          delta="-3,1% mês anterior" up={false}
          icon={ArrowDownRight} iconBg="var(--red-faint)" iconColor="var(--red)"
          delay={3} hidden={hidden}
        />
        <KPI
          label="Transações (mês)" value="1.247"
          delta="+18 hoje" up={null}
          icon={Activity} iconBg="var(--blue-faint)" iconColor="var(--blue)"
          delay={4} hidden={false}
        />
      </div>

      {/* Main grid */}
      <div className="dash-grid">
        {/* Left */}
        <div className="dash-left">
          {/* Bar chart */}
          <div className="card fade-up d2">
            <div className="card-head">
              <div>
                <p className="card-title">Movimentações do Ano</p>
                <p className="card-subtitle">Entradas e saídas mensais em 2026</p>
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {["Mensal", "Semanal", "Anual"].map((p) => (
                  <button
                    key={p}
                    className={`btn btn-xs${period === p ? " btn-primary" : " btn-ghost"}`}
                    onClick={() => setPeriod(p)}
                  >
                    {p}
                  </button>
                ))}
                <button className="btn btn-ghost btn-icon btn-sm">
                  <Download size={13} />
                </button>
              </div>
            </div>

            <div style={{ padding: "16px 16px 8px", height: 272 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={BAR_DATA} margin={{ top: 4, right: 4, left: -18, bottom: 0 }} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="mes"
                    axisLine={false} tickLine={false}
                    tick={{ fill: "var(--text-3)", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false} tickLine={false}
                    tick={{ fill: "var(--text-3)", fontSize: 11 }}
                    tickFormatter={(v) => `${v}k`}
                  />
                  <Tooltip content={<ChartTip />} cursor={{ fill: "var(--surface-2)", radius: 4 }} />
                  <Legend
                    wrapperStyle={{ paddingTop: 12, fontSize: 12 }}
                    formatter={(v) => (
                      <span style={{ color: "var(--text-2)", fontWeight: 500 }}>
                        {v === "entradas" ? "Entradas" : "Saídas"}
                      </span>
                    )}
                  />
                  {/* PayU style: active bars striped, inactive bars gray */}
                  <Bar dataKey="entradas" name="entradas" radius={[3, 3, 0, 0]} maxBarSize={20}>
                    {BAR_DATA.map((_, i) => {
                      const active = i >= 3 && i <= 5;
                      return (
                        <Cell
                          key={i}
                          fill={active ? "var(--accent)" : "var(--border)"}
                        />
                      );
                    })}
                  </Bar>
                  <Bar dataKey="saidas" name="saidas" radius={[3, 3, 0, 0]} maxBarSize={20}>
                    {BAR_DATA.map((_, i) => {
                      const active = i >= 3 && i <= 5;
                      return (
                        <Cell
                          key={i}
                          fill={active ? "#18181B" : "var(--border-2)"}
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="card fade-up d3">
            <div className="card-head">
              <div>
                <p className="card-title">Transações Recentes</p>
                <p className="card-subtitle">Últimas 8 movimentações</p>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn btn-ghost btn-sm">
                  <Filter size={13} /> Filtrar
                </button>
                <button className="btn btn-ghost btn-sm">
                  Ver todas
                </button>
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table className="tbl">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tipo</th>
                    <th>Cliente</th>
                    <th style={{ textAlign: "right" }}>Valor</th>
                    <th>Status</th>
                    <th>Adquirente</th>
                    <th>Data</th>
                    <th style={{ width: 36 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {TXS.map((tx) => {
                    const pos = tx.valor > 0;
                    const s = STATUS[tx.status];
                    return (
                      <tr key={tx.id}>
                        <td>
                          <span style={{
                            fontFamily: "monospace",
                            fontSize: 12,
                            fontWeight: 600,
                            color: "var(--text-1)",
                          }}>
                            {tx.id}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{
                              width: 28, height: 28,
                              borderRadius: "var(--radius-sm)",
                              background: pos ? "var(--green-faint)" : "var(--red-faint)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              flexShrink: 0,
                            }}>
                              {pos
                                ? <ArrowUpRight   size={13} color="var(--green)" />
                                : <ArrowDownRight size={13} color="var(--red)" />
                              }
                            </div>
                            <span style={{ fontSize: 13, color: "var(--text-1)" }}>{tx.tipo}</span>
                          </div>
                        </td>
                        <td style={{ fontWeight: 500, color: "var(--text-1)" }}>{tx.cliente}</td>
                        <td style={{ textAlign: "right" }}>
                          <span style={{
                            fontWeight: 700,
                            fontSize: 13,
                            color: pos ? "var(--green)" : "var(--red)",
                          }}>
                            {pos ? "+" : ""}
                            {tx.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${s.cls}`}>
                            <span style={{
                              width: 5, height: 5, borderRadius: "50%",
                              background: "currentColor", flexShrink: 0,
                            }} />
                            {s.label}
                          </span>
                        </td>
                        <td>
                          <span style={{
                            fontSize: 11, fontWeight: 600,
                            color: "var(--text-3)",
                            background: "var(--surface-2)",
                            border: "1px solid var(--border)",
                            padding: "2px 7px",
                            borderRadius: 99,
                          }}>
                            {tx.adq}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: "var(--text-3)", whiteSpace: "nowrap" }}>{tx.data}</td>
                        <td>
                          <button
                            className="btn btn-ghost btn-icon"
                            style={{ width: 28, height: 28, border: "none", background: "transparent" }}
                          >
                            <MoreHorizontal size={14} />
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
        <div className="dash-right">
          {/* Acquirers — My card equivalent */}
          <div className="card fade-up d2">
            <div className="card-head">
              <div>
                <p className="card-title">Status dos Adquirentes</p>
                <p className="card-subtitle">6 integrações ativas</p>
              </div>
              <button className="btn btn-ghost btn-icon btn-sm" title="Atualizar">
                <RefreshCw size={13} />
              </button>
            </div>
            <div className="acq-list">
              {ACQUIRERS.map((a) => (
                <div key={a.name} className="acq-item">
                  <span className={`acq-dot ${a.status}`} />
                  <span className="acq-name">{a.name}</span>
                  <span className="acq-lat">{a.lat}</span>
                  <span className={`acq-status ${a.status}`}>
                    {a.status === "online" ? "Online" : a.status === "offline" ? "Offline" : "Lento"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick stats */}
          <div className="card fade-up d3">
            <div className="card-head">
              <p className="card-title">Resumo</p>
            </div>
            <div style={{ padding: "4px 0" }}>
              {[
                { label: "Taxa de aprovação",    value: "94,7%",   color: "var(--green)" },
                { label: "Ticket médio",          value: "R$ 287",  color: "var(--accent)" },
                { label: "Contestações abertas",  value: "3",       color: "var(--yellow)" },
                { label: "Saques pendentes",      value: "1",       color: "var(--red)" },
                { label: "Webhooks disparados",   value: "1.082",   color: "var(--text-1)" },
                { label: "Uptime hoje",           value: "99,8%",   color: "var(--green)" },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "11px 20px",
                    borderBottom: "1px solid var(--border-2)",
                    transition: "background var(--dur)",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-2)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <span style={{ fontSize: 13, color: "var(--text-2)" }}>{s.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
