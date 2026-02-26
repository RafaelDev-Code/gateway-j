/**
 * PageShell — wrapper padrão para todas as páginas internas.
 * Aplica animação de entrada, título e subtítulo no padrão visual.
 */
import { theme } from "../theme";

const TEXT       = theme.text;
const TEXT_MUTED = theme.textMuted;
const ACCENT     = theme.accent;

export function PageShell({ icon: Icon, title, subtitle, actions, children }) {
  return (
    <div className="dashboard-page" style={{ display: "flex", flexDirection: "column", gap: 24, width: "100%", maxWidth: "100%", minWidth: 0 }}>
      {/* ── Header da página ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {Icon && (
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "rgba(243,15,34,0.1)",
              border: "1px solid rgba(243,15,34,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <Icon size={22} strokeWidth={2} style={{ color: ACCENT }} />
            </div>
          )}
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: TEXT, letterSpacing: "-0.02em" }}>
              {title}
            </h1>
            {subtitle && (
              <p style={{ margin: "4px 0 0", fontSize: 13, color: TEXT_MUTED }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {actions && (
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            {actions}
          </div>
        )}
      </div>

      {/* ── Conteúdo ── */}
      {children}
    </div>
  );
}

/** Card padrão dark glass para uso nas páginas */
export function Card({ children, style = {}, className = "" }) {
  return (
    <div
      className={`card-futurist ${className}`}
      style={{
        background:   "rgba(18, 3, 4, 0.72)",
        border:       "1px solid rgba(255,255,255,0.08)",
        borderRadius: 14,
        padding:      24,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Stat card numérico */
export function StatCard({ icon: Icon, label, value, sub, subColor, delay = 0 }) {
  return (
    <div
      className="card-futurist"
      style={{
        background:   "rgba(18, 3, 4, 0.72)",
        border:       "1px solid rgba(255,255,255,0.08)",
        borderRadius: 14,
        padding:      "18px 20px",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        animation:    `cardEnter 0.45s cubic-bezier(0.22,1,0.36,1) ${delay}ms both`,
        display:      "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: theme.textMuted, letterSpacing: "0.04em", textTransform: "uppercase" }}>
          {label}
        </span>
        {Icon && (
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "rgba(243,15,34,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon size={16} strokeWidth={2} style={{ color: theme.accent }} />
          </div>
        )}
      </div>
      <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: TEXT, letterSpacing: "-0.03em" }}>
        {value}
      </p>
      {sub && (
        <p style={{ margin: 0, fontSize: 12, color: subColor ?? theme.textMuted }}>
          {sub}
        </p>
      )}
    </div>
  );
}

/** Badge de status */
export function StatusBadge({ status }) {
  const map = {
    ativo:       { bg: "rgba(34,197,94,0.12)",  color: "#22c55e", label: "Ativo"        },
    inativo:     { bg: "rgba(239,68,68,0.12)",  color: "#ef4444", label: "Inativo"      },
    pendente:    { bg: "rgba(234,179,8,0.12)",  color: "#eab308", label: "Pendente"     },
    concluido:   { bg: "rgba(34,197,94,0.12)",  color: "#22c55e", label: "Concluído"    },
    processando: { bg: "rgba(59,130,246,0.12)", color: "#3b82f6", label: "Processando"  },
    cancelado:   { bg: "rgba(239,68,68,0.12)",  color: "#ef4444", label: "Cancelado"    },
    reembolsado: { bg: "rgba(168,85,247,0.12)", color: "#a855f7", label: "Reembolsado"  },
  };
  const s = map[status?.toLowerCase()] ?? { bg: "rgba(255,255,255,0.08)", color: theme.textMuted, label: status };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 99,
      background: s.bg, color: s.color,
      fontSize: 12, fontWeight: 600,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color }} />
      {s.label}
    </span>
  );
}

/** Input padrão dark */
export function DarkInput({ label, id, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label htmlFor={id} style={{ fontSize: 13, fontWeight: 500, color: theme.textMuted }}>
          {label}
        </label>
      )}
      <input
        id={id}
        style={{
          background:    "rgba(255,255,255,0.04)",
          border:        "1px solid rgba(255,255,255,0.1)",
          borderRadius:  8,
          padding:       "11px 14px",
          color:         TEXT,
          fontSize:      14,
          outline:       "none",
          fontFamily:    "var(--font-body)",
          transition:    "border-color 0.2s",
          width:         "100%",
          boxSizing:     "border-box",
        }}
        onFocus={e => e.target.style.borderColor = "rgba(243,15,34,0.5)"}
        onBlur={e  => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
        {...props}
      />
    </div>
  );
}

/** Select padrão dark */
export function DarkSelect({ label, id, children, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label htmlFor={id} style={{ fontSize: 13, fontWeight: 500, color: theme.textMuted }}>
          {label}
        </label>
      )}
      <select
        id={id}
        style={{
          background:   "rgba(255,255,255,0.04)",
          border:       "1px solid rgba(255,255,255,0.1)",
          borderRadius: 8,
          padding:      "11px 14px",
          color:        TEXT,
          fontSize:     14,
          outline:      "none",
          fontFamily:   "var(--font-body)",
          cursor:       "pointer",
          width:        "100%",
        }}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
