import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User, Mail, Lock, Building2, Eye, EyeOff, ArrowRight,
  CheckCircle2, Phone, MapPin, CreditCard, Loader2, ShieldCheck,
  Clock, AlertTriangle, ArrowLeft,
} from "lucide-react";
import logoImg from "../../assets/logo.webp";

/* ─── Rate limiting — verificação de e-mail ───────────────── */
const VF_KEY      = (e) => `cad_verify_${e.toLowerCase().trim()}`;
const VF_COOLDOWN = 60;   // segundos entre reenvios
const VF_LIMIT    = 3;    // máx por hora

function getVfAttempts(email) {
  try {
    const raw = localStorage.getItem(VF_KEY(email));
    if (!raw) return [];
    return JSON.parse(raw).filter((ts) => Date.now() - ts < 3_600_000);
  } catch { return []; }
}
function saveVfAttempt(email) {
  const list = [...getVfAttempts(email), Date.now()];
  localStorage.setItem(VF_KEY(email), JSON.stringify(list));
}
function vfRateStatus(email) {
  const attempts    = getVfAttempts(email);
  const last        = attempts.at(-1) ?? 0;
  const secsAgo     = Math.floor((Date.now() - last) / 1000);
  const cooldownLeft = VF_COOLDOWN - secsAgo;

  if (attempts.length >= VF_LIMIT) {
    const resetIn = Math.ceil((attempts[0] + 3_600_000 - Date.now()) / 60_000);
    return { blocked: true, reason: `Limite de ${VF_LIMIT} envios/hora atingido. Tente novamente em ${resetIn} min.` };
  }
  if (cooldownLeft > 0) return { blocked: true, cooldown: cooldownLeft };
  return { blocked: false };
}

/* ─── Sugestões de e-mail ──────────────────────────────────── */
const EMAIL_DOMAINS = ["@gmail.com", "@hotmail.com", "@outlook.com", "@yahoo.com.br"];

/* ─── Filtros ──────────────────────────────────────────────── */
const onlyLetters   = (v) => v.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");
const onlyAlphaNum  = (v) => v.replace(/[^a-zA-ZÀ-ÿ0-9\s\-\.]/g, "");
const onlyNumbers   = (v) => v.replace(/\D/g, "");
const onlyLettersUF = (v) => v.replace(/[^a-zA-ZÀ-ÿ]/g, "").slice(0, 2).toUpperCase();
const capitalizeWords = (v) =>
  v.replace(/(?:^|(?<=\s))\S/g, (c) => c.toUpperCase());

/* ─── Formatadores ─────────────────────────────────────────── */
const fmtTel  = (v) => v.replace(/\D/g,"").slice(0,11)
  .replace(/^(\d{2})(\d)/,"($1) $2")
  .replace(/(\d{5})(\d{1,4})$/,"$1-$2");
const fmtCPF  = (v) => v.replace(/\D/g,"").slice(0,11)
  .replace(/(\d{3})(\d)/,"$1.$2")
  .replace(/(\d{3})(\d)/,"$1.$2")
  .replace(/(\d{3})(\d{1,2})$/,"$1-$2");
const fmtCNPJ = (v) => v.replace(/\D/g,"").slice(0,14)
  .replace(/(\d{2})(\d)/,"$1.$2")
  .replace(/(\d{3})(\d)/,"$1.$2")
  .replace(/(\d{3})(\d)/,"$1/$2")
  .replace(/(\d{4})(\d{1,2})$/,"$1-$2");
const fmtCEP  = (v) => v.replace(/\D/g,"").slice(0,8)
  .replace(/(\d{5})(\d{1,3})$/,"$1-$2");

