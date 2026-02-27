import { useState } from "react";
import {
  Webhook, KeyRound, BarChart2, ShoppingCart,
  CheckCircle2, XCircle, ExternalLink, Copy, Check,
  RefreshCw, Eye, EyeOff, X, ChevronRight,
} from "lucide-react";

/* ─── Categorias e integrações ──────────────────────────────── */
const CATEGORIAS = [
  {
    id: "developer",
    label: "Desenvolvedor",
    desc: "Ferramentas para conectar e automatizar sua integração técnica.",
    items: [
      {
        id: "webhooks",
        label: "Webhooks",
        desc: "Notificações automáticas de eventos em tempo real no seu servidor.",
        icon: Webhook,
        iconColor: "var(--accent)",
        iconBg: "var(--accent-faint)",
        ativo: true,
        modal: "webhooks",
      },
      {
        id: "api",
        label: "Credenciais API",
        desc: "Chaves de acesso para integrar diretamente à sua aplicação.",
        icon: KeyRound,
        iconColor: "#8b5cf6",
        iconBg: "rgba(139,92,246,.10)",
        ativo: true,
        modal: "api",
      },
    ],
  },
  {
    id: "rastreamento",
    label: "Rastreamento",
    desc: "Acompanhe a origem das suas conversões e otimize campanhas.",
    items: [
      {
        id: "utmify",
        label: "Utmify",
        desc: "Rastreie a origem das vendas com UTMs e atribuição de campanhas.",
        icon: BarChart2,
        iconColor: "#f59e0b",
        iconBg: "rgba(245,158,11,.10)",
        ativo: false,
        modal: "simple",
      },
      {
        id: "empresa03",
        label: "Empresa 03",
        desc: "Rastreamento de conversões e eventos avançados de marketing.",
        icon: BarChart2,
        iconColor: "#3b82f6",
        iconBg: "rgba(59,130,246,.10)",
        ativo: false,
        modal: "simple",
      },
    ],
  },
  {
    id: "checkout",
    label: "Checkout",
    desc: "Personalize e otimize a experiência de pagamento dos seus clientes.",
    items: [
      {
        id: "empresa04",
        label: "Empresa 04",
        desc: "Checkout otimizado com experiência personalizada de pagamento.",
        icon: ShoppingCart,
        iconColor: "#10b981",
        iconBg: "rgba(16,185,129,.10)",
        ativo: false,
        modal: "simple",
      },
    ],
  },
];

/* ─── Modal Webhooks ────────────────────────────────────────── */
const EVENTOS = [
  { id: "payment.approved",  label: "Pagamento aprovado",  ativo: true  },
  { id: "payment.failed",    label: "Pagamento recusado",  ativo: true  },
  { id: "payment.refunded",  label: "Estorno realizado",   ativo: false },
  { id: "chargeback.opened", label: "Contestação aberta",  ativo: false },
  { id: "withdraw.approved", label: "Saque aprovado",      ativo: true  },
];

