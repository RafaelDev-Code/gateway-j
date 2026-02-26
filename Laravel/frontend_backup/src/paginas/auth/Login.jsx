import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";
import { theme } from "../../theme";

const ACCENT = theme.accent; const TEXT = theme.text; const TEXT_MUTED = theme.textMuted;

export function Login() {
  const navigate = useNavigate();
  const [email,   setEmail]   = useState("");
  const [senha,   setSenha]   = useState("");
  const [visivel, setVisivel] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro,    setErro]    = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !senha) return;
    setErro(false);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/");
    }, 1500);
  };

  return (
    <div style={{
      minHeight:      "100vh",
      display:        "flex",
      background:     "#060102",
      fontFamily:     "var(--font-body)",
    }}>
      {/* Painel esquerdo — branding */}
      <div style={{
        flex:           "0 0 45%",
        display:        "flex",
        flexDirection:  "column",
        justifyContent: "center",
        padding:        "60px 56px",
        position:       "relative",
        overflow:       "hidden",
        background:     `
          radial-gradient(ellipse 80% 60% at 30% 40%, rgba(243,15,34,0.15) 0%, transparent 60%),
          radial-gradient(ellipse 60% 50% at 80% 80%, rgba(255,255,255,0.04) 0%, transparent 50%),
          #060102
        `,
        borderRight:    "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 64 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18, color: "#fff" }}>V</div>
            <span style={{ fontSize: 20, fontWeight: 800, color: TEXT, letterSpacing: "-0.02em" }}>Vorix</span>
          </div>

          <h1 style={{ margin: "0 0 16px", fontSize: 38, fontWeight: 900, color: TEXT, lineHeight: 1.15, letterSpacing: "-0.03em" }}>
            Gerencie seus<br />
            <span style={{ color: ACCENT }}>pagamentos</span><br />
            com confiança.
          </h1>
          <p style={{ margin: "0 0 48px", fontSize: 15, color: TEXT_MUTED, lineHeight: 1.6, maxWidth: 360 }}>
            Receba, gerencie e analise seus pagamentos em uma plataforma segura, rápida e profissional.
          </p>

          {/* Features */}
          {[
            "Recebimentos via PIX, TED e Boleto",
            "Dashboard com métricas em tempo real",
            "Integrações com Hotmart, Eduzz e mais",
          ].map((f) => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(243,15,34,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: ACCENT }} />
              </div>
              <span style={{ fontSize: 14, color: TEXT_MUTED }}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 32px" }}>
        <div style={{ width: "100%", maxWidth: 400, animation: "cardEnter 0.5s ease both" }}>
          <div style={{ marginBottom: 36 }}>
            <h2 style={{ margin: "0 0 6px", fontSize: 26, fontWeight: 800, color: TEXT, letterSpacing: "-0.02em" }}>Entrar na conta</h2>
            <p style={{ margin: 0, fontSize: 14, color: TEXT_MUTED }}>
              Não tem conta?{" "}
              <button onClick={() => navigate("/cadastro")} style={{ background: "none", border: "none", color: ACCENT, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)", padding: 0 }}>
                Cadastre-se grátis
              </button>
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* E-mail */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: TEXT_MUTED }}>E-mail</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="seu@email.com"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "13px 16px", color: TEXT, fontSize: 14, outline: "none", fontFamily: "var(--font-body)", transition: "border-color 0.2s", width: "100%", boxSizing: "border-box" }}
                onFocus={e => e.target.style.borderColor = "rgba(243,15,34,0.5)"}
                onBlur={e  => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              />
            </div>

            {/* Senha */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: TEXT_MUTED }}>Senha</label>
                <button type="button" style={{ background: "none", border: "none", color: ACCENT, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-body)", padding: 0 }}>
                  Esqueci minha senha
                </button>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type={visivel ? "text" : "password"} value={senha} onChange={e => setSenha(e.target.value)} required
                  placeholder="••••••••"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "13px 44px 13px 16px", color: TEXT, fontSize: 14, outline: "none", fontFamily: "var(--font-body)", transition: "border-color 0.2s", width: "100%", boxSizing: "border-box" }}
                  onFocus={e => e.target.style.borderColor = "rgba(243,15,34,0.5)"}
                  onBlur={e  => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                />
                <button type="button" onClick={() => setVisivel(v => !v)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: TEXT_MUTED }}>
                  {visivel ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Erro */}
            {erro && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <AlertCircle size={15} style={{ color: "#ef4444", flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: "#ef4444" }}>E-mail ou senha inválidos.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                padding: "14px", borderRadius: 10, border: "none",
                background: loading ? "rgba(243,15,34,0.5)" : ACCENT,
                color: "#fff", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "var(--font-body)", transition: "background 0.2s, transform 0.15s",
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = theme.accentHover; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = ACCENT; }}
            >
              {loading ? "Entrando..." : <><LogIn size={18} /> Entrar na conta</>}
            </button>
          </form>

          <p style={{ margin: "28px 0 0", fontSize: 12, color: "rgba(255,255,255,0.25)", textAlign: "center", lineHeight: 1.5 }}>
            Ao entrar, você concorda com os{" "}
            <span style={{ color: TEXT_MUTED, cursor: "pointer" }}>Termos de Uso</span> e{" "}
            <span style={{ color: TEXT_MUTED, cursor: "pointer" }}>Política de Privacidade</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
