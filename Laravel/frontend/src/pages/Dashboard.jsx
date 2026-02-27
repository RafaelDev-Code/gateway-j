import { useState } from "react";
import {
  TrendingUp, TrendingDown, Activity,
  ArrowUpRight, ArrowDownRight,
  Eye, EyeOff, Wallet, ShieldAlert,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ── Mock data ────────────────────────────────────────── */
/* Movimentações por hora do dia (00h–23h) */
const HOURS = [
  { hora: "00h", transacoes: 4 },  { hora: "01h", transacoes: 2 },  { hora: "02h", transacoes: 1 },
  { hora: "03h", transacoes: 0 },  { hora: "04h", transacoes: 1 },  { hora: "05h", transacoes: 3 },
  { hora: "06h", transacoes: 8 },  { hora: "07h", transacoes: 12 }, { hora: "08h", transacoes: 18 },
  { hora: "09h", transacoes: 22 },  { hora: "10h", transacoes: 28 }, { hora: "11h", transacoes: 31 },
  { hora: "12h", transacoes: 25 },  { hora: "13h", transacoes: 30 }, { hora: "14h", transacoes: 35 },
  { hora: "15h", transacoes: 29 },  { hora: "16h", transacoes: 26 }, { hora: "17h", transacoes: 24 },
  { hora: "18h", transacoes: 19 },  { hora: "19h", transacoes: 14 }, { hora: "20h", transacoes: 11 },
  { hora: "21h", transacoes: 9 },   { hora: "22h", transacoes: 6 },  { hora: "23h", transacoes: 3 },
];

/* Últimos 7 dias (um barra por dia) */
const DATA_7D = [
  { dia: "20/02", transacoes: 198 },
  { dia: "21/02", transacoes: 215 },
  { dia: "22/02", transacoes: 189 },
  { dia: "23/02", transacoes: 174 },
  { dia: "24/02", transacoes: 221 },
  { dia: "25/02", transacoes: 243 },
  { dia: "26/02", transacoes: 267 },
];

/* Últimos 30 dias (uma barra por dia, labels enxutos) */
const DATA_30D = [
  { dia: "D1",  transacoes: 180 }, { dia: "D2",  transacoes: 192 }, { dia: "D3",  transacoes: 205 },
  { dia: "D4",  transacoes: 178 }, { dia: "D5",  transacoes: 220 }, { dia: "D6",  transacoes: 235 },
  { dia: "D7",  transacoes: 198 }, { dia: "D8",  transacoes: 215 }, { dia: "D9",  transacoes: 189 },
  { dia: "D10", transacoes: 240 }, { dia: "D11", transacoes: 252 }, { dia: "D12", transacoes: 228 },
  { dia: "D13", transacoes: 195 }, { dia: "D14", transacoes: 210 }, { dia: "D15", transacoes: 245 },
  { dia: "D16", transacoes: 230 }, { dia: "D17", transacoes: 218 }, { dia: "D18", transacoes: 198 },
  { dia: "D19", transacoes: 225 }, { dia: "D20", transacoes: 198 }, { dia: "D21", transacoes: 215 },
  { dia: "D22", transacoes: 189 }, { dia: "D23", transacoes: 174 }, { dia: "D24", transacoes: 221 },
  { dia: "D25", transacoes: 243 }, { dia: "D26", transacoes: 267 }, { dia: "D27", transacoes: 255 },
  { dia: "D28", transacoes: 238 }, { dia: "D29", transacoes: 242 }, { dia: "D30", transacoes: 260 },
];

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

/* Formas de conversão: só % e barras (sem valor em R$) */
const FORMAS_CONVERSAO = [
  { id: "pix",    label: "Pix",             pct: 67, barColor: "var(--accent)" },
  { id: "cartao", label: "Cartão",          pct: 23, barColor: "var(--blue)" },
  { id: "boleto", label: "Boleto",           pct: 10, barColor: "var(--green)" },
  { id: "sep",    separator: true },
  { id: "charge", label: "Chargebacks",      pct: 2,  barColor: "var(--yellow)" },
  { id: "pre",    label: "Pre-chargebacks",  pct: 1,  barColor: "var(--red)" },
];

/* ── Custom Tooltip ───────────────────────────────────── */
function ChartTipHour({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const v = payload[0]?.value ?? 0;
  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      padding: "8px 12px",
      boxShadow: "var(--shadow)",
      fontSize: 13,
    }}>
      <p style={{ fontWeight: 600, color: "var(--text-1)", marginBottom: 2 }}>{label}</p>
      <p style={{ color: "var(--text-2)", margin: 0 }}>{v} transações</p>
    </div>
  );
}