function ModalWebhooks({ onClose }) {
  const [url,     setUrl]     = useState("https://meusite.com/webhook");
  const [eventos, setEventos] = useState(EVENTOS);
  const [copiado, setCopiado] = useState(false);
  const secret = "whsec_k2m9x7pJq3rT8vLnZ4wY1bCd";

  const toggleEvento = (id) =>
    setEventos((prev) => prev.map((e) => e.id === id ? { ...e, ativo: !e.ativo } : e));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <label className="form-label">URL de destino</label>
        <div style={{ display: "flex", gap: 6 }}>
          <input className="form-input" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://seusite.com/webhook" style={{ flex: 1 }} />
          <button className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}>Salvar</button>
        </div>
      </div>
      <div>
        <label className="form-label">Chave secreta (Webhook Secret)</label>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--surface-2)", border: "1px solid var(--border-2)", borderRadius: "var(--radius-sm)", padding: "7px 10px" }}>
          <code style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text-2)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{secret}</code>
          <button className="btn btn-ghost btn-icon btn-xs" onClick={() => { setCopiado(true); setTimeout(() => setCopiado(false), 2000); }}>
            {copiado ? <Check size={12} style={{ color: "var(--green)" }} /> : <Copy size={12} />}
          </button>
          <button className="btn btn-ghost btn-icon btn-xs" title="Regenerar"><RefreshCw size={12} /></button>
        </div>
        <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>Use esta chave para validar a autenticidade dos eventos recebidos.</p>
      </div>
      <div>
        <label className="form-label">Eventos monitorados</label>
        <div style={{ border: "1px solid var(--border-2)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
          {eventos.map((ev, i) => (
            <label key={ev.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "9px 12px", cursor: "pointer",
              borderBottom: i < eventos.length - 1 ? "1px solid var(--border-2)" : "none",
              background: "var(--surface)",
            }}>
              <span style={{ fontSize: 12, color: "var(--text-2)" }}>{ev.label}</span>
              <div
                style={{ width: 34, height: 18, borderRadius: 999, background: ev.ativo ? "var(--accent)" : "var(--border)", position: "relative", transition: "background var(--dur)", flexShrink: 0, cursor: "pointer" }}
                onClick={() => toggleEvento(ev.id)}
              >
                <div style={{ position: "absolute", top: 2, left: ev.ativo ? 18 : 2, width: 14, height: 14, borderRadius: "50%", background: "#fff", transition: "left var(--dur)", boxShadow: "0 1px 3px rgba(0,0,0,.15)" }} />
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Modal Credenciais API ─────────────────────────────────── */
function ModalApi({ onClose }) {
  const [showSecret, setShowSecret] = useState(false);
  const [copKey,     setCopKey]     = useState(false);
  const [copSec,     setCopSec]     = useState(false);
  const apiKey    = "gjj_pk_k2m9x7pJq3rT8vLnZ4wY1bCd5eF6gH7iJ8";
  const apiSecret = "gjj_sk_Z9wX8vU7tS6rQ5pO4nM3lK2jI1hG0fE";

  const copiar = (set) => { set(true); setTimeout(() => set(false), 2000); };

  const Campo = ({ label, value, show, onToggle, cop, setCop }) => (
    <div>
      <label className="form-label">{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--surface-2)", border: "1px solid var(--border-2)", borderRadius: "var(--radius-sm)", padding: "7px 10px" }}>
        <code style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text-2)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {show ? value : value.slice(0, 14) + "••••••••••••••••••••"}
        </code>
        {onToggle && (
          <button className="btn btn-ghost btn-icon btn-xs" onClick={onToggle}>
            {show ? <EyeOff size={12} /> : <Eye size={12} />}
          </button>
        )}
        <button className="btn btn-ghost btn-icon btn-xs" onClick={() => copiar(setCop)}>
          {cop ? <Check size={12} style={{ color: "var(--green)" }} /> : <Copy size={12} />}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Campo label="API Key (Pública)" value={apiKey} show cop={copKey} setCop={setCopKey} />
      <Campo label="API Secret (Privada)" value={apiSecret} show={showSecret} onToggle={() => setShowSecret((v) => !v)} cop={copSec} setCop={setCopSec} />
      <div style={{ background: "rgba(245,158,11,.08)", border: "1px solid rgba(245,158,11,.2)", borderRadius: "var(--radius-sm)", padding: "10px 12px" }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "var(--yellow)", marginBottom: 3 }}>⚠ Nunca compartilhe seu API Secret</p>
        <p style={{ fontSize: 11, color: "var(--text-3)", lineHeight: 1.5 }}>O secret deve ser usado apenas no servidor. Jamais o exponha no frontend ou em repositórios públicos.</p>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn btn-ghost btn-sm" style={{ gap: 5 }}><RefreshCw size={12} /> Regenerar chaves</button>
        <a href="#" className="btn btn-ghost btn-sm" style={{ gap: 5, textDecoration: "none" }}><ExternalLink size={12} /> Documentação</a>
      </div>
    </div>
  );
}

/* ─── Modal simples ─────────────────────────────────────────── */
function ModalSimples({ integ, onClose }) {
  const [ativo,  setAtivo]  = useState(integ.ativo);
  const [apiKey, setApiKey] = useState("");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "var(--surface-2)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-2)" }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>{ativo ? "Integração ativa" : "Integração inativa"}</p>
          <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 1 }}>{ativo ? `Dados sendo enviados para ${integ.label}` : "Ative para começar a enviar dados"}</p>
        </div>
        <div
          style={{ width: 38, height: 20, borderRadius: 999, background: ativo ? "var(--accent)" : "var(--border)", position: "relative", transition: "background var(--dur)", cursor: "pointer", flexShrink: 0 }}
          onClick={() => setAtivo((v) => !v)}
        >
          <div style={{ position: "absolute", top: 3, left: ativo ? 21 : 3, width: 14, height: 14, borderRadius: "50%", background: "#fff", transition: "left var(--dur)", boxShadow: "0 1px 3px rgba(0,0,0,.15)" }} />
        </div>
      </div>
      <div>
        <label className="form-label">
          {integ.id === "utmify" ? "Token de rastreamento" : "Chave de integração"}
        </label>
        <div style={{ display: "flex", gap: 6 }}>
          <input className="form-input" placeholder={`Cole aqui a chave da ${integ.label}`} value={apiKey} onChange={(e) => setApiKey(e.target.value)} style={{ flex: 1 }} />
          <button className="btn btn-primary btn-sm" disabled={!apiKey} style={{ flexShrink: 0 }}>Salvar</button>
        </div>
      </div>
      <a href="#" style={{ fontSize: 12, color: "var(--accent)", display: "inline-flex", alignItems: "center", gap: 4, textDecoration: "none" }}>
        <ExternalLink size={12} /> Como integrar com {integ.label}
      </a>
    </div>
  );
}

