import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText, Camera, Upload, CheckCircle2, X,
  ArrowRight, ArrowLeft, ShieldCheck, Globe,
  Briefcase, TrendingUp, Clock, LayoutDashboard, Check,
  Loader2,
} from "lucide-react";
import { apiJson, apiRequest } from "../../api/client";
import { formatDateBR } from "../../utils/date";

/* ─── Etapa 1 — Documentos ─────────────────────────────────── */
const DOCS = [
  {
    id: "CNPJ",
    label: "Cartão CNPJ",
    desc: "Documento emitido pela Receita Federal",
    icon: FileText,
  },
  {
    id: "RG_FRENTE",
    label: "Identidade — Frente",
    desc: "RG ou CNH, frente legível e sem reflexo",
    icon: FileText,
  },
  {
    id: "RG_VERSO",
    label: "Identidade — Verso",
    desc: "RG ou CNH, verso legível e sem reflexo",
    icon: FileText,
  },
  {
    id: "SELFIE",
    label: "Foto segurando a identidade",
    desc: "Rosto e documento visíveis, em boa iluminação",
    icon: Camera,
  },
];

const ACCEPT = ".jpg,.jpeg,.png,.pdf";
const ACCEPT_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const MAX_MB = 10;

/* ─── Etapa 2 — Dados do negócio ───────────────────────────── */
const NICHOS = [
  "E-commerce", "Serviços digitais", "Saúde e bem-estar", "Educação",
  "Alimentação", "Tecnologia", "Consultoria", "Moda e vestuário",
  "Imóveis", "Financeiro", "Entretenimento", "Outro",
];
const TICKETS = [
  "Até R$ 100", "R$ 100 a R$ 500", "R$ 500 a R$ 1.000",
  "R$ 1.000 a R$ 5.000", "R$ 5.000 a R$ 20.000", "Acima de R$ 20.000",
];