function ChartTipDay({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const v = payload[0]?.value ?? 0;
  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      padding: "8px 12px",
      boxShadow: "var(--shadow)",
      fontSize: 13,
    }}>
      <p style={{ fontWeight: 600, color: "var(--text-1)", marginBottom: 2 }}>{label}</p>
      <p style={{ color: "var(--text-2)", margin: 0 }}>{v} transações</p>
    </div>
  );
}

/* ── KPI Card ─────────────────────────────────────────── */
function KPI({ label, sublabel, value, delta, up, icon: Icon, iconBg, iconColor, delay, hidden }) {
  return (
    <div className={`kpi-card fade-up d${delay}`}>
      <div className="kpi-top">
        <div>
          <span className="kpi-label">{label}</span>
          {sublabel && <span className="kpi-sublabel">{sublabel}</span>}
        </div>
        <div className="kpi-icon" style={{ background: iconBg }}>
          <Icon size={16} color={iconColor} strokeWidth={2} />
        </div>
      </div>
      <div className="kpi-value">
        {hidden ? "R$ ••••" : value}
      </div>
      {delta != null && (
        <span className={`kpi-delta ${up ? "up" : typeof up === "boolean" ? "down" : "flat"}`}>
          {up === true  && <TrendingUp  size={11} />}
          {up === false && <TrendingDown size={11} />}
          {up === null  && <Activity    size={11} />}
          {delta}
        </span>
      )}
    </div>
  );
}

/* ── Card Transações Hoje — só quantidade ────────────── */
function KPITransacoesHoje({ delay, hidden }) {
  const totais = { pix: 142, cartao: 48, boleto: 23 };
  const total = totais.pix + totais.cartao + totais.boleto;
  return (
    <div className={`kpi-card kpi-card-transacoes-simple fade-up d${delay}`}>
      <div className="kpi-top">
        <div>
          <span className="kpi-label">Transações Hoje</span>
          <span className="kpi-sublabel">Quantidades</span>
        </div>
        <div className="kpi-icon" style={{ background: "var(--blue-faint)" }}>
          <Activity size={16} color="var(--blue)" strokeWidth={2} />
        </div>
      </div>
      <div className="kpi-value">
        {hidden ? "•••" : total.toLocaleString("pt-BR")}
      </div>
      <div className="kpi-qty-row">
        <span>Pix <strong>{hidden ? "—" : totais.pix}</strong></span>
        <span>Cartão <strong>{hidden ? "—" : totais.cartao}</strong></span>
        <span>Boleto <strong>{hidden ? "—" : totais.boleto}</strong></span>
      </div>
    </div>
  );
}