/* ─── Modal wrapper ─────────────────────────────────────────── */
function ModalIntegracao({ integ, onClose }) {
  const Icon = integ.icon;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: "var(--radius-sm)", background: integ.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon size={15} style={{ color: integ.iconColor }} />
            </div>
            <div>
              <p className="modal-titulo">{integ.label}</p>
              <p className="modal-subtitulo">{integ.desc}</p>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          {integ.modal === "webhooks" && <ModalWebhooks onClose={onClose} />}
          {integ.modal === "api"      && <ModalApi      onClose={onClose} />}
          {integ.modal === "simple"   && <ModalSimples  integ={integ} onClose={onClose} />}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Card de integração ────────────────────────────────────── */
function IntegCard({ integ, onConfig }) {
  const Icon = integ.icon;
  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", padding: "16px 18px", gap: 12 }}>
      {/* Topo: ícone + status */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{ width: 40, height: 40, borderRadius: "var(--radius-sm)", background: integ.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={19} style={{ color: integ.iconColor }} />
        </div>
        {integ.ativo
          ? <span className="badge badge-green"  style={{ fontSize: 10, gap: 3 }}><CheckCircle2 size={9} /> Ativo</span>
          : <span className="badge badge-neutral" style={{ fontSize: 10, gap: 3 }}><XCircle      size={9} /> Inativo</span>
        }
      </div>

      {/* Nome + descrição */}
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)", marginBottom: 4 }}>{integ.label}</p>
        <p style={{ fontSize: 12, color: "var(--text-3)", lineHeight: 1.5 }}>{integ.desc}</p>
      </div>

      {/* Botão */}
      <button
        className="btn btn-ghost btn-sm"
        style={{ width: "100%", justifyContent: "center", gap: 5, marginTop: 2 }}
        onClick={() => onConfig(integ)}
      >
        Configurar <ChevronRight size={12} />
      </button>
    </div>
  );
}

/* ─── Página ─────────────────────────────────────────────────── */
export function IntegracoesExternas() {
  const [modalInteg, setModalInteg] = useState(null);

  return (
    <div>
      <div className="page-header animate-fade-in">
        <div>
          <h1 className="page-title">Integrações Externas</h1>
          <p className="page-subtitle">Conecte ferramentas e serviços à sua conta Gateway JJ</p>
        </div>
      </div>

      <div className="animate-fade-up" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {CATEGORIAS.map((cat) => (
          <div key={cat.id}>
            {/* Cabeçalho da categoria */}
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".06em" }}>{cat.label}</p>
              <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>{cat.desc}</p>
            </div>

            {/* Grid 3 colunas */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {cat.items.map((integ) => (
                <IntegCard key={integ.id} integ={integ} onConfig={setModalInteg} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalInteg && (
        <ModalIntegracao integ={modalInteg} onClose={() => setModalInteg(null)} />
      )}
    </div>
  );
}
