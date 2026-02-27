import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, KeyRound, Clock, AlertTriangle } from "lucide-react";
import logoImg from "../../assets/logo.webp";

/* ─── Rate limiting via localStorage ────────────────────────
   Regras:
   - Máximo 3 envios por hora por e-mail
   - Mínimo 60s entre tentativas
   ─────────────────────────────────────────────────────────── */
const LS_KEY     = (email) => `rs_attempts_${email.toLowerCase().trim()}`;
const LIMIT_HOUR = 3;
const COOLDOWN_S = 60;

function getAttempts(email) {
  try {
    const raw = localStorage.getItem(LS_KEY(email));
    if (!raw) return [];
    const arr = JSON.parse(raw);
    const now = Date.now();
    return arr.filter((ts) => now - ts < 60 * 60 * 1000); // só última hora
  } catch { return []; }
}

function saveAttempt(email) {
  const list = [...getAttempts(email), Date.now()];
  localStorage.setItem(LS_KEY(email), JSON.stringify(list));
}

function rateStatus(email) {
  const attempts = getAttempts(email);
  const now      = Date.now();
  const last     = attempts.length ? attempts[attempts.length - 1] : 0;
  const secsAgo  = Math.floor((now - last) / 1000);
  const cooldownLeft = COOLDOWN_S - secsAgo;

  if (attempts.length >= LIMIT_HOUR) {
    const oldest    = attempts[0];
    const resetIn   = Math.ceil((oldest + 60 * 60 * 1000 - now) / 1000 / 60);
    return { blocked: true, reason: `Limite de ${LIMIT_HOUR} envios por hora atingido. Tente novamente em ${resetIn} min.` };
  }
  if (cooldownLeft > 0) {
    return { blocked: true, cooldown: cooldownLeft };
  }
  return { blocked: false };
}