/* ── Main ─────────────────────────────────────────────── */
export function Dashboard() {
  const [chartPeriod, setChartPeriod] = useState("hoje"); // hoje | 7d | 30d
  const [hidden,  setHidden]  = useState(false);

  const chartData = chartPeriod === "hoje" ? HOURS : chartPeriod === "7d" ? DATA_7D : DATA_30D;
  const chartDataKey = chartPeriod === "hoje" ? "hora" : "dia";
  const chartSubtitle =
    chartPeriod === "hoje"
      ? "Transações por hora (00h às 23h59)"
      : chartPeriod === "7d"
      ? "Transações por dia — últimos 7 dias"
      : "Transações por dia — últimos 30 dias";

  return (
    <div className="fade-in">
      <div className="page-header animate-fade-in">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Visão geral de saldo, entradas e movimentações</p>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setHidden((h) => !h)}
          title={hidden ? "Mostrar valores" : "Ocultar valores"}
        >
          {hidden ? <Eye size={14} /> : <EyeOff size={14} />}
          {hidden ? "Mostrar" : "Ocultar"}
        </button>
      </div>

      <div className="dash-4col">
        <KPI
          label="Saldo Disponível"
          sublabel="Disponível para saque"
          value="R$ 48.240,00"
          delta="+8,2% este mês"
          up={true}
          icon={Wallet}
          iconBg="var(--accent-faint)"
          iconColor="var(--accent)"
          delay={1}
          hidden={hidden}
        />
        <KPI
          label="Entradas Hoje"
          sublabel="Pagamentos recebidos"
          value="R$ 12.350,00"
          delta="+12,4% ontem"
          up={true}
          icon={ArrowUpRight}
          iconBg="var(--green-faint)"
          iconColor="var(--green)"
          delay={2}
          hidden={hidden}
        />
        <KPI
          label="Bloqueio Cautelar"
          sublabel="Meios para disputa"
          value="R$ 3.200,00"
          delta="2 contestações"
          up={null}
          icon={ShieldAlert}
          iconBg="var(--yellow-faint)"
          iconColor="var(--yellow)"
          delay={3}
          hidden={hidden}
        />
        <KPITransacoesHoje delay={4} hidden={hidden} />

        {/* Linha 2: chart (3 colunas) + formas de conversão (1 coluna) */}
        <div className="dash-chart-col">
          {/* Movimentações do Dia (por hora 00h–23h) ou 7d / 30d */}
          <div className="card card-chart-movimentos fade-up d2">
            <div className="card-head">
              <div>
                <p className="card-title">Movimentações do Dia</p>
                <p className="card-subtitle">{chartSubtitle}</p>
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {[
                  { id: "hoje", label: "Hoje" },
                  { id: "7d",    label: "Últimos 7 dias" },
                  { id: "30d",   label: "Últimos 30 dias" },
                ].map((p) => (
                  <button
                    key={p.id}
                    className={`btn btn-xs${chartPeriod === p.id ? " btn-primary" : " btn-ghost"}`}
                    onClick={() => setChartPeriod(p.id)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="card-chart-inner">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradTransacoes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0D9488" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#0D9488" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey={chartDataKey}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--text-3)", fontSize: chartPeriod === "30d" ? 9 : 10 }}
                    interval={chartPeriod === "30d" ? 2 : 0}
                  />
                  <YAxis
                    width={28}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--text-3)", fontSize: 11 }}
                    allowDecimals={false}
                  />
                  <Tooltip content={chartPeriod === "hoje" ? <ChartTipHour /> : <ChartTipDay />} cursor={{ stroke: "var(--border)", strokeWidth: 1 }} />
                  <Area
                    type="monotone"
                    dataKey="transacoes"
                    name="Transações"
                    stroke="#0D9488"
                    strokeWidth={2}
                    fill="url(#gradTransacoes)"
                    dot={false}
                    activeDot={{ r: 4, fill: "#0D9488", stroke: "var(--surface)", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Formas de conversão — alinhado com a 4ª coluna dos KPIs */}
        <div className="dash-conv-col">
          <div className="card card-formas-conversao fade-up d2">
            <div className="card-head">
              <p className="card-title">Formas de conversão</p>
            </div>
            <div className="conv-bars conv-bars-full">
              {FORMAS_CONVERSAO.map((item) =>
                item.separator ? (
                  <div key={item.id} className="conv-sep" />
                ) : (
                  <div key={item.id} className="conv-bar-block">
                    <div className="conv-bar-header">
                      <span className="conv-bar-label">{item.label}</span>
                      <span className="conv-bar-pct">{item.pct}%</span>
                    </div>
                    <div className="conv-bar-track conv-bar-track-thick">
                      <div
                        className="conv-bar-fill"
                        style={{ width: `${item.pct}%`, background: item.barColor }}
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
