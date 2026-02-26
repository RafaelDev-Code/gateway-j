import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Zap, ArrowRight, Shield } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

export function Login() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/");
  };

  return (
    <div className="login-page">
      {/* Left — branding */}
      <div className="login-left">
        <div style={{ position: "relative", zIndex: 1, maxWidth: 420 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 48 }}>
            <div style={{
              width: 44,
              height: 44,
              background: "#4361EE",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 0 4px rgba(67,97,238,0.25)",
            }}>
              <Zap size={20} color="#fff" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>
              Gateway JJ
            </span>
          </div>

          <h2 style={{
            fontSize: 36,
            fontWeight: 800,
            color: "#fff",
            letterSpacing: "-0.03em",
            lineHeight: 1.15,
            marginBottom: 16,
          }}>
            Sua plataforma de pagamentos moderna
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: 40 }}>
            Gerencie transações PIX, acompanhe seu saldo e controle seu negócio em tempo real.
          </p>

          {[
            { icon: Shield, text: "Segurança de nível bancário com criptografia AES-256" },
            { icon: Zap,    text: "Processamento instantâneo com 6 adquirentes integrados" },
            { icon: ArrowRight, text: "Dashboard completo com analytics em tempo real" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 32,
                height: 32,
                background: "rgba(67,97,238,0.20)",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginTop: 2,
              }}>
                <Icon size={15} color="#7B9EFF" />
              </div>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.60)", lineHeight: 1.6 }}>{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right — form */}
      <div className="login-right">
        <div className="login-form-wrap">
          <div className="login-logo-area">
            <div className="login-logo-icon">
              <Zap size={20} strokeWidth={2.5} />
            </div>
            <span className="login-logo-text">Gateway JJ</span>
          </div>

          <h1 className="login-heading">Bem-vindo de volta</h1>
          <p className="login-subheading">Acesse sua conta para continuar</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">E-mail</label>
              <div className="form-input-icon-wrap">
                <Mail size={15} className="form-input-icon" />
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 8 }}>
              <label className="form-label" htmlFor="password">Senha</label>
              <div className="form-input-icon-wrap">
                <Lock size={15} className="form-input-icon" />
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  className="form-input"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: 42 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  style={{
                    position: "absolute",
                    right: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                  }}
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
              <a href="#" style={{ fontSize: 13, color: "var(--accent)", fontWeight: 500, textDecoration: "none" }}>
                Esqueci minha senha
              </a>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%", height: 44, fontSize: 15 }}>
              Entrar <ArrowRight size={16} />
            </button>
          </form>

          <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--border)", textAlign: "center" }}>
            <p style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Shield size={12} /> Conexão segura com TLS 1.3
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
