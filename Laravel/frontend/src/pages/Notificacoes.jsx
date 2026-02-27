import { useState } from "react";
import { Bell, Info, AlertTriangle, XCircle, CheckCheck, Inbox } from "lucide-react";

const NOTIFS_INIT = [
  { id: 1, tipo: "info",    titulo: "Nova transação aprovada",       desc: "TXN-8821 de R$ 1.250,00 foi aprovada com sucesso.",        tempo: "há 2 min",  lida: false },
  { id: 2, tipo: "warning", titulo: "Strike com latência elevada",   desc: "O adquirente Strike está com latência de 180ms.",           tempo: "há 15 min", lida: false },
  { id: 3, tipo: "danger",  titulo: "BSPay indisponível",            desc: "O adquirente BSPay está fora do ar há 8 minutos.",          tempo: "há 22 min", lida: false },
  { id: 4, tipo: "info",    titulo: "Saque processado",              desc: "Seu saque de R$ 2.000,00 foi processado com sucesso.",      tempo: "há 1h",     lida: true  },
  { id: 5, tipo: "info",    titulo: "Relatório mensal disponível",   desc: "O relatório de Janeiro/2026 está pronto para download.",    tempo: "há 2h",     lida: true  },
  { id: 6, tipo: "warning", titulo: "Tentativa de login suspeita",   desc: "Detectamos um acesso de IP desconhecido (201.18.92.44).",   tempo: "há 3h",     lida: true  },
  { id: 7, tipo: "info",    titulo: "Transação aprovada",            desc: "TXN-8799 de R$ 430,00 aprovada via Cartão.",                tempo: "há 5h",     lida: true  },
  { id: 8, tipo: "danger",  titulo: "Contestação recebida",          desc: "DSP-441 de R$ 445,00 aguarda sua resposta.",                tempo: "há 6h",     lida: true  },
];

const META = {
  info:    { icon: Info,          cor: "var(--accent)",  bg: "var(--accent-faint)" },
  warning: { icon: AlertTriangle, cor: "var(--yellow)",  bg: "var(--yellow-faint)" },
  danger:  { icon: XCircle,       cor: "var(--red)",     bg: "var(--red-faint)"    },
};

const FILTROS = [
  { id: "todas",   label: "Todas"    },
  { id: "info",    label: "Info"     },
  { id: "warning", label: "Alertas"  },
  { id: "danger",  label: "Críticas" },
  { id: "naoLida", label: "Não lidas"},
];

const LIMITE = 8;

export function Notificacoes() {
  const [notifs,    setNotifs]    = useState(NOTIFS_INIT);
  const [filtro,    setFiltro]    = useState("todas");
  const [mostrar,   setMostrar]   = useState(LIMITE);

  const naoLidas    = notifs.filter((n) => !n.lida).length;
  const marcarTodas = () => setNotifs((p) => p.map((n) => ({ ...n, lida: true })));
  const marcarUma   = (id) => setNotifs((p) => p.map((n) => n.id === id ? { ...n, lida: true } : n));

  const filtrada = notifs.filter((n) => {
    if (filtro === "naoLida") return !n.lida;
    if (filtro === "todas") return true;
    return n.tipo === filtro;
  });

  const lista      = filtrada.slice(0, mostrar);
  const temMais    = filtrada.length > mostrar;

  const onFiltro = (f) => { setFiltro(f); setMostrar(LIMITE); };

  return (
    <div>
      <div className="page-header animate-fade-in">
        <div>
          <h1 className="page-title">Notificações</h1>
          <p className="page-subtitle">
            {naoLidas > 0 ? `${naoLidas} não lida${naoLidas > 1 ? "s" : ""}` : "Tudo em dia"}
          </p>
        </div>
        {naoLidas > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={marcarTodas}>
            <CheckCheck size={14} /> Marcar todas como lidas
          </button>
        )}
      </div>

      <div className="card animate-fade-up">
        <div className="card-head">
          <p className="card-title">Central de notificações</p>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {FILTROS.map((f) => (
              <button
                key={f.id}
                className={`btn btn-xs${filtro === f.id ? " btn-primary" : " btn-ghost"}`}
                onClick={() => onFiltro(f.id)}
              >
                {f.label}
                {f.id === "naoLida" && naoLidas > 0 && (
                  <span style={{
                    marginLeft: 4, background: "var(--accent)", color: "#fff",
                    borderRadius: 99, fontSize: 10, fontWeight: 700,
                    padding: "0 5px", lineHeight: "16px", display: "inline-block",
                  }}>{naoLidas}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {lista.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-3)" }}>
            <Inbox size={28} style={{ margin: "0 auto 10px", opacity: 0.2 }} />
            <p style={{ fontSize: 13 }}>Nenhuma notificação nesta categoria.</p>
          </div>
        ) : lista.map((n, i) => {
          const { icon: Icon, cor, bg } = META[n.tipo];
          return (
            <div
              key={n.id}
              className={`notif-row${n.lida ? "" : " notif-unread"}`}
              style={{ borderBottom: i < lista.length - 1 ? "1px solid var(--border-2)" : "none" }}
              onClick={() => marcarUma(n.id)}
            >
              <div className="notif-icon" style={{ background: bg }}>
                <Icon size={15} color={cor} />
              </div>
              <div className="notif-body">
                <div className="notif-top">
                  <span className="notif-titulo">{n.titulo}</span>
                  <span className="notif-tempo">{n.tempo}</span>
                </div>
                <p className="notif-desc">{n.desc}</p>
              </div>
              {!n.lida && <div className="notif-dot" />}
            </div>
          );
        })}

        {/* Ver mais */}
        {temMais && (
          <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border-2)", textAlign: "center" }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setMostrar((v) => v + LIMITE)}>
              Ver mais ({filtrada.length - mostrar} restantes)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
