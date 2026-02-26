import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, UserPlus, CheckCircle } from "lucide-react";
import { theme } from "../../theme";

const ACCENT = theme.accent; const TEXT = theme.text; const TEXT_MUTED = theme.textMuted;

const PASSOS = ["Conta", "Dados pessoais", "Segurança"];

export function Cadastro() {
  const navigate = useNavigate();
  const [passo,  setPasso]  = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", cpf: "", nascimento: "", senha: "", confirma: "", termos: false });
  const [visSenha, setVisSenha] = useState(false);

  const avancar = (e) => {
    e.preventDefault();
    if (passo < PASSOS.length - 1) { setPasso(p => p + 1); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); navigate("/kyc"); }, 1600);
  };

  const f = (k) => (v) => setForm(prev => ({ ...prev, [k]: v }));

  const inputStyle = {
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
    padding: "13px 16px", color: TEXT, fontSize: 14, outline: "none",
    fontFamily: "var(--font-body)", transition: "border-color 0.2s", width: "100%", boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#060102", fontFamily: "var(--font-body)", padding: "32px 16px",
      backgroundImage: `radial-gradient(ellipse 70% 50% at 50% 0%, rgba(243,15,34,0.08) 0%, transparent 60%)`,
    }}>
      <div style={{ width: "100%", maxWidth: 480, animation: "cardEnter 0.5s ease both" }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40, justifyContent: "center" }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, color: "#fff" }}>V</div>
          <span style={{ fontSize: 18, fontWeight: 800, color: TEXT, letterSpacing: "-0.02em" }}>Vorix</span>
        </div>

        {/* Stepper */}
        <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 36, justifyContent: "center" }}>
          {PASSOS.map((p, i) => (
            <div key={p} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  background: i < passo ? ACCENT : i === passo ? "rgba(243,15,34,0.15)" : "rgba(255,255,255,0.05)",
                  border: `2px solid ${i <= passo ? ACCENT : "rgba(255,255,255,0.1)"}`,
                  fontSize: 13, fontWeight: 700, color: i <= passo ? (i < passo ? "#fff" : ACCENT) : TEXT_MUTED,
                  transition: "all 0.3s",
                }}>
                  {i < passo ? <CheckCircle size={15} style={{ color: "#fff" }} /> : i + 1}
                </div>
                <span style={{ fontSize: 11, fontWeight: i === passo ? 600 : 400, color: i === passo ? TEXT : TEXT_MUTED, whiteSpace: "nowrap" }}>{p}</span>
              </div>
              {i < PASSOS.length - 1 && <div style={{ width: 60, height: 2, background: i < passo ? ACCENT : "rgba(255,255,255,0.08)", marginBottom: 20, transition: "background 0.3s" }} />}
            </div>
          ))}
        </div>

        {/* Card */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "28px 28px 24px", backdropFilter: "blur(20px)" }}>
          <h2 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 800, color: TEXT }}>
            {passo === 0 && "Crie sua conta"}
            {passo === 1 && "Dados pessoais"}
            {passo === 2 && "Defina sua senha"}
          </h2>

          <form onSubmit={avancar} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Passo 0 */}
            {passo === 0 && <>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: TEXT_MUTED }}>Nome completo</label>
                <input style={inputStyle} placeholder="Seu nome" value={form.nome} onChange={e => f("nome")(e.target.value)} required onFocus={e => e.target.style.borderColor = "rgba(243,15,34,0.5)"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: TEXT_MUTED }}>E-mail</label>
                <input type="email" style={inputStyle} placeholder="seu@email.com" value={form.email} onChange={e => f("email")(e.target.value)} required onFocus={e => e.target.style.borderColor = "rgba(243,15,34,0.5)"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: TEXT_MUTED }}>Telefone / WhatsApp</label>
                <input style={inputStyle} placeholder="(21) 99999-0000" value={form.telefone} onChange={e => f("telefone")(e.target.value)} required onFocus={e => e.target.style.borderColor = "rgba(243,15,34,0.5)"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
              </div>
            </>}

            {/* Passo 1 */}
            {passo === 1 && <>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: TEXT_MUTED }}>CPF</label>
                <input style={inputStyle} placeholder="000.000.000-00" value={form.cpf} onChange={e => f("cpf")(e.target.value)} required onFocus={e => e.target.style.borderColor = "rgba(243,15,34,0.5)"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: TEXT_MUTED }}>Data de nascimento</label>
                <input type="date" style={inputStyle} value={form.nascimento} onChange={e => f("nascimento")(e.target.value)} required onFocus={e => e.target.style.borderColor = "rgba(243,15,34,0.5)"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
              </div>
            </>}

            {/* Passo 2 */}
            {passo === 2 && <>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: TEXT_MUTED }}>Senha</label>
                <div style={{ position: "relative" }}>
                  <input type={visSenha ? "text" : "password"} style={{ ...inputStyle, paddingRight: 44 }} placeholder="Mínimo 8 caracteres" value={form.senha} onChange={e => f("senha")(e.target.value)} required onFocus={e => e.target.style.borderColor = "rgba(243,15,34,0.5)"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
                  <button type="button" onClick={() => setVisSenha(v => !v)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: TEXT_MUTED }}>{visSenha ? <EyeOff size={17} /> : <Eye size={17} />}</button>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: TEXT_MUTED }}>Confirmar senha</label>
                <input type="password" style={inputStyle} placeholder="Repita a senha" value={form.confirma} onChange={e => f("confirma")(e.target.value)} required onFocus={e => e.target.style.borderColor = "rgba(243,15,34,0.5)"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
              </div>
              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", marginTop: 4 }}>
                <input type="checkbox" checked={form.termos} onChange={e => f("termos")(e.target.checked)} required style={{ marginTop: 2, accentColor: ACCENT, width: 15, height: 15, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: TEXT_MUTED, lineHeight: 1.45 }}>
                  Li e aceito os <span style={{ color: ACCENT, cursor: "pointer" }}>Termos de Uso</span> e a <span style={{ color: ACCENT, cursor: "pointer" }}>Política de Privacidade</span>
                </span>
              </label>
            </>}

            <button type="submit" disabled={loading} style={{
              marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              padding: "13px", borderRadius: 10, border: "none",
              background: loading ? "rgba(243,15,34,0.5)" : ACCENT,
              color: "#fff", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "var(--font-body)", transition: "background 0.2s",
            }}>
              {loading ? "Criando conta..." : passo < PASSOS.length - 1 ? "Continuar →" : <><UserPlus size={17} /> Criar conta</>}
            </button>
          </form>
        </div>

        <p style={{ margin: "20px 0 0", fontSize: 14, color: TEXT_MUTED, textAlign: "center" }}>
          Já tem conta?{" "}
          <button onClick={() => navigate("/login")} style={{ background: "none", border: "none", color: ACCENT, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)", padding: 0 }}>
            Entrar
          </button>
        </p>
      </div>
    </div>
  );
}