export function KYC() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState({});
  const [dragOver, setDragOver] = useState(null);
  const [fileErr, setFileErr] = useState({});
  const [uploading, setUploading] = useState({});
  const [documentsList, setDocumentsList] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [negocio, setNegocio] = useState({ nicho: "", ticket: "", site: "" });

  useEffect(() => {
    apiJson("/documents")
      .then((r) => setDocumentsList(Array.isArray(r?.data) ? r.data : []))
      .catch(() => setDocumentsList([]))
      .finally(() => setLoadingDocs(false));
  }, []);

  const docsByType = documentsList.reduce((acc, d) => {
    if (!acc[d.type]) acc[d.type] = [];
    acc[d.type].push(d);
    return acc;
  }, {});

  const addFile = async (id, file) => {
    if (!file) return;
    if (!ACCEPT_TYPES.includes(file.type)) {
      setFileErr((e) => ({ ...e, [id]: "Formato inválido. Use JPG, PNG ou PDF." }));
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setFileErr((e) => ({ ...e, [id]: `Arquivo muito grande. Máx ${MAX_MB} MB.` }));
      return;
    }
    setFileErr((e) => { const n = { ...e }; delete n[id]; return n; });
    setUploading((u) => ({ ...u, [id]: true }));
    const form = new FormData();
    form.append("type", id);
    form.append("file", file);
    try {
      const res = await apiRequest("/documents", { method: "POST", body: form });
      if (!res.ok) {
        const text = await res.text();
        throw { data: text ? JSON.parse(text) : {} };
      }
      const listRes = await apiJson("/documents");
      setDocumentsList(Array.isArray(listRes?.data) ? listRes.data : []);
      setFiles((p) => { const n = { ...p }; delete n[id]; return n; });
    } catch (err) {
      setFileErr((e) => ({ ...e, [id]: err?.data?.message || err?.message || "Falha ao enviar." }));
    } finally {
      setUploading((u) => ({ ...u, [id]: false }));
    }
  };

  const removeFile = (id) => setFiles((p) => { const n = { ...p }; delete n[id]; return n; });

  const allDocsUploaded = DOCS.every((d) =>
    (docsByType[d.id] || []).some((doc) => doc.status === "PENDING" || doc.status === "APPROVED")
  );
  const canFinish = negocio.nicho && negocio.ticket;
  const uploadedCount = DOCS.filter((d) =>
    (docsByType[d.id] || []).some((doc) => doc.status === "PENDING" || doc.status === "APPROVED")
  ).length;
  const pct = Math.min(100, Math.round((uploadedCount / DOCS.length) * 100));

  const setN = (k) => (e) => setNegocio((n) => ({ ...n, [k]: e.target.value }));

  return (
    <div>
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="page-header animate-fade-in">
        <div>
          <h1 className="page-title">Verificação de conta (KYC)</h1>
          <p className="page-subtitle">Complete as etapas abaixo para liberar todos os recursos da plataforma</p>
        </div>
      </div>

      {/* ── Indicador de etapas ─────────────────────────────── */}
      {(() => {
        const STEPS = [
          { label: "Documentos",  hint: "Envio de arquivos" },
          { label: "Seu negócio", hint: "Perfil da empresa"  },
          { label: "Análise",     hint: "Aguardando aprovação" },
        ];
        return (
          <>
            {/* Badge compacto (só mobile < 520px) */}
            <div className="kyc-step-badge">
              <span>Etapa <strong>{step + 1}</strong> de {STEPS.length}</span>
              <span style={{ color: "var(--accent)", fontWeight: 600 }}>— {STEPS[step].label}</span>
            </div>

            {/* Stepper completo */}
            <div className="kyc-stepper animate-fade-up">
              {STEPS.map(({ label, hint }, i) => (
                <>
                  {i > 0 && (
                    <div key={`line-${i}`} className={`kyc-step-connector${step > i - 1 ? " done" : ""}`} />
                  )}
                  <div key={i} className={`kyc-step${step === i ? " active" : ""}${step > i ? " done" : ""}`}>
                    <div className="kyc-step-bubble">
                      {step > i ? <Check size={15} strokeWidth={2.5} /> : i + 1}
                    </div>
                    <div className="kyc-step-text">
                      <span className="kyc-step-name">{label}</span>
                      <span className="kyc-step-hint">{hint}</span>
                    </div>
                  </div>
                </>
              ))}
            </div>
          </>
        );
      })()}

      {/* ══════════════ ETAPA 1 — DOCUMENTOS ══════════════════ */}
      {step === 0 && (
        <div className="animate-fade-up">
          {/* Barra de progresso compacta */}
          <div className="kyc-progress-row">
            <div className="kyc-progress-track">
              <div className="kyc-progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="kyc-progress-label">
              {uploadedCount}/{DOCS.length} enviados
            </span>
          </div>

          {/* Lista de documentos */}
          <div className="kyc-doc-list">
            {loadingDocs ? (
              <p style={{ padding: 24, textAlign: "center", color: "var(--text-3)" }}>Carregando documentos...</p>
            ) : (
              DOCS.map((doc, idx) => {
                const file = files[doc.id];
                const over = dragOver === doc.id;
                const err = fileErr[doc.id];
                const uploadingDoc = uploading[doc.id];
                const list = docsByType[doc.id] || [];
                const latest = list[0];
                const statusLabel = latest && { PENDING: "Pendente", APPROVED: "Aprovado", REJECTED: "Rejeitado" }[latest.status];
                const isDone = latest && (latest.status === "PENDING" || latest.status === "APPROVED");
                const Icon = doc.icon;

                return (
                  <div
                    key={doc.id}
                    className={`kyc-doc-row${file || isDone ? " kyc-doc-done" : ""}${over ? " kyc-doc-drag" : ""}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(doc.id); }}
                    onDragLeave={() => setDragOver(null)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(null); if (!isDone) addFile(doc.id, e.dataTransfer.files[0]); }}
                  >
                    <div className="kyc-doc-num">
                      {file || isDone ? <CheckCircle2 size={16} style={{ color: "var(--green)" }} /> : <span>{idx + 1}</span>}
                    </div>
                    <div className="kyc-doc-info">
                      <p className="kyc-doc-label">{doc.label}</p>
                      <p className="kyc-doc-desc">
                        {latest ? (statusLabel + (latest.created_at ? " · " + formatDateBR(latest.created_at) : "")) : file ? file.name : doc.desc}
                      </p>
                      {latest?.status === "REJECTED" && latest?.rejection_reason && (
                        <p className="field-error" style={{ marginTop: 4 }}>{latest.rejection_reason}</p>
                      )}
                      {err && <p className="field-error" style={{ marginTop: 2 }}>{err}</p>}
                    </div>
                    <div className="kyc-doc-action">
                      {uploadingDoc ? (
                        <span style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-3)" }}><Loader2 size={14} className="spin" /> Enviando...</span>
                      ) : file ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span className="kyc-doc-size">{(file.size / 1024).toFixed(0)} KB</span>
                          <button className="kyc-remove-btn" onClick={() => removeFile(doc.id)} title="Remover"><X size={13} /></button>
                        </div>
                      ) : isDone ? (
                        <span style={{ fontSize: 12, color: "var(--green)", fontWeight: 500 }}>{statusLabel}</span>
                      ) : (
                        <label className="kyc-upload-btn">
                          <Upload size={13} /><span>Enviar</span>
                          <input type="file" accept={ACCEPT} style={{ display: "none" }} onChange={(e) => addFile(doc.id, e.target.files[0])} />
                        </label>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Info de formatos */}
          <p className="kyc-footnote-info">
            Formatos aceitos: <strong>JPG, PNG ou PDF</strong> · máx. <strong>10 MB</strong> por arquivo.
            Arraste ou clique em "Enviar" em cada item.
          </p>

          {/* Botão avançar */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
            <button
              className="btn btn-primary"
              style={{ gap: 8, height: 42, paddingLeft: 24, paddingRight: 24,
                opacity: allDocsUploaded ? 1 : 0.45 }}
              disabled={!allDocsUploaded}
              onClick={() => setStep(1)}
            >
              Continuar <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ══════════════ ETAPA 2 — SEU NEGÓCIO ════════════════ */}
      {step === 1 && (
        <div className="animate-fade-up">
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Nicho */}
              <div>
                <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Briefcase size={13} style={{ color: "var(--accent)" }} />
                  Nicho de atuação <span style={{ color: "var(--red)", marginLeft: 1 }}>*</span>
                </label>
                <select className="form-input" value={negocio.nicho} onChange={setN("nicho")} required
                  style={{ cursor: "pointer" }}>
                  <option value="">Selecione seu segmento</option>
                  {NICHOS.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>

              {/* Ticket médio */}
              <div>
                <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <TrendingUp size={13} style={{ color: "var(--accent)" }} />
                  Ticket médio <span style={{ color: "var(--red)", marginLeft: 1 }}>*</span>
                </label>
                <select className="form-input" value={negocio.ticket} onChange={setN("ticket")} required
                  style={{ cursor: "pointer" }}>
                  <option value="">Selecione a faixa de valor</option>
                  {TICKETS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* URL do site */}
              <div>
                <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Globe size={13} style={{ color: "var(--accent)" }} />
                  URL do site
                  <span style={{ marginLeft: 4, fontSize: 11, fontWeight: 400, color: "var(--text-3)" }}>(opcional)</span>
                </label>
                <div className="form-icon-wrap">
                  <Globe size={14} className="form-icon" />
                  <input
                    className="form-input"
                    placeholder="https://seusite.com.br"
                    value={negocio.site}
                    onChange={setN("site")}
                    type="url"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div style={{ display: "flex", gap: 10, justifyContent: "space-between", alignItems: "center" }}>
            <button className="btn btn-ghost" style={{ gap: 6, height: 42, paddingLeft: 16, paddingRight: 20 }}
              onClick={() => setStep(0)}>
              <ArrowLeft size={14} /> Voltar
            </button>
            <button
              className="btn btn-primary"
              style={{ gap: 8, height: 42, paddingLeft: 24, paddingRight: 24,
                opacity: canFinish ? 1 : 0.45 }}
              disabled={!canFinish}
              onClick={() => setStep(2)}
            >
              <ShieldCheck size={15} />
              Concluir verificação
            </button>
          </div>
        </div>
      )}

      {/* ══════════════ ETAPA 3 — AGUARDAR VERIFICAÇÃO ═══════ */}
      {step === 2 && (
        <div className="animate-fade-up">
          <div className="card" style={{ maxWidth: 560, margin: "0 auto" }}>
            <div style={{ padding: "40px 32px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 20 }}>

              {/* Ícone animado */}
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "var(--accent-faint)", border: "2px solid var(--accent)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Clock size={32} style={{ color: "var(--accent)" }} />
              </div>

              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-1)", margin: "0 0 8px" }}>
                  Documentos recebidos!
                </h2>
                <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.6, maxWidth: 400 }}>
                  Recebemos seus documentos e nossa equipe já está analisando tudo. Em breve sua conta estará totalmente verificada.
                </p>
              </div>

              {/* Mensagem de encorajamento */}
              <div style={{
                background: "var(--accent-faint)", border: "1px solid var(--accent)",
                borderRadius: "var(--radius-sm)", padding: "12px 16px", width: "100%",
              }}>
                <p style={{ fontSize: 13, color: "var(--accent)", fontWeight: 500, lineHeight: 1.5 }}>
                  Você receberá uma notificação assim que sua conta for aprovada. Fique de olho no seu e-mail e na central de notificações!
                </p>
              </div>

              <button
                className="btn btn-primary"
                style={{ gap: 8, height: 42, paddingLeft: 28, paddingRight: 28 }}
                onClick={() => navigate("/")}
              >
                <LayoutDashboard size={15} /> Ir para o painel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