/* ─── Validadores ──────────────────────────────────────────── */
function validarCPF(cpf) {
  cpf = cpf.replace(/\D/g,"");
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  let s = 0;
  for (let i = 0; i < 9; i++) s += +cpf[i] * (10 - i);
  let r = 11 - (s % 11); if (r >= 10) r = 0;
  if (r !== +cpf[9]) return false;
  s = 0;
  for (let i = 0; i < 10; i++) s += +cpf[i] * (11 - i);
  r = 11 - (s % 11); if (r >= 10) r = 0;
  return r === +cpf[10];
}
function validarCNPJ(cnpj) {
  cnpj = cnpj.replace(/\D/g,"");
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
  const calc = (n) => {
    let s = 0, p = n - 7;
    for (let i = n; i >= 1; i--) { s += +cnpj[n - i] * p--; if (p < 2) p = 9; }
    return s % 11 < 2 ? 0 : 11 - (s % 11);
  };
  return calc(12) === +cnpj[12] && calc(13) === +cnpj[13];
}

/* ─── Força de senha ───────────────────────────────────────── */
function pwStrength(pw) {
  let s = 0;
  if (pw.length >= 8)          s++;
  if (/[A-Z]/.test(pw))        s++;
  if (/[0-9]/.test(pw))        s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}
const STR_LABEL = ["Muito fraca","Fraca","Razoável","Forte","Muito forte"];
const STR_COLOR = ["#ef4444","#f97316","#eab308","#22c55e","#0D9488"];

const STEPS = [
  { label:"Dados pessoais", desc:"Informações básicas de contato" },
  { label:"Empresa",        desc:"Tipo de pessoa e endereço"      },
  { label:"Segurança",      desc:"Crie uma senha forte"           },
  { label:"Confirmação",    desc:"Verifique seu e-mail"           },
];

