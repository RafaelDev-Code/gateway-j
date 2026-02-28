import { useState, useEffect, useMemo } from "react";
import {
  TrendingUp, TrendingDown, Activity,
  ArrowUpRight, ArrowDownRight,
  Eye, EyeOff, Wallet, ShieldAlert,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import { apiJson } from "../api/client";

const TZ = "America/Sao_Paulo";
function todayBR() { return new Date().toLocaleDateString("en-CA", { timeZone: TZ }); }
function dateBR(iso) { return new Date(iso).toLocaleDateString("en-CA", { timeZone: TZ }); }
function hourBR(iso) { return new Date(iso).toLocaleTimeString("pt-BR", { timeZone: TZ, hour: "2-digit", hour12: false }); }

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

/* ── Card Transações Hoje — por tipo (Depósito / Saque / Transferência) ────────────── */
function KPITransacoesHoje({ delay, hidden, totais }) {
  const t = totais || { DEPOSIT: 0, WITHDRAW: 0, INTERNAL_TRANSFER: 0 };
  const total = (t.DEPOSIT ?? 0) + (t.WITHDRAW ?? 0) + (t.INTERNAL_TRANSFER ?? 0);
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
        <span>Depósito <strong>{hidden ? "—" : (t.DEPOSIT ?? 0)}</strong></span>
        <span>Saque <strong>{hidden ? "—" : (t.WITHDRAW ?? 0)}</strong></span>
        <span>Transfer. <strong>{hidden ? "—" : (t.INTERNAL_TRANSFER ?? 0)}</strong></span>
      </div>
    </div>
  );
}

/* ── Main ─────────────────────────────────────────────── */
export function Dashboard() {
  const [chartPeriod, setChartPeriod] = useState("hoje");
  const [hidden, setHidden] = useState(false);
  const [balanceData, setBalanceData] = useState(null);
  const [transactionsList, setTransactionsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = todayBR();
    const from = new Date();
    from.setDate(from.getDate() - 30);
    const fromStr = from.toLocaleDateString("en-CA", { timeZone: TZ });
    Promise.all([
      apiJson("/balance").then((r) => (r?.data ? r : r)),
      apiJson(`/transactions?from=${fromStr}&to=${today}`).then((r) => (Array.isArray(r?.data) ? r.data : r?.data ?? [])),
    ])
      .then(([bal, list]) => {
        setBalanceData(bal?.data ?? bal ?? null);
        setTransactionsList(Array.isArray(list) ? list : []);
      })
      .catch(() => { setBalanceData(null); setTransactionsList([]); })
      .finally(() => setLoading(false));
  }, []);

  const { chartData, chartDataKey, entradasHoje, totaisHojePorTipo, formasConversao } = useMemo(() => {
    const today = todayBR();
    const list = transactionsList.filter((t) => dateBR(t.created_at) === today);
    const all = transactionsList;
    const entradasHoje = list
      .filter((t) => t.type === "DEPOSIT")
      .reduce((s, t) => s + parseFloat(t.amount || 0), 0);
    const byType = { DEPOSIT: 0, WITHDRAW: 0, INTERNAL_TRANSFER: 0 };
    list.forEach((t) => { if (byType[t.type] != null) byType[t.type]++; });
    const totalByType = all.reduce((acc, t) => {
      acc[t.type] = (acc[t.type] || 0) + 1;
      return acc;
    }, {});
    const totalCount = all.length || 1;
    const formasConversao = [
      { id: "DEPOSIT", label: "Depósito", pct: Math.round(((totalByType.DEPOSIT || 0) / totalCount) * 100), barColor: "var(--accent)" },
      { id: "WITHDRAW", label: "Saque", pct: Math.round(((totalByType.WITHDRAW || 0) / totalCount) * 100), barColor: "var(--blue)" },
      { id: "INTERNAL_TRANSFER", label: "Transferência", pct: Math.round(((totalByType.INTERNAL_TRANSFER || 0) / totalCount) * 100), barColor: "var(--green)" },
    ].filter((f) => f.pct > 0);
    if (formasConversao.length === 0) formasConversao.push({ id: "none", label: "Nenhuma", pct: 100, barColor: "var(--text-3)" });

    let chartData;
    let chartDataKey;
    if (chartPeriod === "hoje") {
      const byHour = Array.from({ length: 24 }, (_, i) => ({ hora: `${String(i).padStart(2, "0")}h`, transacoes: 0 }));
      list.forEach((t) => {
        const h = new Date(t.created_at).toLocaleTimeString("pt-BR", { timeZone: TZ, hour: "2-digit", hour12: false });
        const idx = parseInt(h, 10);
        if (!isNaN(idx) && idx >= 0 && idx < 24) byHour[idx].transacoes++;
      });
      chartData = byHour;
      chartDataKey = "hora";
    } else {
      const days = chartPeriod === "7d" ? 7 : 30;
      const dayCount = {};
      const start = new Date();
      start.setDate(start.getDate() - days);
      for (let i = 0; i < days; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        const key = d.toLocaleDateString("en-CA", { timeZone: TZ });
        dayCount[key] = { dia: d.toLocaleDateString("pt-BR", { timeZone: TZ, day: "2-digit", month: "2-digit" }), transacoes: 0 };
      }
      all.forEach((t) => {
        const key = dateBR(t.created_at);
        if (dayCount[key]) dayCount[key].transacoes++;
      });
      chartData = Object.keys(dayCount)
        .sort()
        .map((k) => dayCount[k]);
      chartDataKey = "dia";
    }
    return { chartData, chartDataKey, entradasHoje, totaisHojePorTipo: byType, formasConversao };
  }, [transactionsList, chartPeriod]);

  const chartSubtitle =
    chartPeriod === "hoje"
      ? "Transações por hora (00h às 23h59)"
      : chartPeriod === "7d"
      ? "Transações por dia — últimos 7 dias"
      : "Transações por dia — últimos 30 dias";

  const saldo = balanceData?.balance != null ? Number(balanceData.balance) : 0;
  const saldoFmt = loading ? "—" : `R$ ${saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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
          value={saldoFmt}
          delta={balanceData?.cash_in_active ? "Recebimento ativo" : "—"}
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
          value={loading ? "—" : `R$ ${entradasHoje.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          delta="—"
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
          value="R$ 0,00"
          delta="—"
          up={null}
          icon={ShieldAlert}
          iconBg="var(--yellow-faint)"
          iconColor="var(--yellow)"
          delay={3}
          hidden={hidden}
        />
        <KPITransacoesHoje delay={4} hidden={hidden} totais={totaisHojePorTipo} />

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
              {(formasConversao && formasConversao.length ? formasConversao : [{ id: "none", label: "Nenhuma transação", pct: 0, barColor: "var(--text-3)" }]).map((item) => (
                  <div key={item.id} className="conv-bar-block">
                    <div className="conv-bar-header">
                      <span className="conv-bar-label">{item.label}</span>
                      <span className="conv-bar-pct">{item.pct}%</span>
                    </div>
                    <div className="conv-bar-track conv-bar-track-thick">
                      <div
                        className="conv-bar-fill"
                        style={{ width: `${Math.min(100, item.pct)}%`, background: item.barColor }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
