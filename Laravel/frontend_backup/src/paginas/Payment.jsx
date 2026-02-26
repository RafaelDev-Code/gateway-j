import { useState, useEffect } from "react";
import {
  Info,
  ArrowRight,
  ChevronDown,
  Calendar,
  TrendingUp,
  Wallet,
  Clock,
  Activity,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

import { theme } from "../theme";

const ACCENT = theme.accent;
const BG_CARD = "rgba(18, 3, 4, 0.72)";
const BORDER = "rgba(255, 255, 255, 0.12)";
const BORDER_ACCENT = theme.borderAccent || "rgba(243, 15, 34, 0.25)";
const TEXT = theme.text;
const TEXT_MUTED = theme.textMuted;

const saldoResumo = [
  { label: "Disponível para saque", value: "R$ 820.450,00", sub: "93% do saldo total", Icon: Wallet },
  { label: "Em processamento", value: "R$ 55.535,00", sub: "Liberação em até 24h", Icon: Clock },
  { label: "Última movimentação", value: "Hoje, 14:32", sub: "PIX recebido", Icon: Activity },
];

const paymentActivityData = [
  { month: "Jan", value: 3200 },
  { month: "Fev", value: 4100 },
  { month: "Mar", value: 3800 },
  { month: "Abr", value: 5200 },
  { month: "Mai", value: 6100 },
  { month: "Jun", value: 7200 },
  { month: "Jul", value: 8000 },
  { month: "Ago", value: 7500 },
  { month: "Set", value: 6800 },
  { month: "Out", value: 8200 },
  { month: "Nov", value: 7900 },
  { month: "Dez", value: 8500 },
];

const monthLabelFull = { Jan: "Janeiro", Fev: "Fevereiro", Mar: "Março", Abr: "Abril", Mai: "Maio", Jun: "Junho", Jul: "Julho", Ago: "Agosto", Set: "Setembro", Out: "Outubro", Nov: "Novembro", Dez: "Dezembro" };

/** Índice: formas de conversão — cada item tem seu índice (valor) */
const conversionIndexData = [
  { name: "Pix", index: 42 },
  { name: "Cartão", index: 28 },
  { name: "Boletos", index: 18 },
  { name: "Changerbacks", index: 8 },
  { name: "Pre-Changerbacks", index: 4 },
];
const conversionIndexSeparatorAfter = 3; // linha separadora após Boletos (antes de Changerbacks)

function CardDark({ children, style = {}, delay = 0 }) {
  return (
    <div
      className="card-futurist"
      style={{ animationDelay: `${delay}ms`, ...style }}
    >
      {children}
    </div>
  );
}

/** Easing suave: ease-out cúbico */
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

/** Gauge em arco semi-circular: anima de 0% até o valor ao carregar */
function ConversionGauge({ value = 56, color = ACCENT, size = 160 }) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const duration = 1800;
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(t);
      setAnimatedValue(eased * value);
      if (t < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [value]);

  const r = size * 0.38;
  const cx = size / 2;
  const cy = size * 0.46;
  const strokeWidth = Math.max(12, size * 0.078);
  const pathLen = Math.PI * r;
  const filledLen = (animatedValue / 100) * pathLen;
  // Arco: semicírculo inferior (sweep 1) de esquerda (180°) para direita (0°) no sentido horário.
  // Marcador na ponta: após percorrer animatedValue% do arco, estamos em 180° + animatedValue%*180°
  const angleDeg = 180 + (animatedValue / 100) * 180;
  const angleRad = (angleDeg * Math.PI) / 180;
  const mx = cx + r * Math.cos(angleRad);
  const my = cy + r * Math.sin(angleRad);
  const displayPct = Math.round(animatedValue);
  // viewBox compacto: só até onde o arco + bolinha chegam (não precisa incluir cy+r inteiro)
  const svgHeight = Math.ceil(cy + strokeWidth * 3);
  const bowlCenterY = cy - r * 0.25;
  const overlayTopPct = (bowlCenterY / svgHeight) * 100;

  return (
    <div style={{ position: "relative", width: "100%", marginTop: 6, marginBottom: "-26px" }}>
      <svg width="100%" viewBox={`0 0 ${size} ${svgHeight}`} style={{ display: "block", overflow: "hidden" }}>
        <defs>
          <filter id="gauge-marker-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.4" />
          </filter>
        </defs>
        {/* Trilha (fundo) — semicírculo inferior */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Preenchido: round para as pontas ficarem arredondadas */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${filledLen} ${pathLen + 200}`}
        />
        {/* Marcador circular (animado) */}
        <g filter="url(#gauge-marker-shadow)">
          <circle cx={mx} cy={my} r={strokeWidth * 0.92} fill={color} stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
          <circle cx={mx} cy={my} r={strokeWidth * 0.46} fill="#fff" />
        </g>
      </svg>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: `${overlayTopPct}%`,
          transform: "translate(-50%, -50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 4, lineHeight: 1 }}>
          <span style={{ fontSize: 58, fontWeight: 900, color: TEXT, fontFamily: "var(--font-heading)", letterSpacing: "-0.04em" }}>{displayPct}</span>
          <span style={{ fontSize: 30, fontWeight: 800, color: TEXT, transform: "translateY(-4px)" }}>%</span>
        </div>
        <p style={{ margin: "10px 0 0 0", fontSize: 13, color: "#22c55e", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
          <TrendingUp size={14} strokeWidth={2.5} />
          +2,4% vs ontem
        </p>
      </div>
    </div>
  );
}

function DropdownWithCalendar({ value = "Este ano" }) {
  return (
    <button
      className="btn-futurist btn-futurist-outline"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 14px",
        color: TEXT,
        fontSize: 13,
        cursor: "pointer",
      }}
    >
      <Calendar size={16} style={{ color: ACCENT }} />
      {value}
      <ChevronDown size={14} style={{ color: TEXT_MUTED }} />
    </button>
  );
}

export function Payment() {
  return (
    <div className="dashboard-page" style={{ display: "flex", flexDirection: "column", gap: 24, width: "100%", maxWidth: "100%", fontFamily: "var(--font-body)" }}>
      {/* Row 1: Meu Saldo + Taxa de Conversão */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "stretch" }}>
        {/* Meu Saldo */}
        <CardDark delay={0} style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "nowrap" }}>
              <h2 className="card-section-title" style={{ marginBottom: 0 }}>Meu Saldo</h2>
              <button type="button" className="btn-info-inline" aria-label="Mais informações">
                <Info size={10} strokeWidth={2.5} />
              </button>
            </div>
            <span style={{ fontSize: 11, color: TEXT_MUTED, fontWeight: 500, whiteSpace: "nowrap" }}>Atualizado às 14:32</span>
          </div>
          <div style={{ marginBottom: 12 }}>
            <p style={{ margin: 0, fontSize: 38, fontWeight: 700, color: TEXT, letterSpacing: "-0.02em" }}>
              R$ 875.985,00
            </p>
          </div>
          <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
            <button
              className="btn-futurist btn-futurist-primary"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 20px",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Efetuar Saque
              <ArrowRight size={18} />
            </button>
            <button
              className="btn-futurist btn-futurist-outline"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 20px",
                color: TEXT,
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Depositar
              <ArrowRight size={18} />
            </button>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: 2, marginBottom: 10, flexShrink: 0 }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, flex: 1, alignItems: "stretch", minHeight: 0 }}>
            {saldoResumo.map((s) => {
              const Icon = s.Icon;
              return (
                <div key={s.label} className="card-futurist-inner" style={{ padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <div style={{ width: 26, height: 26, borderRadius: 6, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={14} style={{ color: ACCENT }} strokeWidth={2} />
                    </div>
                    <p style={{ margin: 0, fontSize: 11, color: TEXT_MUTED, fontWeight: 500 }}>{s.label}</p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: TEXT, letterSpacing: "-0.02em" }}>{s.value}</p>
                    <p style={{ margin: "4px 0 0 0", fontSize: 10, color: TEXT_MUTED, opacity: 0.9 }}>{s.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardDark>

        {/* Taxa de Conversão */}
        <CardDark delay={80} style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: TEXT_MUTED, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Taxa de conversão
            </p>
            <button type="button" className="btn-info-inline" aria-label="Mais informações">
              <Info size={10} strokeWidth={2.5} />
            </button>
          </div>
          <ConversionGauge value={56} color={ACCENT} size={180} />
          <div style={{ paddingTop: 2, borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: 0 }}>
            <p style={{ margin: "0 0 6px 0", fontSize: 10, fontWeight: 600, color: TEXT_MUTED, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Resumo do período
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
              <div className="card-futurist-inner" style={{ padding: "8px 6px", textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: TEXT, letterSpacing: "-0.01em" }}>52%</p>
                <p style={{ margin: "2px 0 0 0", fontSize: 10, color: TEXT_MUTED }}>Média</p>
              </div>
              <div className="card-futurist-inner" style={{ padding: "8px 6px", textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: TEXT, letterSpacing: "-0.01em" }}>93%</p>
                <p style={{ margin: "2px 0 0 0", fontSize: 10, color: TEXT_MUTED }}>Máx.</p>
              </div>
              <div className="card-futurist-inner" style={{ padding: "8px 6px", textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: TEXT, letterSpacing: "-0.01em" }}>68%</p>
                <p style={{ margin: "2px 0 0 0", fontSize: 10, color: TEXT_MUTED }}>Melhor</p>
              </div>
            </div>
          </div>
        </CardDark>
      </div>

      {/* Row 2: Atividade + Detalhes do Saldo */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
        {/* Atividade de Pagamentos */}
        <CardDark delay={160}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "nowrap" }}>
              <h2 className="card-section-title" style={{ marginBottom: 0 }}>Atividade de Pagamentos</h2>
              <button type="button" className="btn-info-inline" aria-label="Mais informações">
                <Info size={10} strokeWidth={2.5} />
              </button>
            </div>
            <DropdownWithCalendar />
          </div>
          <div className="payment-activity-chart" style={{ height: 280, marginLeft: -6, marginRight: -4, marginBottom: -4 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={paymentActivityData}
                margin={{ top: 4, right: 8, left: 12, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="activityAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={ACCENT} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: TEXT_MUTED, fontSize: 11, fontWeight: 500 }}
                  dy={6}
                />
                <YAxis
                  domain={[0, 10000]}
                  width={0}
                  axisLine={false}
                  tick={false}
                  tickFormatter={() => ""}
                />
                <Tooltip
                  contentStyle={{
                    background: BG_CARD,
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    border: `1px solid ${BORDER_ACCENT}`,
                    borderRadius: 12,
                    color: TEXT,
                    padding: "10px 14px",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(243,15,34,0.12)",
                  }}
                  formatter={(value) => [`R$ ${Number(value).toLocaleString("pt-BR")}`, "Volume"]}
                  labelFormatter={(label) => monthLabelFull[label] ?? label}
                  cursor={{ stroke: BORDER, strokeWidth: 1, strokeDasharray: "4 4" }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={ACCENT}
                  strokeWidth={2}
                  fill="url(#activityAreaGradient)"
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: ACCENT,
                    stroke: "rgba(255,255,255,0.4)",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardDark>

        {/* Formas de conversão: ref. 2ª imagem — título em cima, barra grossa embaixo, % no canto direito */}
        <CardDark delay={220} style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 12, flexWrap: "nowrap" }}>
            <h2 className="card-section-title" style={{ marginBottom: 0 }}>Formas de conversão</h2>
            <button type="button" className="btn-info-inline" aria-label="Mais informações">
              <Info size={10} strokeWidth={2.5} />
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0, flex: 1, justifyContent: "space-evenly" }}>
            {conversionIndexData.map((entry, i) => (
              <div key={entry.name}>
                {i === conversionIndexSeparatorAfter && (
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", margin: "10px 0" }} />
                )}
                <div style={{ marginBottom: 2 }}>
                  {/* Título em cima */}
                  <p style={{ margin: "0 0 4px 0", fontSize: 13, color: TEXT, fontWeight: 600 }}>{entry.name}</p>
                  {/* Barra com % no canto direito */}
                  <div
                    className="conversion-bar-track"
                    style={{
                      position: "relative",
                      height: 22,
                      borderRadius: 11,
                      background: "rgba(255,255,255,0.06)",
                      overflow: "visible",
                      border: "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    <div
                      className="conversion-bar-fill"
                      style={{
                        height: "100%",
                        width: `${entry.index}%`,
                        minWidth: entry.index > 0 ? 8 : 0,
                        borderRadius: 10,
                        background: `linear-gradient(90deg, ${ACCENT} 0%, rgba(243,15,34,0.88) 100%)`,
                        boxShadow: "0 0 14px rgba(243,15,34,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
                        transition: "width 0.85s cubic-bezier(0.25, 0.1, 0.25, 1)",
                      }}
                    />
                    {/* Percentual dentro da barra, no canto direito */}
                    <span
                      style={{
                        position: "absolute",
                        right: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: 12,
                        fontWeight: 700,
                        color: entry.index > 15 ? "#fff" : ACCENT,
                        pointerEvents: "none",
                      }}
                    >
                      {entry.index}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardDark>
      </div>
    </div>
  );
}
