import { useState, useRef, useEffect } from "react";
import { Mail, Camera, BadgeCheck, Globe, X, Eye, EyeOff, Percent, Pencil, Check, Loader2 } from "lucide-react";
import { apiJson } from "../../api/client";
import { useAuth } from "../../contexts/AuthContext";

function formatDoc(v) {
  if (!v) return "—";
  const s = String(v).replace(/\D/g, "");
  if (s.length === 11) return s.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  if (s.length === 14) return s.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  return v;
}

/* Taxas do usuário (mock até endpoint de taxas no backend) */
const TAXAS_FALLBACK = [
  { label: "Pix",               valor: "0,99%"           },
  { label: "Cartão de Crédito", valor: "2,49% + R$ 0,30" },
  { label: "Cartão de Débito",  valor: "1,49%"           },
  { label: "Boleto",            valor: "R$ 3,50"         },
];

/* Campo somente leitura — visual limpo, sem fake input */
function InfoField({ label, value, action }) {
  return (
    <div>
      <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>
        {label}
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 6, minHeight: 22 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)", lineHeight: 1.4, flex: 1 }}>
          {value}
        </p>
        {action}
      </div>
    </div>
  );
}

/* Divisor horizontal entre grupos de campos */
function Divider() {
  return <div style={{ gridColumn: "1 / -1", height: 1, background: "var(--border-2)", margin: "2px 0" }} />;
}