export function Cadastro() {
  const navigate = useNavigate();
  const [step,       setStep]      = useState(0);
  const [showPass,   setShowPass]  = useState(false);
  const [showConf,   setShowConf]  = useState(false);
  const [cepLoad,    setCepLoad]   = useState(false);
  const [cepErr,     setCepErr]    = useState("");
  const [docErr,     setDocErr]    = useState("");
  const [terms,      setTerms]     = useState(false);
  const [code,       setCode]      = useState(["","","","","",""]);
  const [codeErr,    setCodeErr]   = useState("");
  const [emailFocus, setEmailFocus]= useState(false);
  const [vfCooldown, setVfCooldown]= useState(0);
  const [vfError,    setVfError]   = useState("");
  const [vfSent,     setVfSent]    = useState(false);
  const codeRefs = useRef([]);

  const [form, setForm] = useState({
    nome:"", email:"", telefone:"",
    tipoEmpresa:"fisica", documento:"", nomeEmpresa:"",
    cep:"", logradouro:"", numero:"", complemento:"", bairro:"", cidade:"", estado:"",
    senha:"", confirmar:"",
  });

  /* Regressivo do cooldown */
  useEffect(() => {
    if (vfCooldown <= 0) return;
    const t = setTimeout(() => setVfCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [vfCooldown]);

  /* ── Helpers ────────────────────────────────────────────── */
  const set         = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setFiltered = (k, fn) => (e) => setForm((f) => ({ ...f, [k]: fn(e.target.value) }));

  const onNomeChange = (e) =>
    setForm((f) => ({ ...f, nome: capitalizeWords(onlyLetters(e.target.value)) }));

  /* ── Sugestões de e-mail ─────────────────────────────────── */
  const emailPart   = form.email.split("@")[0];
  const hasAt       = form.email.includes("@");
  const suggestions = (!hasAt && emailPart.length >= 3)
    ? EMAIL_DOMAINS.map((d) => emailPart + d) : [];
  const showSuggestions = emailFocus && suggestions.length > 0;
  const pickSuggestion = (s) => { setForm((f) => ({ ...f, email: s })); setEmailFocus(false); };

  /* ── Documento ───────────────────────────────────────────── */
  const validarDoc = () => {
    const raw = form.documento.replace(/\D/g,"");
    if (!raw) return;
    const ok = form.tipoEmpresa === "fisica" ? validarCPF(raw) : validarCNPJ(raw);
    setDocErr(ok ? "" : "Documento inválido. Verifique e tente novamente.");
  };

  /* ── CEP ─────────────────────────────────────────────────── */
  const buscarCEP = async (cepRaw) => {
    const cep = (cepRaw || form.cep).replace(/\D/g,"");
    if (cep.length !== 8) return;
    setCepLoad(true); setCepErr("");
    try {
      const res  = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (data.erro) {
        setCepErr("CEP não encontrado. Verifique e tente novamente.");
        setForm((f) => ({ ...f, logradouro:"", bairro:"", cidade:"", estado:"" }));
        return;
      }
      setForm((f) => ({
        ...f,
        logradouro: data.logradouro || "",
        bairro:     data.bairro     || "",
        cidade:     data.localidade || "",
        estado:     data.uf         || "",
      }));
    } catch { setCepErr("Erro ao consultar o CEP. Verifique sua conexão."); }
    finally  { setCepLoad(false); }
  };

  const onCepChange = (e) => {
    const v = fmtCEP(e.target.value);
    setForm((f) => ({ ...f, cep: v }));
    setCepErr("");
    if (v.replace(/\D/g,"").length === 8) buscarCEP(v);
  };

  /* ── Código 6 dígitos ────────────────────────────────────── */
  const onCodeChange = (i, val) => {
    const d = val.replace(/\D/g,"").slice(-1);
    const next = [...code]; next[i] = d;
    setCode(next); setCodeErr("");
    if (d && i < 5) codeRefs.current[i+1]?.focus();
  };
  const onCodeKeyDown = (i, e) => {
    if (e.key === "Backspace" && !code[i] && i > 0) codeRefs.current[i-1]?.focus();
  };
  const onCodePaste = (e) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g,"").slice(0,6).split("");
    const next = ["","","","","",""];
    digits.forEach((d, i) => { next[i] = d; });
    setCode(next);
    codeRefs.current[Math.min(digits.length, 5)]?.focus();
  };

  /* ── Reenvio de código com rate limit ────────────────────── */
  const reenviarCodigo = () => {
    const status = vfRateStatus(form.email);
    if (status.blocked) {
      if (status.cooldown) { setVfCooldown(status.cooldown); setVfError(""); }
      else setVfError(status.reason);
      return;
    }
    saveVfAttempt(form.email);
    setVfCooldown(VF_COOLDOWN);
    setVfError("");
    setVfSent(true);
    setTimeout(() => setVfSent(false), 4000);
  };

  /* Ao entrar no step 4, registra o primeiro envio */
  const irParaStep4 = (e) => {
    e.preventDefault();
    if (form.senha !== form.confirmar) return;
    saveVfAttempt(form.email);
    setVfCooldown(VF_COOLDOWN);
    setStep(3);
  };

  /* ── Derivados ───────────────────────────────────────────── */
  const strength = pwStrength(form.senha);
  const isFisica = form.tipoEmpresa === "fisica";

  const canNext0 = form.nome.trim().split(/\s+/).length >= 2 &&
    form.email.includes("@") && form.telefone.length >= 14;
  const docRaw   = form.documento.replace(/\D/g,"");
  const docValid = isFisica
    ? (docRaw.length === 11 && validarCPF(docRaw))
    : (docRaw.length === 14 && validarCNPJ(docRaw));
  const canNext1 = docValid && !docErr && form.cep.length === 9 &&
    !cepErr && form.logradouro && form.numero;
  const canNext2 = form.senha.length >= 8 && form.senha === form.confirmar && terms;

  const next = (e) => { e?.preventDefault(); setStep((s) => s + 1); };
  const back = () => setStep((s) => s - 1);

  const submitCode = (e) => {
    e.preventDefault();
    const full = code.join("");
    if (full.length < 6) { setCodeErr("Digite os 6 dígitos."); return; }
    if (full !== "123456") { setCodeErr("Código inválido. Tente novamente."); return; }
    navigate("/verificacao-kyc");
  };

  const vfAttempts    = getVfAttempts(form.email);
  const vfRemaining   = Math.max(0, VF_LIMIT - vfAttempts.length);
  const canReenviar   = vfCooldown <= 0 && vfAttempts.length < VF_LIMIT;

  return (
    <div className="auth-shell">

      {/* ── Esquerda ─────────────────────────────────────────── */}
      <div className="auth-left">
        <div className="auth-left-inner">
          <img src={logoImg} alt="Gateway JJ" className="auth-logo" />
          <h1 className="auth-left-title">Crie sua conta<br />em minutos</h1>
          <p className="auth-left-sub">
            Preencha os dados abaixo e comece a aceitar pagamentos hoje mesmo, de forma rápida e segura.
          </p>
          <div className="auth-steps-list">
            {STEPS.map((s, i) => (
              <div key={s.label}
                className={`auth-step-item${i < step ? " done" : ""}${i === step ? " active" : ""}`}>
                <div className="auth-step-num">
                  {i < step ? <CheckCircle2 size={14} /> : i + 1}
                </div>
                <div>
                  <span className="auth-step-label">{s.label}</span>
                  <p className="auth-step-sub">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Direita ───────────────────────────────────────────── */}
      <div className="auth-right">
        <div className="auth-form-wrap">
          <div style={{ marginBottom:28 }}>
            <p className="auth-step-badge">Passo {step + 1} de {STEPS.length}</p>
            <h2 className="auth-form-title">{STEPS[step].label}</h2>
            <p className="auth-form-sub">{STEPS[step].desc}</p>
          </div>

          {/* ─── Step 1: Dados pessoais ─── */}
          {step === 0 && (
            <form onSubmit={next} style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div>
                <label className="form-label">Nome completo</label>
                <div className="form-icon-wrap">
                  <User size={14} className="form-icon" />
                  <input className="form-input" placeholder="Rafael Araujo"
                    value={form.nome} onChange={onNomeChange} required />
                </div>
              </div>

              <div style={{ position:"relative" }}>
                <label className="form-label">E-mail</label>
                <div className="form-icon-wrap">
                  <Mail size={14} className="form-icon" />
                  <input className="form-input" type="email" placeholder="seu@email.com"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    onFocus={() => setEmailFocus(true)}
                    onBlur={() => setTimeout(() => setEmailFocus(false), 150)}
                    autoComplete="off" required />
                </div>
                {showSuggestions && (
                  <ul className="email-suggestions">
                    {suggestions.map((s) => (
                      <li key={s} className="email-suggestion-item" onMouseDown={() => pickSuggestion(s)}>
                        <Mail size={12} style={{ flexShrink:0, color:"var(--text-3)" }} />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <label className="form-label">Telefone / WhatsApp</label>
                <div className="form-icon-wrap">
                  <Phone size={14} className="form-icon" />
                  <input className="form-input" placeholder="(11) 99999-0000"
                    value={form.telefone}
                    onChange={(e) => setForm((f) => ({ ...f, telefone: fmtTel(e.target.value) }))}
                    inputMode="numeric" required />
                </div>
              </div>

              <button type="submit" className="btn btn-primary auth-submit-btn"
                disabled={!canNext0} style={{ opacity: canNext0 ? 1 : 0.5 }}>
                Continuar <ArrowRight size={15} />
              </button>

              <div className="auth-form-footer">
                <span>Já tem conta?</span>
                <Link to="/login" className="auth-link">Entrar</Link>
              </div>
            </form>
          )}

          {/* ─── Step 2: Empresa + Endereço ─── */}
          {step === 1 && (
            <form onSubmit={next} style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div>
                <label className="form-label">Tipo de pessoa</label>
                <div className="cad-tipo-wrap">
                  {["fisica","juridica"].map((t) => (
                    <label key={t} className={`cad-tipo-opt${form.tipoEmpresa === t ? " selected" : ""}`}>
                      <input type="radio" name="tipo" value={t}
                        checked={form.tipoEmpresa === t}
                        onChange={() => { setForm((f) => ({ ...f, tipoEmpresa:t, documento:"" })); setDocErr(""); }}
                        style={{ display:"none" }} />
                      <span className="cad-tipo-dot" />
                      <span>{t === "fisica" ? "Pessoa Física" : "Pessoa Jurídica"}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="form-label">{isFisica ? "CPF" : "CNPJ"}</label>
                <div className="form-icon-wrap">
                  <CreditCard size={14} className="form-icon" />
                  <input
                    className={`form-input${docErr ? " input-error" : ""}`}
                    placeholder={isFisica ? "000.000.000-00" : "00.000.000/0001-00"}
                    value={form.documento}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, documento: (isFisica ? fmtCPF : fmtCNPJ)(e.target.value) }));
                      setDocErr("");
                    }}
                    onBlur={validarDoc}
                    inputMode="numeric" required />
                </div>
                {docErr && <p className="field-error">{docErr}</p>}
              </div>

              {!isFisica && (
                <div>
                  <label className="form-label">Nome da empresa</label>
                  <div className="form-icon-wrap">
                    <Building2 size={14} className="form-icon" />
                    <input className="form-input" placeholder="Nome da sua empresa"
                      value={form.nomeEmpresa}
                      onChange={setFiltered("nomeEmpresa", onlyAlphaNum)} required />
                  </div>
                </div>
              )}

              <div>
                <label className="form-label">CEP</label>
                <div className="form-icon-wrap" style={{ position:"relative" }}>
                  <MapPin size={14} className="form-icon" />
                  <input
                    className={`form-input${cepErr ? " input-error" : ""}`}
                    placeholder="00000-000"
                    value={form.cep}
                    onChange={onCepChange}
                    inputMode="numeric"
                    style={{ paddingRight: cepLoad ? 36 : undefined }}
                    required />
                  {cepLoad && (
                    <span style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", color:"var(--text-3)", display:"flex" }}>
                      <Loader2 size={14} className="spin" />
                    </span>
                  )}
                </div>
                {cepErr && <p className="field-error">{cepErr}</p>}
                {!form.logradouro && !cepLoad && form.cep.length > 0 && !cepErr && (
                  <p style={{ fontSize:11, color:"var(--text-3)", marginTop:4 }}>
                    Digite o CEP completo para preencher o endereço automaticamente.
                  </p>
                )}
              </div>

              {form.logradouro && (
                <>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 90px", gap:8 }}>
                    <div>
                      <label className="form-label">Logradouro</label>
                      <input className="form-input" value={form.logradouro}
                        onChange={setFiltered("logradouro", onlyLetters)} required />
                    </div>
                    <div>
                      <label className="form-label">Número</label>
                      <input className="form-input" placeholder="123" value={form.numero}
                        onChange={setFiltered("numero", onlyNumbers)} inputMode="numeric" required />
                    </div>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    <div>
                      <label className="form-label">
                        Complemento <span style={{ color:"var(--text-3)", fontWeight:400 }}>(opcional)</span>
                      </label>
                      <input className="form-input" placeholder="Apto 42" value={form.complemento}
                        onChange={setFiltered("complemento", onlyAlphaNum)} />
                    </div>
                    <div>
                      <label className="form-label">Bairro</label>
                      <input className="form-input" value={form.bairro}
                        onChange={setFiltered("bairro", onlyLetters)} required />
                    </div>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 72px", gap:8 }}>
                    <div>
                      <label className="form-label">Cidade</label>
                      <input className="form-input" value={form.cidade}
                        onChange={setFiltered("cidade", onlyLetters)} required />
                    </div>
                    <div>
                      <label className="form-label">UF</label>
                      <input className="form-input" value={form.estado}
                        onChange={(e) => setForm((f) => ({ ...f, estado: onlyLettersUF(e.target.value) }))}
                        maxLength={2} required />
                    </div>
                  </div>
                </>
              )}

              <div className="auth-btn-row">
                <button type="button" className="btn btn-ghost auth-btn-back" onClick={back}>Voltar</button>
                <button type="submit" className="btn btn-primary auth-btn-next"
                  disabled={!canNext1} style={{ opacity: canNext1 ? 1 : 0.5 }}>
                  Continuar <ArrowRight size={15} />
                </button>
              </div>
            </form>
          )}

          {/* ─── Step 3: Senha ─── */}
          {step === 2 && (
            <form onSubmit={irParaStep4} style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div>
                <label className="form-label">Crie sua senha</label>
                <div className="form-icon-wrap">
                  <Lock size={14} className="form-icon" />
                  <input className="form-input" type={showPass ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres" value={form.senha}
                    onChange={set("senha")} required style={{ paddingRight:42 }} />
                  <button type="button" className="auth-eye-btn" onClick={() => setShowPass((v)=>!v)} tabIndex={-1}>
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                {form.senha.length > 0 && (
                  <div className="pw-strength-box">
                    {/* Barra de força */}
                    <div className="pw-bars">
                      {[0,1,2,3].map((i) => (
                        <div key={i} className="pw-bar"
                          style={{ background: i < strength ? STR_COLOR[strength] : undefined }} />
                      ))}
                    </div>
                    <div className="pw-label-row">
                      <span>Força da senha</span>
                      <span style={{ color: STR_COLOR[strength] }}>{STR_LABEL[strength]}</span>
                    </div>
                    {/* Requisitos */}
                    <div className="pw-reqs">
                      {[
                        [form.senha.length >= 8,          "Mínimo 8 caracteres"],
                        [/[A-Z]/.test(form.senha),         "Uma letra maiúscula"],
                        [/[0-9]/.test(form.senha),         "Um número"],
                        [/[^A-Za-z0-9]/.test(form.senha),  "Um caractere especial"],
                      ].map(([ok, txt]) => (
                        <div key={txt} className={`pw-req${ok ? " ok" : ""}`}>
                          <svg className="pw-req-icon" viewBox="0 0 10 10" fill="none">
                            {ok
                              ? <polyline points="1.5,5 4,7.5 8.5,2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                              : <circle cx="5" cy="5" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
                            }
                          </svg>
                          <span>{txt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="form-label">Confirmar senha</label>
                <div className="form-icon-wrap">
                  <Lock size={14} className="form-icon" />
                  <input className="form-input" type={showConf ? "text" : "password"}
                    placeholder="Repita a senha" value={form.confirmar}
                    onChange={set("confirmar")} required style={{ paddingRight:42 }} />
                  <button type="button" className="auth-eye-btn" onClick={() => setShowConf((v)=>!v)} tabIndex={-1}>
                    {showConf ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {form.confirmar.length > 0 && form.senha !== form.confirmar && (
                  <p className="field-error">As senhas não conferem.</p>
                )}
                {form.confirmar.length > 0 && form.senha === form.confirmar && (
                  <p style={{ fontSize:11, color:"var(--green)", marginTop:4, display:"flex", alignItems:"center", gap:4 }}>
                    <CheckCircle2 size={11} /> Senhas coincidem
                  </p>
                )}
              </div>

              {/* Checkbox personalizado */}
              <div className="cad-terms" onClick={() => setTerms((v) => !v)} role="checkbox" aria-checked={terms} tabIndex={0}
                onKeyDown={(e) => e.key === " " && setTerms((v) => !v)}>
                <div className={`cad-checkbox${terms ? " checked" : ""}`}>
                  {terms && (
                    <svg viewBox="0 0 12 10" fill="none" stroke="currentColor" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="1,5 4.5,8.5 11,1" />
                    </svg>
                  )}
                </div>
                <span onClick={(e) => e.stopPropagation()}>
                  Li e aceito os{" "}
                  <a href="#" className="auth-link" onClick={(e) => e.stopPropagation()}>Termos de Uso</a>{" "}
                  e a{" "}
                  <a href="#" className="auth-link" onClick={(e) => e.stopPropagation()}>Política de Privacidade</a>
                </span>
              </div>

              <div className="auth-btn-row">
                <button type="button" className="btn btn-ghost auth-btn-back" onClick={back}>Voltar</button>
                <button type="submit" className="btn btn-primary auth-btn-next"
                  disabled={!canNext2} style={{ opacity: canNext2 ? 1 : 0.5 }}>
                  Criar conta <ArrowRight size={15} />
                </button>
              </div>
            </form>
          )}

          {/* ─── Step 4: Confirmação de e-mail ─── */}
          {step === 3 && (
            <form onSubmit={submitCode} style={{ display:"flex", flexDirection:"column", gap:16 }}>

              {/* Ícone */}
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:4 }}>
                <div className="cad-confirm-icon" style={{ margin:0, flexShrink:0 }}>
                  <Mail size={24} />
                </div>
                <div>
                  <p style={{ fontSize:13, color:"var(--text-2)", lineHeight:1.5 }}>
                    Código enviado para
                  </p>
                  <p style={{ fontSize:14, fontWeight:700, color:"var(--text-1)" }}>{form.email}</p>
                </div>
              </div>

              {/* Alterar e-mail */}
              <button type="button" className="cad-change-email"
                onClick={() => { setStep(0); setCode(["","","","","",""]); setCodeErr(""); setVfError(""); }}>
                <ArrowLeft size={12} />
                Alterar e-mail
              </button>

              {/* Inputs do código */}
              <div>
                <label className="form-label">Código de verificação</label>
                <div style={{ display:"flex", gap:10 }} onPaste={onCodePaste}>
                  {code.map((d, i) => (
                    <input key={i}
                      ref={(el) => { codeRefs.current[i] = el; }}
                      className="cad-code-input"
                      type="text" inputMode="numeric" maxLength={1} value={d}
                      onChange={(e) => onCodeChange(i, e.target.value)}
                      onKeyDown={(e) => onCodeKeyDown(i, e)}
                      autoFocus={i === 0} />
                  ))}
                </div>
                {codeErr && <p className="field-error" style={{ marginTop:6 }}>{codeErr}</p>}
              </div>

              <button type="submit" className="btn btn-primary auth-submit-btn"
                disabled={code.join("").length < 6}
                style={{ opacity: code.join("").length < 6 ? 0.5 : 1 }}>
                <ShieldCheck size={15} /> Confirmar e-mail
              </button>

              {/* Reenvio com rate limit */}
              <div className="cad-resend-area">
                {vfError ? (
                  <div className="rs-alert" style={{ marginBottom:0 }}>
                    <AlertTriangle size={12} style={{ flexShrink:0 }} />
                    <span>{vfError}</span>
                  </div>
                ) : vfSent ? (
                  <p style={{ fontSize:12, color:"var(--green)", display:"flex", alignItems:"center", gap:5 }}>
                    <CheckCircle2 size={13} /> Código reenviado com sucesso!
                  </p>
                ) : (
                  <p style={{ fontSize:12, color:"var(--text-3)" }}>
                    Não recebeu?{" "}
                    <button type="button"
                      className="auth-link"
                      style={{ background:"none", border:"none", cursor: canReenviar ? "pointer" : "default",
                        fontSize:12, padding:0, opacity: canReenviar ? 1 : 0.5 }}
                      disabled={!canReenviar}
                      onClick={reenviarCodigo}>
                      {vfCooldown > 0 ? (
                        <span style={{ display:"inline-flex", alignItems:"center", gap:4 }}>
                          <Clock size={11} /> Reenviar em {vfCooldown}s
                        </span>
                      ) : "Reenviar código"}
                    </button>
                    {vfRemaining < VF_LIMIT && (
                      <span style={{ marginLeft:6, color:"var(--text-3)", opacity:0.7 }}>
                        · {vfRemaining} restante{vfRemaining !== 1 ? "s" : ""}/hora
                      </span>
                    )}
                  </p>
                )}
              </div>

              <p style={{ fontSize:11, color:"var(--text-3)" }}>
                Verifique também a caixa de spam.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
