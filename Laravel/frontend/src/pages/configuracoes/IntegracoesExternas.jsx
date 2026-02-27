import { useState } from "react";
import {
  Webhook, KeyRound, BarChart2, ShoppingCart,
  CheckCircle2, XCircle, ExternalLink, Copy, Check,
  RefreshCw, Eye, EyeOff, X, Plus, Trash2,
  BookOpen, ChevronRight, AlertCircle,
} from "lucide-react";

/* ─── Helpers ───────────────────────────────────────────────── */
function uid() { return Math.random().toString(36).slice(2, 10); }

function gerarApiKey()    { return "gjj_pk_" + Array.from({length:32}, () => "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random()*36)]).join(""); }
function gerarApiSecret() { return "gjj_sk_"  + Array.from({length:32}, () => "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random()*62)]).join(""); }

function CopyBtn({ value }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      className="btn btn-ghost btn-icon btn-xs"
      title="Copiar"
      onClick={() => { navigator.clipboard?.writeText(value); setOk(true); setTimeout(() => setOk(false), 2000); }}
    >
      {ok ? <Check size={12} style={{ color: "var(--green)" }} /> : <Copy size={12} />}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CREDENCIAIS API
═══════════════════════════════════════════════════════════════ */
const MAX_CREDS = 5;

const CREDS_INIT = [
  { id: uid(), nome: "Produção", key: gerarApiKey(), secret: gerarApiSecret(), criado: "15/01/2026" },
];

function CredenciaisCard() {
  const [creds,       setCreds]       = useState(CREDS_INIT);
  const [modalNova,   setModalNova]   = useState(false);
  const [modalVer,    setModalVer]    = useState(null);   // cred recém-criada
  const [confirmDel,  setConfirmDel]  = useState(null);
  const [nomeNova,    setNomeNova]    = useState("");

  const criar = () => {
    if (!nomeNova.trim() || creds.length >= MAX_CREDS) return;
    const nova = { id: uid(), nome: nomeNova.trim(), key: gerarApiKey(), secret: gerarApiSecret(), criado: new Date().toLocaleDateString("pt-BR") };
    setCreds((p) => [...p, nova]);
    setNomeNova("");
    setModalNova(false);
    setModalVer(nova);
  };

  const excluir = (id) => {
    setCreds((p) => p.filter((c) => c.id !== id));
    setConfirmDel(null);
  };

  return (
    <div>
      {/* Lista */}
      <div style={{ display: "flex", flexDirection: "column", gap: 0, border: "1px solid var(--border-2)", borderRadius: "var(--radius-sm)", overflow: "hidden", marginBottom: 12 }}>
        {creds.length === 0 && (
          <p style={{ padding: "16px", fontSize: 12, color: "var(--text-3)", textAlign: "center" }}>Nenhuma credencial criada.</p>
        )}
        {creds.map((c, i) => (
          <div key={c.id}>
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 14px",
              borderBottom: confirmDel === c.id || i < creds.length - 1 ? "1px solid var(--border-2)" : "none",
              background: "var(--surface)",
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>{c.nome}</p>
                <p style={{ fontSize: 11, fontFamily: "monospace", color: "var(--text-3)", marginTop: 1 }}>
                  {c.key.slice(0, 18)}••••••••  ·  Criada em {c.criado}
                </p>
              </div>
              <CopyBtn value={c.key} />
              <button
                className="btn btn-ghost btn-icon btn-xs"
                style={{ color: "var(--text-3)" }}
                title="Excluir"
                onClick={() => setConfirmDel(c.id)}
              >
                <Trash2 size={12} />
              </button>
            </div>

            {/* Confirmação inline de exclusão */}
            {confirmDel === c.id && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "9px 14px", background: "rgba(239,68,68,.04)", borderBottom: i < creds.length - 1 ? "1px solid var(--border-2)" : "none" }}>
                <p style={{ fontSize: 12, color: "var(--text-2)" }}>Remover <strong>{c.nome}</strong>? Esta ação é irreversível.</p>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button className="btn btn-ghost btn-xs" onClick={() => setConfirmDel(null)}>Cancelar</button>
                  <button className="btn btn-xs" style={{ background: "var(--red)", color: "#fff", border: "none" }} onClick={() => excluir(c.id)}>Remover</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Rodapé */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn btn-primary btn-sm"
            style={{ gap: 5 }}
            disabled={creds.length >= MAX_CREDS}
            onClick={() => setModalNova(true)}
          >
            <Plus size={13} /> Nova credencial
          </button>
          <a
            href="#"
            className="btn btn-ghost btn-sm"
            style={{ gap: 5, textDecoration: "none" }}
          >
            <BookOpen size={13} /> Documentação
          </a>
        </div>
        <span style={{ fontSize: 11, color: "var(--text-3)" }}>{creds.length}/{MAX_CREDS} credenciais</span>
      </div>

      {/* Modal — nova credencial */}
      {modalNova && (
        <div className="modal-backdrop" onClick={() => setModalNova(false)}>
          <div className="modal-box" style={{ maxWidth: 380 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <p className="modal-titulo">Nova credencial</p>
                <p className="modal-subtitulo">Dê um nome para identificar esta chave.</p>
              </div>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setModalNova(false)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <label className="form-label">Nome da credencial</label>
              <input
                className="form-input"
                placeholder="Ex: Produção, Homologação, App Mobile..."
                value={nomeNova}
                onChange={(e) => setNomeNova(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && criar()}
                autoFocus
              />
              <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 6 }}>
                A API Key e o Secret serão gerados automaticamente. O Secret só será exibido uma vez.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost btn-sm" onClick={() => setModalNova(false)}>Cancelar</button>
              <button className="btn btn-primary btn-sm" style={{ gap: 5 }} disabled={!nomeNova.trim()} onClick={criar}>
                <KeyRound size={13} /> Gerar chaves
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal — exibir chaves recém-geradas */}
      {modalVer && (
        <div className="modal-backdrop" onClick={() => setModalVer(null)}>
          <div className="modal-box" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <p className="modal-titulo">Credencial criada — <span style={{ color: "var(--accent)" }}>{modalVer.nome}</span></p>
                <p className="modal-subtitulo">Copie o Secret agora. Ele não será exibido novamente.</p>
              </div>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setModalVer(null)}><X size={16} /></button>
            </div>
            <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Aviso */}
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start", background: "rgba(245,158,11,.08)", border: "1px solid rgba(245,158,11,.2)", borderRadius: "var(--radius-sm)", padding: "10px 12px" }}>
                <AlertCircle size={14} style={{ color: "var(--yellow)", flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5 }}>
                  Guarde o <strong>API Secret</strong> em local seguro. Por segurança, ele não poderá ser recuperado depois que fechar esta janela.
                </p>
              </div>

              {/* API Key */}
              {[
                { label: "API Key (Pública)", value: modalVer.key },
                { label: "API Secret (Privada)", value: modalVer.secret },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 5 }}>{label}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--surface-2)", border: "1px solid var(--border-2)", borderRadius: "var(--radius-sm)", padding: "8px 10px" }}>
                    <code style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text-1)", flex: 1, wordBreak: "break-all", lineHeight: 1.5 }}>{value}</code>
                    <CopyBtn value={value} />
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary btn-sm" onClick={() => setModalVer(null)}>Entendi, já copiei</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   WEBHOOKS
═══════════════════════════════════════════════════════════════ */
const MAX_HOOKS = 10;

const TODOS_EVENTOS = [
  { id: "payment.approved",   label: "Pagamento aprovado"   },
  { id: "payment.failed",     label: "Pagamento recusado"   },
  { id: "payment.refunded",   label: "Estorno realizado"    },
  { id: "payment.pending",    label: "Pagamento pendente"   },
  { id: "chargeback.opened",  label: "Contestação aberta"   },
  { id: "chargeback.won",     label: "Contestação ganha"    },
  { id: "chargeback.lost",    label: "Contestação perdida"  },
  { id: "withdraw.requested", label: "Saque solicitado"     },
  { id: "withdraw.approved",  label: "Saque aprovado"       },
  { id: "withdraw.failed",    label: "Saque recusado"       },
];

const HOOKS_INIT = [
  { id: uid(), url: "https://meusite.com/webhook/pagamentos", ativo: true,  eventos: ["payment.approved", "payment.failed"] },
];

function WebhooksCard() {
  const [hooks,      setHooks]      = useState(HOOKS_INIT);
  const [modal,      setModal]      = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);

  /* form do modal */
  const [formUrl,     setFormUrl]     = useState("");
  const [formEventos, setFormEventos] = useState([]);

  const abrirModal = () => { setFormUrl(""); setFormEventos([]); setModal(true); };

  const toggleEvento = (id) =>
    setFormEventos((p) => p.includes(id) ? p.filter((e) => e !== id) : [...p, id]);

  const salvar = () => {
    if (!formUrl.trim() || formEventos.length === 0 || hooks.length >= MAX_HOOKS) return;
    setHooks((p) => [...p, { id: uid(), url: formUrl.trim(), ativo: true, eventos: formEventos }]);
    setModal(false);
  };

  const toggleAtivo = (id) =>
    setHooks((p) => p.map((h) => h.id === id ? { ...h, ativo: !h.ativo } : h));

  const excluir = (id) => { setHooks((p) => p.filter((h) => h.id !== id)); setConfirmDel(null); };

  return (
    <div>
      {/* Lista */}
      <div style={{ display: "flex", flexDirection: "column", gap: 0, border: "1px solid var(--border-2)", borderRadius: "var(--radius-sm)", overflow: "hidden", marginBottom: 12 }}>
        {hooks.length === 0 && (
          <p style={{ padding: "16px", fontSize: 12, color: "var(--text-3)", textAlign: "center" }}>Nenhum webhook cadastrado.</p>
        )}
        {hooks.map((h, i) => (
          <div key={h.id}>
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 14px",
              borderBottom: confirmDel === h.id || i < hooks.length - 1 ? "1px solid var(--border-2)" : "none",
              background: "var(--surface)",
            }}>
              {/* Toggle ativo */}
              <div
                style={{ width: 30, height: 16, borderRadius: 999, background: h.ativo ? "var(--accent)" : "var(--border)", position: "relative", transition: "background var(--dur)", cursor: "pointer", flexShrink: 0 }}
                onClick={() => toggleAtivo(h.id)}
              >
                <div style={{ position: "absolute", top: 2, left: h.ativo ? 16 : 2, width: 12, height: 12, borderRadius: "50%", background: "#fff", transition: "left var(--dur)", boxShadow: "0 1px 3px rgba(0,0,0,.15)" }} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 500, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.url}</p>
                <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 1 }}>
                  {h.eventos.length} evento{h.eventos.length !== 1 ? "s" : ""} · {h.ativo ? "Ativo" : "Pausado"}
                </p>
              </div>

              <CopyBtn value={h.url} />
              <button
                className="btn btn-ghost btn-icon btn-xs"
                style={{ color: "var(--text-3)" }}
                onClick={() => setConfirmDel(h.id)}
              >
                <Trash2 size={12} />
              </button>
            </div>

            {confirmDel === h.id && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "9px 14px", background: "rgba(239,68,68,.04)", borderBottom: i < hooks.length - 1 ? "1px solid var(--border-2)" : "none" }}>
                <p style={{ fontSize: 12, color: "var(--text-2)" }}>Remover este webhook?</p>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button className="btn btn-ghost btn-xs" onClick={() => setConfirmDel(null)}>Cancelar</button>
                  <button className="btn btn-xs" style={{ background: "var(--red)", color: "#fff", border: "none" }} onClick={() => excluir(h.id)}>Remover</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Rodapé */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button
          className="btn btn-primary btn-sm"
          style={{ gap: 5 }}
          disabled={hooks.length >= MAX_HOOKS}
          onClick={abrirModal}
        >
          <Plus size={13} /> Novo webhook
        </button>
        <span style={{ fontSize: 11, color: "var(--text-3)" }}>{hooks.length}/{MAX_HOOKS} webhooks</span>
      </div>

      {/* Modal novo webhook */}
      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(false)}>
          <div className="modal-box" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <p className="modal-titulo">Novo webhook</p>
                <p className="modal-subtitulo">Configure a URL e selecione os eventos.</p>
              </div>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setModal(false)}><X size={16} /></button>
            </div>
            <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="form-label">URL de destino</label>
                <input
                  className="form-input"
                  placeholder="https://seusite.com/webhook"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  autoFocus
                />
              </div>

              <div>
                <label className="form-label">
                  Eventos a receber
                  {formEventos.length > 0 && (
                    <span style={{ fontWeight: 400, color: "var(--text-3)", marginLeft: 6 }}>({formEventos.length} selecionado{formEventos.length !== 1 ? "s" : ""})</span>
                  )}
                </label>
                <div style={{ border: "1px solid var(--border-2)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
                  {TODOS_EVENTOS.map((ev, i) => {
                    const sel = formEventos.includes(ev.id);
                    return (
                      <label key={ev.id} style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "8px 12px", cursor: "pointer",
                        borderBottom: i < TODOS_EVENTOS.length - 1 ? "1px solid var(--border-2)" : "none",
                        background: sel ? "var(--accent-faint)" : "var(--surface)",
                        transition: "background var(--dur)",
                      }}>
                        <div style={{
                          width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                          border: `2px solid ${sel ? "var(--accent)" : "var(--border)"}`,
                          background: sel ? "var(--accent)" : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "all var(--dur)",
                        }}>
                          {sel && <Check size={10} color="#fff" strokeWidth={3} />}
                        </div>
                        <input type="checkbox" checked={sel} onChange={() => toggleEvento(ev.id)} style={{ display: "none" }} />
                        <span style={{ fontSize: 12, color: "var(--text-2)" }}>{ev.label}</span>
                        <code style={{ marginLeft: "auto", fontSize: 10, color: "var(--text-3)", fontFamily: "monospace" }}>{ev.id}</code>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost btn-sm" onClick={() => setModal(false)}>Cancelar</button>
              <button
                className="btn btn-primary btn-sm"
                style={{ gap: 5 }}
                disabled={!formUrl.trim() || formEventos.length === 0}
                onClick={salvar}
              >
                <Webhook size={13} /> Salvar webhook
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CARD SIMPLES (Rastreamento / Checkout)
═══════════════════════════════════════════════════════════════ */
function SimpleIntegCard({ integ, onConfig }) {
  const Icon = integ.icon;
  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", padding: "16px 18px", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{ width: 40, height: 40, borderRadius: "var(--radius-sm)", background: integ.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={19} style={{ color: integ.iconColor }} />
        </div>
        {integ.ativo
          ? <span className="badge badge-green"  style={{ fontSize: 10, gap: 3 }}><CheckCircle2 size={9} /> Ativo</span>
          : <span className="badge badge-neutral" style={{ fontSize: 10, gap: 3 }}><XCircle size={9} /> Inativo</span>
        }
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)", marginBottom: 4 }}>{integ.label}</p>
        <p style={{ fontSize: 12, color: "var(--text-3)", lineHeight: 1.5 }}>{integ.desc}</p>
      </div>
      <button className="btn btn-ghost btn-sm" style={{ width: "100%", justifyContent: "center", gap: 5 }} onClick={() => onConfig(integ)}>
        Configurar <ChevronRight size={12} />
      </button>
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
          <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 1 }}>{ativo ? `Dados enviados para ${integ.label}` : "Ative para começar"}</p>
        </div>
        <div style={{ width: 38, height: 20, borderRadius: 999, background: ativo ? "var(--accent)" : "var(--border)", position: "relative", transition: "background var(--dur)", cursor: "pointer", flexShrink: 0 }} onClick={() => setAtivo((v) => !v)}>
          <div style={{ position: "absolute", top: 3, left: ativo ? 21 : 3, width: 14, height: 14, borderRadius: "50%", background: "#fff", transition: "left var(--dur)", boxShadow: "0 1px 3px rgba(0,0,0,.15)" }} />
        </div>
      </div>
      <div>
        <label className="form-label">{integ.id === "utmify" ? "Token de rastreamento" : "Chave de integração"}</label>
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

/* ─── Modal wrapper simples ─────────────────────────────────── */
function ModalIntegracao({ integ, onClose }) {
  const Icon = integ.icon;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: "var(--radius-sm)", background: integ.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon size={14} style={{ color: integ.iconColor }} />
            </div>
            <div>
              <p className="modal-titulo">{integ.label}</p>
              <p className="modal-subtitulo">{integ.desc}</p>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body"><ModalSimples integ={integ} onClose={onClose} /></div>
        <div className="modal-footer"><button className="btn btn-ghost btn-sm" onClick={onClose}>Fechar</button></div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CATEGORIAS
═══════════════════════════════════════════════════════════════ */
const CATS_SIMPLES = [
  {
    id: "rastreamento",
    label: "Rastreamento",
    desc: "Acompanhe a origem das suas conversões e otimize campanhas de marketing.",
    items: [
      { id: "utmify",   label: "Utmify",    desc: "Rastreie a origem das vendas com UTMs e atribuição de campanhas.", icon: BarChart2, iconColor: "#f59e0b", iconBg: "rgba(245,158,11,.10)", ativo: false },
      { id: "empresa03", label: "Empresa 03", desc: "Rastreamento de conversões e eventos avançados de marketing.",    icon: BarChart2, iconColor: "#3b82f6", iconBg: "rgba(59,130,246,.10)",  ativo: false },
    ],
  },
  {
    id: "checkout",
    label: "Checkout",
    desc: "Personalize e otimize a experiência de pagamento dos seus clientes.",
    items: [
      { id: "empresa04", label: "Empresa 04", desc: "Checkout otimizado com experiência personalizada de pagamento.", icon: ShoppingCart, iconColor: "#10b981", iconBg: "rgba(16,185,129,.10)", ativo: false },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════
   ABAS
═══════════════════════════════════════════════════════════════ */
const ABAS = [
  { id: "api",          label: "APIs e Webhooks" },
  { id: "rastreamento", label: "Rastreamento"    },
  { id: "checkout",     label: "Checkouts"       },
  { id: "outros",       label: "Outros"          },
];

/* ═══════════════════════════════════════════════════════════════
   PÁGINA
═══════════════════════════════════════════════════════════════ */
export function IntegracoesExternas() {
  const [modalSimples, setModalSimples] = useState(null);
  const [aba,          setAba]          = useState("api");

  return (
    <div>
      <div className="page-header animate-fade-in">
        <div>
          <h1 className="page-title">Integrações</h1>
          <p className="page-subtitle">Gerencie credenciais, webhooks e conexões externas</p>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{
        display: "flex", gap: 2,
        borderBottom: "1px solid var(--border-2)",
        marginBottom: 24,
      }}>
        {ABAS.map((a) => {
          const ativo = aba === a.id;
          return (
            <button
              key={a.id}
              onClick={() => setAba(a.id)}
              style={{
                padding: "8px 16px",
                fontSize: 13, fontWeight: ativo ? 600 : 400,
                color: ativo ? "var(--accent)" : "var(--text-3)",
                background: "none", border: "none", cursor: "pointer",
                borderBottom: `2px solid ${ativo ? "var(--accent)" : "transparent"}`,
                marginBottom: -1,
                transition: "color var(--dur), border-color var(--dur)",
              }}
            >
              {a.label}
            </button>
          );
        })}
      </div>

      <div className="animate-fade-up" style={{ display: "flex", flexDirection: "column", gap: 28 }}>

        {/* ── APIs e Webhooks ── */}
        {aba === "api" && (
          <>
            <section>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 30, height: 30, borderRadius: "var(--radius-sm)", background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <KeyRound size={15} style={{ color: "var(--text-1)" }} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)" }}>Credenciais API</p>
                  <p style={{ fontSize: 11, color: "var(--text-3)" }}>Chaves de acesso para integrar o sistema à sua aplicação. Máximo de {MAX_CREDS}.</p>
                </div>
              </div>
              <div className="card" style={{ padding: "16px 18px" }}>
                <CredenciaisCard />
              </div>
            </section>

            <section>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 30, height: 30, borderRadius: "var(--radius-sm)", background: "var(--accent-faint)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Webhook size={15} style={{ color: "var(--accent)" }} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)" }}>Webhooks</p>
                  <p style={{ fontSize: 11, color: "var(--text-3)" }}>Receba notificações em tempo real no seu servidor. Máximo de {MAX_HOOKS}.</p>
                </div>
              </div>
              <div className="card" style={{ padding: "16px 18px" }}>
                <WebhooksCard />
              </div>
            </section>
          </>
        )}

        {/* ── Rastreamento ── */}
        {aba === "rastreamento" && (
          <section>
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-1)", textTransform: "uppercase", letterSpacing: ".06em" }}>Rastreamento</p>
              <p style={{ fontSize: 12, color: "var(--text-2)", marginTop: 2 }}>Acompanhe a origem das suas conversões e otimize campanhas de marketing.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {CATS_SIMPLES.find((c) => c.id === "rastreamento")?.items.map((integ) => (
                <SimpleIntegCard key={integ.id} integ={integ} onConfig={setModalSimples} />
              ))}
            </div>
          </section>
        )}

        {/* ── Checkouts ── */}
        {aba === "checkout" && (
          <section>
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-1)", textTransform: "uppercase", letterSpacing: ".06em" }}>Checkouts</p>
              <p style={{ fontSize: 12, color: "var(--text-2)", marginTop: 2 }}>Personalize e otimize a experiência de pagamento dos seus clientes.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {CATS_SIMPLES.find((c) => c.id === "checkout")?.items.map((integ) => (
                <SimpleIntegCard key={integ.id} integ={integ} onConfig={setModalSimples} />
              ))}
            </div>
          </section>
        )}

        {/* ── Outros ── */}
        {aba === "outros" && (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <p style={{ fontSize: 13, color: "var(--text-3)" }}>Nenhuma integração disponível nesta categoria ainda.</p>
          </div>
        )}

      </div>

      {modalSimples && <ModalIntegracao integ={modalSimples} onClose={() => setModalSimples(null)} />}
    </div>
  );
}
