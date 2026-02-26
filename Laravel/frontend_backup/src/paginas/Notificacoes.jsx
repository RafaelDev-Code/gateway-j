import { useState } from "react";
import { Bell, Check, CheckCheck, Trash2, AlertTriangle, Info, DollarSign, Settings, ChevronRight } from "lucide-react";
import { PageShell, Card } from "../componentes/PageShell";
import { theme } from "../theme";

const TEXT       = theme.text;
const TEXT_MUTED = theme.textMuted;
const ACCENT     = theme.accent;

const NOTIFICACOES = [
  { id: 1, tipo: "pagamento",  icone: DollarSign,     titulo: "Pagamento recebido",          desc: "Você recebeu R$ 1.250,00 via PIX de João Silva.",    tempo: "Há 5 min",    lida: false, grupo: "hoje"     },
  { id: 2, tipo: "alerta",     icone: AlertTriangle,  titulo: "Tentativa de saque bloqueada", desc: "Uma tentativa de saque fora do horário foi bloqueada.", tempo: "Há 32 min",   lida: false, grupo: "hoje"     },
  { id: 3, tipo: "info",       icone: Info,           titulo: "Novo documento solicitado",    desc: "Seu KYC precisa de atualização. Envie os documentos.", tempo: "Há 2h",        lida: false, grupo: "hoje"     },
  { id: 4, tipo: "pagamento",  icone: DollarSign,     titulo: "Cobrança paga",                desc: "A cobrança #COB-00342 foi paga pelo cliente.",          tempo: "Há 4h",        lida: true,  grupo: "hoje"     },
  { id: 5, tipo: "sistema",    icone: Settings,       titulo: "Atualização do sistema",       desc: "Plataforma atualizada para a versão 2.4.1 com sucesso.", tempo: "Ontem 18:30",  lida: true,  grupo: "semana"   },
  { id: 6, tipo: "pagamento",  icone: DollarSign,     titulo: "Depósito confirmado",          desc: "R$ 5.000,00 foram creditados na sua conta.",             tempo: "Ontem 14:10",  lida: true,  grupo: "semana"   },
  { id: 7, tipo: "alerta",     icone: AlertTriangle,  titulo: "Limite de saque atingido",     desc: "Você atingiu 80% do seu limite mensal de saques.",       tempo: "Seg, 09:00",   lida: true,  grupo: "semana"   },
  { id: 8, tipo: "info",       icone: Info,           titulo: "Nova integração disponível",   desc: "A integração com Hotmart foi atualizada. Reconecte.",    tempo: "Dom, 11:20",   lida: true,  grupo: "antigas"  },
  { id: 9, tipo: "pagamento",  icone: DollarSign,     titulo: "Reembolso processado",         desc: "O reembolso de R$ 300,00 foi processado com sucesso.",   tempo: "Sáb, 08:45",   lida: true,  grupo: "antigas"  },
];

const FILTROS = ["Todas", "Não lidas", "Pagamentos", "Alertas", "Sistema"];

const TIPO_CORES = {
  pagamento: { bg: "rgba(34,197,94,0.12)",   color: "#22c55e"  },
  alerta:    { bg: "rgba(234,179,8,0.12)",   color: "#eab308"  },
  info:      { bg: "rgba(59,130,246,0.12)",  color: "#3b82f6"  },
  sistema:   { bg: "rgba(168,85,247,0.12)",  color: "#a855f7"  },
};

