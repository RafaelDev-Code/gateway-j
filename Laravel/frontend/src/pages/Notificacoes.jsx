import { Bell, CheckCheck, Info, AlertTriangle, XCircle } from "lucide-react";

const NOTIFS = [
  { id: 1, tipo: "info",    titulo: "Nova transação aprovada",         desc: "TXN-8821 de R$ 1.250,00 foi aprovada com sucesso.",   tempo: "há 2 min",  lida: false },
  { id: 2, tipo: "warning", titulo: "Strike com latência elevada",     desc: "O adquirente Strike está com latência de 180ms.",      tempo: "há 15 min", lida: false },
  { id: 3, tipo: "danger",  titulo: "BSPay indisponível",              desc: "O adquirente BSPay está fora do ar há 8 minutos.",     tempo: "há 22 min", lida: false },
  { id: 4, tipo: "info",    titulo: "Saque processado",                desc: "Seu saque de R$ 2.000,00 foi processado com sucesso.", tempo: "há 1h",     lida: true  },
  { id: 5, tipo: "info",    titulo: "Relatório mensal disponível",     desc: "O relatório de Janeiro/2026 está pronto para download.",tempo: "há 2h",     lida: true  },
];

const ICON = { info: Info, warning: AlertTriangle, danger: XCircle };
const COLOR = { info: "var(--info)", warning: "var(--warning)", danger: "var(--danger)" };
const BG    = { info: "var(--info-bg)", warning: "var(--warning-bg)", danger: "var(--danger-bg)" };

export function Notificacoes() {
  return (
    <div>
      <div className="page-header animate-fade-in">
        <div>
          <h1 className="page-title">Notificações</h1>
          <p className="page-subtitle">3 não lidas</p>
        </div>
        <button className="btn btn-secondary btn-sm">
          <CheckCheck size={14} /> Marcar todas como lidas
        </button>
      </div>

      <div className="card animate-fade-up" style={{ maxWidth: 720 }}>
        {NOTIFS.map((n, i) => {
          const Icon = ICON[n.tipo];
          return (
            <div
              key={n.id}
              style={{
                display: "flex",
                gap: 14,
                padding: "16px 20px",
                borderBottom: i < NOTIFS.length - 1 ? "1px solid var(--border-light)" : "none",
                background: !n.lida ? "var(--accent-soft)" : "transparent",
                transition: "background 0.2s",
                cursor: "pointer",
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: "var(--radius)", flexShrink: 0,
                background: BG[n.tipo], display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={18} color={COLOR[n.tipo]} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <p style={{ fontSize: 14, fontWeight: n.lida ? 500 : 700, color: "var(--text-primary)" }}>{n.titulo}</p>
                  <span style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{n.tempo}</span>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>{n.desc}</p>
              </div>
              {!n.lida && (
                <div style={{
                  width: 8, height: 8, borderRadius: "50%", background: "var(--accent)",
                  flexShrink: 0, marginTop: 6,
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
