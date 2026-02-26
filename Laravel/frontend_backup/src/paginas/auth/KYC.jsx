import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Upload, CheckCircle, Camera, FileText, User, ArrowRight } from "lucide-react";
import { theme } from "../../theme";

const ACCENT = theme.accent; const TEXT = theme.text; const TEXT_MUTED = theme.textMuted;

const ETAPAS = [
  { id: "selfie",    icon: Camera,    title: "Selfie",            desc: "Tire uma foto do seu rosto"                   },
  { id: "doc_frente",icon: FileText,  title: "Documento (frente)", desc: "CNH ou RG — frente"                          },
  { id: "doc_verso", icon: FileText,  title: "Documento (verso)",  desc: "CNH ou RG — verso"                           },
  { id: "comprende", icon: User,      title: "Comprovante",        desc: "Comprovante de residência recente"            },
];

export function KYC() {
  const navigate  = useNavigate();
  const [concluido, setConcluido] = useState({});
  const [loading,   setLoading]   = useState(false);
  const [enviado,   setEnviado]   = useState(false);

  const uploadSimulado = (id) => {
    setTimeout(() => setConcluido(prev => ({ ...prev, [id]: true })), 1000);
  };

  const totalConcluido = Object.values(concluido).filter(Boolean).length;
  const tudo = totalConcluido === ETAPAS.length;

  const enviar = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setEnviado(true); }, 2000);
  };

  if (enviado) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#060102", fontFamily: "var(--font-body)" }}>
      <div style={{ textAlign: "center", animation: "cardEnter 0.5s ease both", padding: 32 }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(34,197,94,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <CheckCircle size={42} style={{ color: "#22c55e" }} />
        </div>
        <h2 style={{ margin: "0 0 12px", fontSize: 26, fontWeight: 900, color: TEXT }}>Documentos enviados!</h2>
        <p style={{ margin: "0 0 32px", fontSize: 15, color: TEXT_MUTED, maxWidth: 380, lineHeight: 1.6 }}>
          Seus documentos estão sendo analisados. A verificação é feita em até 24h úteis. Você receberá uma notificação por e-mail.
        </p>
        <button onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 32px", borderRadius: 10, border: "none", background: ACCENT, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-body)", margin: "0 auto" }}>
          Ir para o Dashboard <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#060102", fontFamily: "var(--font-body)", padding: "32px 16px",
      backgroundImage: `radial-gradient(ellipse 70% 50% at 50% 0%, rgba(243,15,34,0.07) 0%, transparent 55%)`,
    }}>
      <div style={{ width: "100%", maxWidth: 520, animation: "cardEnter 0.5s ease both" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "rgba(243,15,34,0.1)", border: "1px solid rgba(243,15,34,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <ShieldCheck size={28} style={{ color: ACCENT }} />
          </div>
          <h2 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 900, color: TEXT, letterSpacing: "-0.02em" }}>Verificação de identidade</h2>
          <p style={{ margin: 0, fontSize: 14, color: TEXT_MUTED, lineHeight: 1.5 }}>
            Para ativar sua conta, precisamos verificar sua identidade.<br />
            É rápido, seguro e obrigatório por lei.
          </p>
        </div>

        {/* Progresso */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: TEXT_MUTED }}>{totalConcluido} de {ETAPAS.length} documentos enviados</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: ACCENT }}>{Math.round((totalConcluido / ETAPAS.length) * 100)}%</span>
          </div>
          <div style={{ height: 5, borderRadius: 99, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 99, width: `${(totalConcluido / ETAPAS.length) * 100}%`, background: `linear-gradient(90deg, ${ACCENT}, #ff4d5a)`, transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)" }} />
          </div>
        </div>

        {/* Etapas */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {ETAPAS.map((etapa, i) => {
            const Icon     = etapa.icon;
            const done     = concluido[etapa.id];
            return (
              <div
                key={etapa.id}
                style={{
                  display:      "flex",
                  alignItems:   "center",
                  gap:          14,
                  padding:      "16px 18px",
                  borderRadius: 12,
                  background:   done ? "rgba(34,197,94,0.05)" : "rgba(255,255,255,0.03)",
                  border:       `1px solid ${done ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.08)"}`,
                  animation:    `cardEnter 0.4s ease ${i * 60}ms both`,
                  transition:   "background 0.3s, border-color 0.3s",
                }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, background: done ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.3s" }}>
                  {done ? <CheckCircle size={20} style={{ color: "#22c55e" }} /> : <Icon size={20} style={{ color: TEXT_MUTED }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: done ? "#22c55e" : TEXT }}>{etapa.title}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: TEXT_MUTED }}>{etapa.desc}</p>
                </div>
                <label style={{ cursor: done ? "default" : "pointer", flexShrink: 0 }}>
                  {!done ? (
                    <>
                      <input type="file" accept="image/*,.pdf" style={{ display: "none" }} onChange={() => uploadSimulado(etapa.id)} />
                      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, background: "rgba(243,15,34,0.1)", border: `1px solid rgba(243,15,34,0.2)`, color: ACCENT, fontSize: 13, fontWeight: 600 }}>
                        <Upload size={14} /> Enviar
                      </div>
                    </>
                  ) : (
                    <span style={{ fontSize: 12, color: "#22c55e", fontWeight: 600 }}>✓ Enviado</span>
                  )}
                </label>
              </div>
            );
          })}
        </div>

        {/* Aviso */}
        <div style={{ display: "flex", gap: 10, padding: "12px 14px", borderRadius: 10, background: "rgba(59,130,246,0.07)", border: "1px solid rgba(59,130,246,0.18)", marginBottom: 20 }}>
          <ShieldCheck size={16} style={{ color: "#3b82f6", flexShrink: 0, marginTop: 1 }} />
          <p style={{ margin: 0, fontSize: 13, color: "rgba(59,130,246,0.85)", lineHeight: 1.45 }}>
            Seus documentos são criptografados e protegidos. Usados apenas para verificação conforme a LGPD.
          </p>
        </div>

        <button
          onClick={enviar}
          disabled={!tudo || loading}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            padding: "14px", borderRadius: 10, border: "none",
            background: !tudo ? "rgba(255,255,255,0.06)" : loading ? "rgba(243,15,34,0.5)" : ACCENT,
            color: !tudo ? TEXT_MUTED : "#fff",
            fontSize: 15, fontWeight: 700,
            cursor: !tudo || loading ? "not-allowed" : "pointer",
            fontFamily: "var(--font-body)", transition: "background 0.2s",
          }}
        >
          {loading ? "Enviando documentos..." : !tudo ? `Envie todos os documentos (${totalConcluido}/${ETAPAS.length})` : <><ShieldCheck size={18} /> Enviar para verificação</>}
        </button>
      </div>
    </div>
  );
}
