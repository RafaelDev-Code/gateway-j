import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Zap, BarChart2, Loader2 } from "lucide-react";
import logoImg from "../../assets/logo.webp";
import { useAuth } from "../../contexts/AuthContext";
import { apiJson } from "../../api/client";

const FEATURES = [
  { icon: ShieldCheck, title: "Segurança bancária",       desc: "Criptografia AES-256 e TLS 1.3 em todas as operações." },
  { icon: Zap,         title: "Processamento instantâneo", desc: "6 adquirentes integrados com failover automático."      },
  { icon: BarChart2,   title: "Analytics em tempo real",   desc: "Dashboard completo com visão total do seu negócio."     },
];

export function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ email: "", senha: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setError(""); };

  if (isAuthenticated) {
    navigate("/", { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await apiJson("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: form.email, password: form.senha }),
      });
      login(res.token, res.user);
      navigate("/", { replace: true });
    } catch (err) {
      const msg = err?.data?.message ?? err?.data?.errors?.email?.[0] ?? err?.message ?? "Credenciais inválidas. Tente novamente.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      {/* ── Esquerda — branding ── */}
      <div className="auth-left">
        <div className="auth-left-inner">
          <img src={logoImg} alt="Gateway JJ" className="auth-logo" />

          <h1 className="auth-left-title">
            Sua plataforma de<br />pagamentos moderna
          </h1>
          <p className="auth-left-sub">
            Gerencie transações Pix, cartão e boleto com total controle e visibilidade.
          </p>

          <div className="auth-features">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="auth-feature-item">
                <div className="auth-feature-icon">
                  <Icon size={16} strokeWidth={2} />
                </div>
                <div>
                  <p className="auth-feature-title">{title}</p>
                  <p className="auth-feature-desc">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Direita — formulário ── */}
      <div className="auth-right">
        <div className="auth-form-wrap">
          <div style={{ marginBottom: 32 }}>
            <h2 className="auth-form-title">Bem-vindo de volta</h2>
            <p className="auth-form-sub">Acesse sua conta para continuar</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label className="form-label">E-mail</label>
              <div className="form-icon-wrap">
                <Mail size={14} className="form-icon" />
                <input className="form-input" type="email" placeholder="seu@email.com"
                  value={form.email} onChange={set("email")} required autoComplete="email" />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                <label className="form-label" style={{ margin: 0 }}>Senha</label>
                <Link to="/redefinir-senha" style={{ fontSize: 12, color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}>
                  Esqueci minha senha
                </Link>
              </div>
              <div className="form-icon-wrap">
                <Lock size={14} className="form-icon" />
                <input className="form-input" type={showPass ? "text" : "password"} placeholder="••••••••"
                  value={form.senha} onChange={set("senha")} required autoComplete="current-password"
                  style={{ paddingRight: 42 }} />
                <button type="button" className="auth-eye-btn" onClick={() => setShowPass((v) => !v)} tabIndex={-1}>
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && <p className="field-error" style={{ marginTop: 0 }}>{error}</p>}
            <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading}>
              {loading ? <><Loader2 size={15} className="spin" /> Entrando...</> : <>Entrar <ArrowRight size={15} /></>}
            </button>
          </form>

          <div className="auth-form-footer">
            <span>Não tem uma conta?</span>
            <Link to="/cadastro" className="auth-link">Criar conta</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
