import { useState, useEffect } from "react";
import { Bell, Info, AlertTriangle, XCircle, CheckCheck, Inbox, Loader2, CheckCircle2 } from "lucide-react";
import { apiJson } from "../api/client";
import { useNotifications } from "../contexts/NotificationContext";

const META = {
  info:    { icon: Info,          cor: "var(--accent)",  bg: "var(--accent-faint)" },
  success: { icon: CheckCircle2,  cor: "var(--green)",   bg: "var(--green-faint)"  },
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

const LIMITE = 20;

function timeAgo(iso) {
  if (!iso) return "";
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)  return "agora";
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)}h`;
  return `há ${Math.floor(diff / 86400)} dia${Math.floor(diff / 86400) > 1 ? "s" : ""}`;
}

function mapNotif(n) {
  return {
    id:     n.id,
    tipo:   META[n.type] ? n.type : "info",
    titulo: n.title,
    desc:   n.message,
    tempo:  timeAgo(n.created_at),
    lida:   n.is_read,
  };
}

export function Notificacoes() {
  const { refreshCount } = useNotifications();
  const [notifs,  setNotifs]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro,  setFiltro]  = useState("todas");
  const [pagina,  setPagina]  = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [marking, setMarking] = useState(false);

  const load = (page = 1) => {
    setLoading(true);
    apiJson(`/notifications?page=${page}`)
      .then((r) => {
        const list = Array.isArray(r?.data) ? r.data.map(mapNotif) : [];
        setNotifs((prev) => page === 1 ? list : [...prev, ...list]);
        setLastPage(r?.meta?.last_page ?? 1);
        setPagina(page);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(1); }, []);

  const naoLidas = notifs.filter((n) => !n.lida).length;

  const marcarUma = async (id) => {
    const notif = notifs.find((n) => n.id === id);
    if (!notif || notif.lida) return;
    setNotifs((p) => p.map((n) => n.id === id ? { ...n, lida: true } : n));
    try {
      await apiJson(`/notifications/${id}/read`, { method: "PUT" });
      refreshCount();
    } catch {
      setNotifs((p) => p.map((n) => n.id === id ? { ...n, lida: false } : n));
    }
  };

  const marcarTodas = async () => {
    if (marking) return;
    setMarking(true);
    setNotifs((p) => p.map((n) => ({ ...n, lida: true })));
    try {
      await apiJson("/notifications/read-all", { method: "POST" });
      refreshCount();
    } catch {
      load(1);
    } finally {
      setMarking(false);
    }
  };

  const filtrada = notifs.filter((n) => {
    if (filtro === "naoLida") return !n.lida;
    if (filtro === "todas")   return true;
    return n.tipo === filtro;
  });

  const onFiltro = (f) => { setFiltro(f); };

  return (
    <div>
      <div className="page-header animate-fade-in">
        <div>
          <h1 className="page-title">Notificações</h1>
          <p className="page-subtitle">
            {loading && notifs.length === 0
              ? "Carregando..."
              : naoLidas > 0
                ? `${naoLidas} não lida${naoLidas > 1 ? "s" : ""}`
                : "Tudo em dia"}
          </p>
        </div>
        {naoLidas > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={marcarTodas} disabled={marking}>
            {marking ? <Loader2 size={14} className="spin" /> : <CheckCheck size={14} />}
            Marcar todas como lidas
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

        {loading && notifs.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-3)" }}>
            <Loader2 size={24} className="spin" style={{ margin: "0 auto 10px" }} />
            <p style={{ fontSize: 13 }}>Carregando notificações...</p>
          </div>
        ) : filtrada.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-3)" }}>
            <Inbox size={28} style={{ margin: "0 auto 10px", opacity: 0.2 }} />
            <p style={{ fontSize: 13 }}>Nenhuma notificação nesta categoria.</p>
          </div>
        ) : filtrada.map((n, i) => {
          const meta = META[n.tipo] ?? META.info;
          const Icon = meta.icon;
          return (
            <div
              key={n.id}
              className={`notif-row${n.lida ? "" : " notif-unread"}`}
              style={{ borderBottom: i < filtrada.length - 1 ? "1px solid var(--border-2)" : "none", cursor: n.lida ? "default" : "pointer" }}
              onClick={() => marcarUma(n.id)}
            >
              <div className="notif-icon" style={{ background: meta.bg }}>
                <Icon size={15} color={meta.cor} />
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

        {pagina < lastPage && (
          <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border-2)", textAlign: "center" }}>
            <button className="btn btn-ghost btn-sm" disabled={loading} onClick={() => load(pagina + 1)}>
              {loading ? <Loader2 size={13} className="spin" /> : "Carregar mais"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