export function RedefinirSenha() {
  const [stage,    setStage]    = useState("email"); // email | sent
  const [email,    setEmail]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [cooldown, setCooldown] = useState(0);

  /* Regressivo para cooldown */
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const status = rateStatus(email);
    if (status.blocked) {
      if (status.cooldown) {
        setCooldown(status.cooldown);
        setError(`Aguarde ${status.cooldown}s antes de solicitar novamente.`);
      } else {
        setError(status.reason);
      }
      return;
    }

    setLoading(true);
    /* Simula chamada à API */
    await new Promise((r) => setTimeout(r, 1200));
    saveAttempt(email);
    setLoading(false);
    setStage("sent");
  };

  const reenviar = () => {
    const status = rateStatus(email);
    if (status.blocked) {
      if (status.cooldown) {
        setCooldown(status.cooldown);
        setError(`Aguarde ${status.cooldown}s antes de reenviar.`);
      } else {
        setError(status.reason);
      }
      return;
    }
    saveAttempt(email);
    setCooldown(COOLDOWN_S);
    setError("");
  };

  const attempts     = email ? getAttempts(email) : [];
  const attemptsLeft = Math.max(0, LIMIT_HOUR - attempts.length);

  return (
    <div className="auth-shell">

      {/* ── Esquerda ──────────────────────────────────────────── */}
      <div className="auth-left">
        <div className="auth-left-inner">
          <img src={logoImg} alt="Gateway JJ" className="auth-logo" />
          <h1 className="auth-left-title">Recupere o<br />acesso à sua conta</h1>
          <p className="auth-left-sub">
            Enviaremos um link seguro para o e-mail cadastrado. Basta clicar no link para criar uma nova senha.
          </p>

          <div className="auth-features">
            {[
              { icon: Mail,         title: "Informe seu e-mail",    desc: "Usaremos para identificar sua conta."         },
              { icon: KeyRound,     title: "Receba o link seguro",   desc: "Um link exclusivo chegará na sua caixa de entrada." },
              { icon: Lock,         title: "Crie sua nova senha",    desc: "Defina uma senha forte e segura."             },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="auth-feature-item">
                <div className="auth-feature-icon"><Icon size={16} strokeWidth={2} /></div>
                <div>
                  <p className="auth-feature-title">{title}</p>
                  <p className="auth-feature-desc">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Direita ───────────────────────────────────────────── */}
      <div className="auth-right">
        <div className="auth-form-wrap">

          {/* Stage: formulário de e-mail */}
          {stage === "email" && (
            <>
              <div style={{ marginBottom: 28 }}>
                <h2 className="auth-form-title">Redefinir senha</h2>
                <p className="auth-form-sub">
                  Informe o e-mail da sua conta e enviaremos um link para criar uma nova senha.
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:18 }}>
                <div>
                  <label className="form-label">E-mail</label>
                  <div className="form-icon-wrap">
                    <Mail size={14} className="form-icon" />
                    <input
                      className="form-input"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(""); }}
                      required
                    />
                  </div>
                </div>

                {/* Erro / cooldown */}
                {(error || cooldown > 0) && (
                  <div className="rs-alert">
                    <AlertTriangle size={13} style={{ flexShrink:0 }} />
                    <span>
                      {error || `Aguarde ${cooldown}s antes de tentar novamente.`}
                    </span>
                  </div>
                )}

                {/* Contador de tentativas restantes — só mostra se já tentou */}
                {attempts.length > 0 && attemptsLeft > 0 && (
                  <p style={{ fontSize:11, color:"var(--text-3)", display:"flex", alignItems:"center", gap:5 }}>
                    <Clock size={11} />
                    {attemptsLeft} envio{attemptsLeft !== 1 ? "s" : ""} restante{attemptsLeft !== 1 ? "s" : ""} nesta hora
                  </p>
                )}

                <button
                  type="submit"
                  className="btn btn-primary auth-submit-btn"
                  disabled={loading || cooldown > 0}
                  style={{ opacity: loading || cooldown > 0 ? 0.6 : 1 }}
                >
                  {loading ? (
                    <>Enviando… <span className="spin" style={{ display:"inline-block" }}>⟳</span></>
                  ) : cooldown > 0 ? (
                    <><Clock size={14} /> Aguarde {cooldown}s</>
                  ) : (
                    <>Enviar link <ArrowRight size={15} /></>
                  )}
                </button>
              </form>
            </>
          )}

          {/* Stage: link enviado */}
          {stage === "sent" && (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:0 }}>
              <div style={{
                width:64, height:64, borderRadius:"50%",
                background:"var(--accent-faint)", border:"1px solid var(--accent)",
                display:"flex", alignItems:"center", justifyContent:"center",
                color:"var(--accent)", marginBottom:20,
              }}>
                <Mail size={28} />
              </div>

              <h2 className="auth-form-title" style={{ textAlign:"center" }}>Verifique seu e-mail</h2>
              <p className="auth-form-sub" style={{ textAlign:"center", marginBottom:6 }}>
                Enviamos um link de redefinição para
              </p>
              <p style={{ fontSize:14, fontWeight:700, color:"var(--text-1)", marginBottom:24, textAlign:"center" }}>
                {email}
              </p>

              <p style={{ fontSize: 12, color: "var(--text-3)", textAlign: "center", lineHeight: 1.6, marginBottom: 4 }}>
                Não encontrou o e-mail? Verifique a pasta de <strong style={{ color: "var(--text-2)" }}>spam</strong> ou clique em reenviar abaixo.
                O link expira em <strong style={{ color: "var(--text-2)" }}>30 minutos</strong>.
              </p>

              {/* Reenviar */}
              {error && (
                <div className="rs-alert" style={{ width:"100%", marginBottom:8 }}>
                  <AlertTriangle size={13} style={{ flexShrink:0 }} />
                  <span>{error}</span>
                </div>
              )}

              <div style={{ width:"100%", display:"flex", flexDirection:"column", gap:10, marginTop:16 }}>
                <button
                  className="btn btn-ghost auth-submit-btn"
                  style={{ opacity: cooldown > 0 ? 0.55 : 1, cursor: cooldown > 0 ? "not-allowed" : "pointer" }}
                  disabled={cooldown > 0}
                  onClick={reenviar}
                >
                  {cooldown > 0 ? (
                    <><Clock size={14} /> Reenviar em {cooldown}s</>
                  ) : (
                    <>Reenviar link</>
                  )}
                </button>

                <button className="btn btn-ghost auth-submit-btn"
                  onClick={() => { setStage("email"); setError(""); }}>
                  Usar outro e-mail
                </button>
              </div>
            </div>
          )}

          {stage !== "sent" && (
            <div className="auth-form-footer">
              <span>Lembrou sua senha?</span>
              <Link to="/login" className="auth-link">Entrar</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