export function MinhaConta() {
  const { setUserData } = useAuth();
  const [meData, setMeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatar, setAvatar] = useState(null);

  const [site, setSite] = useState("");
  const [siteOriginal, setSiteOriginal] = useState("");
  const [siteEdit, setSiteEdit] = useState(false);
  const [siteSalvo, setSiteSalvo] = useState(false);
  const [siteSaving, setSiteSaving] = useState(false);
  const [siteErr, setSiteErr] = useState("");

  const [modalEmail, setModalEmail] = useState(false);
  const [emailNovo, setEmailNovo] = useState("");
  const [emailConf, setEmailConf] = useState("");
  const [verEmailConf, setVerEmailConf] = useState(false);
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailErr, setEmailErr] = useState("");

  const fileRef = useRef(null);
  const siteInputRef = useRef(null);

  const reloadMe = () => {
    return apiJson("/auth/me").then((r) => {
      const d = r?.data ?? r;
      setMeData(d || null);
      return d;
    });
  };

  useEffect(() => {
    apiJson("/auth/me")
      .then((r) => {
        const d = r?.data ?? r;
        setMeData(d || null);
        const s = d?.site || "";
        setSite(s);
        setSiteOriginal(s);
      })
      .catch(() => setMeData(null))
      .finally(() => setLoading(false));
  }, []);

  const DADOS = meData
    ? {
        nome: meData.name ?? "—",
        email: meData.email ?? "—",
        telefone: meData.telefone ?? "—",
        documento: formatDoc(meData.cnpj),
        empresa: meData.empresa ?? "—",
        nicho: meData.nicho ?? "—",
        ticket: meData.ticket ?? "—",
        id: meData.id,
      }
    : { nome: "—", email: "—", telefone: "—", documento: "—", empresa: "—", nicho: "—", ticket: "—", id: "" };

  const TAXAS = TAXAS_FALLBACK;
  const initials = (DADOS.nome || "?").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "?";

  const handleAvatar = (e) => {
    const file = e.target.files?.[0];
    if (file) setAvatar(URL.createObjectURL(file));
  };

  const iniciarEdicaoSite = () => {
    setSiteEdit(true);
    setSiteSalvo(false);
    setTimeout(() => siteInputRef.current?.focus(), 0);
  };

  const cancelarSite = () => {
    setSite(siteOriginal);
    setSiteEdit(false);
  };

  const salvarSite = async () => {
    if (siteSaving) return;
    setSiteSaving(true);
    setSiteErr("");
    try {
      const r = await apiJson("/auth/me", { method: "PUT", body: { site } });
      const d = r?.data ?? r;
      const novoSite = d?.site || site;
      setSiteOriginal(novoSite);
      setSite(novoSite);
      if (d) { setMeData(d); setUserData(d); }
      setSiteEdit(false);
      setSiteSalvo(true);
      setTimeout(() => setSiteSalvo(false), 2500);
    } catch (err) {
      setSiteErr(err?.message || "Erro ao salvar.");
    } finally {
      setSiteSaving(false);
    }
  };

  const handleSalvarEmail = async () => {
    if (!emailNovo || emailNovo !== emailConf || emailSaving) return;
    setEmailSaving(true);
    setEmailErr("");
    try {
      const r = await apiJson("/auth/me", { method: "PUT", body: { email: emailNovo } });
      const d = r?.data ?? r;
      if (d) { setMeData(d); setUserData(d); }
      setModalEmail(false);
      setEmailNovo("");
      setEmailConf("");
    } catch (err) {
      const msg = err?.errors?.email?.[0] || err?.message || "Erro ao alterar e-mail.";
      setEmailErr(msg);
    } finally {
      setEmailSaving(false);
    }
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: "14px 20px",
    padding: "14px 18px 18px",
  };

  if (loading && !meData) {
    return (
      <div className="page-header animate-fade-in">
        <p className="page-subtitle">Carregando...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header animate-fade-in">
        <div>
          <h1 className="page-title">Minha Conta</h1>
          <p className="page-subtitle">Visualize e gerencie os dados da sua conta</p>
        </div>
      </div>

      <div className="layout-main-aside animate-fade-up">

        {/* Coluna principal */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Dados pessoais */}
          <div className="card">
            <div className="card-head">
              <p className="card-title">Dados pessoais</p>
              <span className="badge badge-neutral" style={{ fontSize: 10, letterSpacing: "0.02em" }}>Somente leitura</span>
            </div>
            <div style={gridStyle}>
              <InfoField label="Nome completo" value={DADOS.nome} />
              <InfoField
                label="E-mail"
                value={DADOS.email}
                action={
                  <button
                    className="btn btn-ghost btn-icon"
                    style={{ width: 24, height: 24, flexShrink: 0, color: "var(--text-3)" }}
                    title="Alterar e-mail"
                    onClick={() => setModalEmail(true)}
                  >
                    <Pencil size={11} />
                  </button>
                }
              />
              <InfoField label="Telefone"  value={DADOS.telefone}  />
              <InfoField label="CPF / CNPJ" value={DADOS.documento} />
            </div>
          </div>

          {/* Dados da empresa */}
          <div className="card">
            <div className="card-head">
              <p className="card-title">Dados da empresa</p>
              <span className="badge badge-neutral" style={{ fontSize: 10, letterSpacing: "0.02em" }}>Somente leitura</span>
            </div>
            <div style={gridStyle}>
              <InfoField label="Nome da empresa"  value={DADOS.empresa} />
              <InfoField label="Nicho de atuação" value={DADOS.nicho}   />
              <InfoField label="Ticket médio"      value={DADOS.ticket}  />

              {/* Site — único campo editável */}
              <div style={{ gridColumn: "1 / -1" }}>
                <div style={{ height: 1, background: "var(--border-2)", marginBottom: 14 }} />
                <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                  Site
                </p>

                {siteEdit ? (
                  /* Modo edição */
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <div className="form-icon-wrap" style={{ flex: 1, maxWidth: 320 }}>
                        <Globe size={12} className="form-icon" />
                        <input
                          ref={siteInputRef}
                          className="form-input"
                          value={site}
                          onChange={(e) => setSite(e.target.value)}
                          placeholder="https://seusite.com.br"
                          onKeyDown={(e) => { if (e.key === "Enter") salvarSite(); if (e.key === "Escape") cancelarSite(); }}
                          style={{ height: 32, fontSize: 13 }}
                          disabled={siteSaving}
                        />
                      </div>
                      <button className="btn btn-ghost btn-icon" style={{ width: 28, height: 28, color: "var(--text-3)" }} onClick={cancelarSite} title="Cancelar" disabled={siteSaving}>
                        <X size={12} />
                      </button>
                      <button className="btn btn-primary btn-sm" style={{ height: 28, gap: 5, fontSize: 12, paddingInline: 10 }} onClick={salvarSite} disabled={siteSaving}>
                        {siteSaving ? <Loader2 size={12} className="spin" /> : <Check size={12} />} Salvar
                      </button>
                    </div>
                    {siteErr && <p style={{ fontSize: 12, color: "var(--red)", marginTop: 2 }}>{siteErr}</p>}
                  </div>
                ) : (
                  /* Modo visualização */
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Globe size={12} style={{ color: "var(--text-3)", flexShrink: 0 }} />
                    <p style={{ fontSize: 13, fontWeight: 500, color: "var(--accent)", flex: 1 }}>
                      {siteOriginal || <span style={{ color: "var(--text-3)" }}>Não informado</span>}
                    </p>
                    {siteSalvo
                      ? <span style={{ fontSize: 11, color: "var(--green)", display: "flex", alignItems: "center", gap: 3 }}><Check size={11} /> Salvo</span>
                      : <button className="btn btn-ghost btn-icon" style={{ width: 24, height: 24, color: "var(--text-3)" }} onClick={iniciarEdicaoSite} title="Editar site">
                          <Pencil size={11} />
                        </button>
                    }
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Coluna lateral */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Perfil */}
          <div className="card">
            <div className="card-head">
              <p className="card-title">Perfil</p>
            </div>
            <div style={{ padding: "16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <div style={{ position: "relative" }}>
                <div style={{
                  width: 64, height: 64, borderRadius: "50%",
                  background: avatar ? "transparent" : "var(--accent)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, fontWeight: 700, color: "#fff", overflow: "hidden",
                  border: "2px solid var(--border)",
                }}>
                  {avatar
                    ? <img src={avatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : initials}
                </div>
                <button onClick={() => fileRef.current?.click()} style={{
                  position: "absolute", bottom: 0, right: 0,
                  width: 22, height: 22, borderRadius: "50%",
                  background: "var(--surface)", border: "1px solid var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "var(--text-2)",
                }} title="Alterar foto">
                  <Camera size={11} />
                </button>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatar} />
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>{DADOS.nome}</p>
                <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{DADOS.email}</p>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 5, background: "var(--surface-2)", border: "1px solid var(--border-2)", borderRadius: 6, padding: "2px 7px" }}>
                  <span style={{ fontSize: 10, color: "var(--text-3)" }}>ID</span>
                  <span style={{ fontSize: 10, fontFamily: "monospace", fontWeight: 600, color: "var(--text-2)", letterSpacing: ".02em" }}>{DADOS.id ?? "—"}</span>
                </span>
              </div>
              <span className="badge badge-green" style={{ fontSize: 10 }}><BadgeCheck size={10} /> Conta verificada</span>
            </div>
          </div>

          {/* Taxas */}
          <div className="card">
            <div className="card-head">
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: "var(--radius-sm)",
                  background: "var(--accent-faint)", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Percent size={12} style={{ color: "var(--accent)" }} />
                </div>
                <p className="card-title">Suas taxas</p>
              </div>
            </div>
            <div style={{ padding: "2px 0 4px" }}>
              {TAXAS.map((t, i) => (
                <div key={t.label} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "8px 16px",
                  borderBottom: i < TAXAS.length - 1 ? "1px solid var(--border-2)" : "none",
                }}>
                  <span style={{ fontSize: 12, color: "var(--text-3)" }}>{t.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-1)" }}>{t.valor}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Modal alterar e-mail */}
      {modalEmail && (
        <div className="modal-backdrop" onClick={() => { if (!emailSaving) setModalEmail(false); }}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <p className="modal-titulo">Alterar e-mail</p>
                <p className="modal-subtitulo">O novo e-mail será atualizado imediatamente.</p>
              </div>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setModalEmail(false)} disabled={emailSaving}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label className="form-label">Novo e-mail</label>
                  <div className="form-icon-wrap">
                    <Mail size={13} className="form-icon" />
                    <input className="form-input" type="email" placeholder="novo@email.com"
                      value={emailNovo} onChange={(e) => setEmailNovo(e.target.value)} disabled={emailSaving} />
                  </div>
                </div>
                <div>
                  <label className="form-label">Confirmar novo e-mail</label>
                  <div style={{ position: "relative" }}>
                    <input
                      className={`form-input${emailConf && emailNovo !== emailConf ? " input-error" : ""}`}
                      type={verEmailConf ? "text" : "email"}
                      placeholder="Repita o e-mail"
                      value={emailConf}
                      onChange={(e) => setEmailConf(e.target.value)}
                      style={{ paddingRight: 38 }}
                      disabled={emailSaving}
                    />
                    <button type="button" onClick={() => setVerEmailConf((v) => !v)} style={{
                      position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", padding: 0,
                    }}>
                      {verEmailConf ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {emailConf && emailNovo !== emailConf && (
                    <p style={{ fontSize: 12, color: "var(--red)", marginTop: 4 }}>Os e-mails não coincidem.</p>
                  )}
                </div>
                {emailErr && <p style={{ fontSize: 12, color: "var(--red)" }}>{emailErr}</p>}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost btn-sm" onClick={() => setModalEmail(false)} disabled={emailSaving}>Cancelar</button>
              <button className="btn btn-primary btn-sm" style={{ gap: 6 }}
                disabled={!emailNovo || emailNovo !== emailConf || emailSaving}
                onClick={handleSalvarEmail}>
                {emailSaving ? <Loader2 size={13} className="spin" /> : <Mail size={13} />} Salvar e-mail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
