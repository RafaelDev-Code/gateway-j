import { useState } from "react";
import { Webhook, Plus, CheckCircle, XCircle, RefreshCw, Trash2, Activity } from "lucide-react";
import { PageShell, Card, StatCard, DarkInput, DarkSelect } from "../../componentes/PageShell";
import { theme } from "../../theme";

const ACCENT = theme.accent; const TEXT = theme.text; const TEXT_MUTED = theme.textMuted;

const WEBHOOKS_INIT = [
  { id: 1, url: "https://meusite.com/webhook/pagamento",  evento: "payment.confirmed", ativo: true,  ult: "Há 2 min",   falhas: 0 },
  { id: 2, url: "https://api.exemplo.com/hooks/refund",   evento: "payment.refunded",  ativo: true,  ult: "Há 1h",      falhas: 0 },
  { id: 3, url: "https://outro.site.com/notificacao",     evento: "payment.failed",    ativo: false, ult: "Há 3 dias",  falhas: 7 },
];

const EVENTOS = ["payment.confirmed", "payment.refunded", "payment.failed", "payment.created", "chargeback.created"];

export function Webhooks() {
  const [webhooks, setWebhooks] = useState(WEBHOOKS_INIT);
  const [modal,    setModal]    = useState(false);
  const [form,     setForm]     = useState({ url: "", evento: EVENTOS[0] });

  const toggle = (id) => setWebhooks(prev => prev.map(w => w.id === id ? { ...w, ativo: !w.ativo } : w));
  const remove = (id) => setWebhooks(prev => prev.filter(w => w.id !== id));
  const criar  = ()   => {
    if (!form.url) return;
    setWebhooks(prev => [...prev, { id: Date.now(), url: form.url, evento: form.evento, ativo: true, ult: "Nunca", falhas: 0 }]);
    setModal(false); setForm({ url: "", evento: EVENTOS[0] });
  };

  const ativos  = webhooks.filter(w => w.ativo).length;
  const falhas  = webhooks.reduce((a, w) => a + w.falhas, 0);

  return (
    <PageShell icon={Webhook} title="Webhooks" subtitle="Configure endpoints para receber notificações em tempo real"
      actions={
        <button onClick={() => setModal(true)} className="btn-futurist btn-futurist-primary" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          <Plus size={16} /> Novo Webhook
        </button>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        <StatCard icon={CheckCircle} label="Ativos"         value={`${ativos}`}            sub={`de ${webhooks.length} configurados`} delay={0}  />
        <StatCard icon={Activity}    label="Envios hoje"    value="124"                    sub="100% entregues"    delay={60}  />
        <StatCard icon={XCircle}     label="Falhas recentes" value={`${falhas}`}           sub="Últimas 24h"       delay={120} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {webhooks.map((w, i) => (
          <Card key={w.id} style={{ animation: `cardEnter 0.4s ease ${200 + i * 60}ms both`, padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: w.ativo ? "#22c55e" : "#ef4444", flexShrink: 0 }} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.url}</span>
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 99, background: "rgba(59,130,246,0.1)", color: "#3b82f6", fontWeight: 600 }}>{w.evento}</span>
                  <span style={{ fontSize: 12, color: TEXT_MUTED }}>Último envio: {w.ult}</span>
                  {w.falhas > 0 && <span style={{ fontSize: 12, color: "#ef4444" }}>{w.falhas} falha{w.falhas > 1 ? "s" : ""}</span>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                <button onClick={() => toggle(w.id)} title={w.ativo ? "Desativar" : "Ativar"} style={{ background: "transparent", border: "none", cursor: "pointer", color: w.ativo ? "#22c55e" : TEXT_MUTED, padding: 6, borderRadius: 6, transition: "color 0.2s" }}>
                  {w.ativo ? <CheckCircle size={18} /> : <XCircle size={18} />}
                </button>
                <button title="Testar" style={{ background: "transparent", border: "none", cursor: "pointer", color: TEXT_MUTED, padding: 6, borderRadius: 6, transition: "color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.color = ACCENT} onMouseLeave={e => e.currentTarget.style.color = TEXT_MUTED}>
                  <RefreshCw size={16} />
                </button>
                <button onClick={() => remove(w.id)} title="Remover" style={{ background: "transparent", border: "none", cursor: "pointer", color: TEXT_MUTED, padding: 6, borderRadius: 6, transition: "color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#ef4444"} onMouseLeave={e => e.currentTarget.style.color = TEXT_MUTED}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {modal && (
        <div onClick={() => setModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#0d0204", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 28, width: "100%", maxWidth: 460, animation: "cardEnter 0.3s ease both" }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 17, fontWeight: 800, color: TEXT }}>Novo Webhook</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <DarkInput label="URL do endpoint" placeholder="https://seusite.com/webhook" value={form.url} onChange={e => setForm({...form, url: e.target.value})} />
              <DarkSelect label="Evento" value={form.evento} onChange={e => setForm({...form, evento: e.target.value})}>
                {EVENTOS.map(ev => <option key={ev} value={ev}>{ev}</option>)}
              </DarkSelect>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
              <button onClick={() => setModal(false)} className="btn-futurist btn-futurist-outline" style={{ flex: 1, padding: "12px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
              <button onClick={criar} className="btn-futurist btn-futurist-primary" style={{ flex: 1, padding: "12px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Criar Webhook</button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