export function Notificacoes() {
  const [filtro,     setFiltro]     = useState("Todas");
  const [notifs,     setNotifs]     = useState(NOTIFICACOES);

  const naoLidas = notifs.filter((n) => !n.lida).length;

  const filtradas = notifs.filter((n) => {
    if (filtro === "Não lidas")  return !n.lida;
    if (filtro === "Pagamentos") return n.tipo === "pagamento";
    if (filtro === "Alertas")    return n.tipo === "alerta";
    if (filtro === "Sistema")    return n.tipo === "sistema";
    return true;
  });

  const marcarTodasLidas = () => setNotifs((prev) => prev.map((n) => ({ ...n, lida: true })));
  const marcarLida = (id)      => setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, lida: true } : n));
  const remover    = (id)      => setNotifs((prev) => prev.filter((n) => n.id !== id));

  const grupos = [
    { key: "hoje",    label: "Hoje"              },
    { key: "semana",  label: "Esta semana"       },
    { key: "antigas", label: "Mais antigas"      },
  ];

  return (
    <PageShell
      icon={Bell}
      title="Notificações"
      subtitle={naoLidas > 0 ? `${naoLidas} não lida${naoLidas > 1 ? "s" : ""}` : "Tudo em dia"}
      actions={
        naoLidas > 0 && (
          <button
            onClick={marcarTodasLidas}
            className="btn-futurist btn-futurist-outline"
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            <CheckCheck size={16} />
            Marcar todas como lidas
          </button>
        )
      }
    >
      {/* Filtros */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {FILTROS.map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            style={{
              padding:      "8px 16px",
              borderRadius: 99,
              border:       filtro === f ? `1px solid ${ACCENT}` : "1px solid rgba(255,255,255,0.1)",
              background:   filtro === f ? "rgba(243,15,34,0.1)" : "rgba(255,255,255,0.03)",
              color:        filtro === f ? ACCENT : TEXT_MUTED,
              fontSize:     13,
              fontWeight:   filtro === f ? 600 : 400,
              cursor:       "pointer",
              fontFamily:   "var(--font-body)",
              transition:   "all 0.18s ease",
            }}
          >
            {f}
            {f === "Não lidas" && naoLidas > 0 && (
              <span style={{ marginLeft: 6, padding: "1px 6px", borderRadius: 99, background: ACCENT, color: "#fff", fontSize: 11, fontWeight: 700 }}>
                {naoLidas}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Lista por grupo */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {grupos.map(({ key, label }) => {
          const itens = filtradas.filter((n) => n.grupo === key);
          if (itens.length === 0) return null;
          return (
            <div key={key}>
              <p style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 700, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {label}
              </p>
              <Card style={{ padding: 0, overflow: "hidden" }}>
                {itens.map((n, idx) => {
                  const Icon = n.icone;
                  const cor  = TIPO_CORES[n.tipo] ?? TIPO_CORES.info;
                  return (
                    <div
                      key={n.id}
                      style={{
                        display:       "flex",
                        alignItems:    "flex-start",
                        gap:           14,
                        padding:       "16px 20px",
                        borderBottom:  idx < itens.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                        background:    n.lida ? "transparent" : "rgba(243,15,34,0.03)",
                        transition:    "background 0.2s ease",
                      }}
                    >
                      {/* Ícone */}
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: cor.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                        <Icon size={18} strokeWidth={2} style={{ color: cor.color }} />
                      </div>

                      {/* Conteúdo */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                          <p style={{ margin: 0, fontSize: 14, fontWeight: n.lida ? 400 : 700, color: n.lida ? TEXT_MUTED : TEXT }}>
                            {n.titulo}
                          </p>
                          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap", flexShrink: 0 }}>
                            {n.tempo}
                          </span>
                        </div>
                        <p style={{ margin: "4px 0 0", fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>
                          {n.desc}
                        </p>
                      </div>

                      {/* Ações */}
                      <div style={{ display: "flex", gap: 6, flexShrink: 0, marginTop: 2 }}>
                        {!n.lida && (
                          <button
                            onClick={() => marcarLida(n.id)}
                            title="Marcar como lida"
                            style={{ background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", padding: 4, borderRadius: 6, transition: "color 0.2s" }}
                            onMouseEnter={e => e.currentTarget.style.color = "#22c55e"}
                            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}
                          >
                            <Check size={15} />
                          </button>
                        )}
                        <button
                          onClick={() => remover(n.id)}
                          title="Remover"
                          style={{ background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", padding: 4, borderRadius: 6, transition: "color 0.2s" }}
                          onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
                          onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      {/* Dot não lida */}
                      {!n.lida && (
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: ACCENT, flexShrink: 0, marginTop: 6 }} />
                      )}
                    </div>
                  );
                })}
              </Card>
            </div>
          );
        })}

        {filtradas.length === 0 && (
          <Card style={{ textAlign: "center", padding: "40px 20px" }}>
            <Bell size={36} style={{ color: "rgba(255,255,255,0.2)", marginBottom: 12 }} />
            <p style={{ margin: 0, color: TEXT_MUTED, fontSize: 14 }}>Nenhuma notificação encontrada</p>
          </Card>
        )}
      </div>
    </PageShell>
  );
}
