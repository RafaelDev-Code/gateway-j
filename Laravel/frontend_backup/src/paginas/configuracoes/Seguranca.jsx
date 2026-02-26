import { useState } from "react";
import { Shield, Eye, EyeOff, CheckCircle, Smartphone, LogOut, AlertTriangle } from "lucide-react";
import { PageShell, Card, DarkInput } from "../../componentes/PageShell";
import { theme } from "../../theme";

const ACCENT = theme.accent; const TEXT = theme.text; const TEXT_MUTED = theme.textMuted;

const SESSOES = [
  { id: 1, dispositivo: "Chrome · Windows 11",   ip: "189.28.xx.xx",   local: "Rio de Janeiro, BR", ativo: true,   ult: "Agora"          },
  { id: 2, dispositivo: "Safari · iPhone 15",     ip: "177.92.xx.xx",   local: "São Paulo, BR",      ativo: false,  ult: "Há 2h"          },
  { id: 3, dispositivo: "Firefox · macOS",        ip: "200.15.xx.xx",   local: "Rio de Janeiro, BR", ativo: false,  ult: "Há 1 dia"       },
];

export function Seguranca() {
  const [twoFa,   setTwoFa]   = useState(false);
  const [show,    setShow]    = useState({ atual: false, nova: false, conf: false });
  const [salvo,   setSalvo]   = useState(false);
  const [sessoes, setSessoes] = useState(SESSOES);

  const revogarSessao = (id) => setSessoes(prev => prev.filter(s => s.id !== id || s.ativo));

  const salvarSenha = (e) => {
    e.preventDefault();
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2500);
  };

  return (
    <PageShell icon={Shield} title="Segurança" subtitle="Gerencie sua senha, autenticação e sessões ativas">

      {/* Alterar senha */}
      <Card style={{ animation: "cardEnter 0.4s ease 0ms both" }}>
        <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: TEXT }}>Alterar senha</h3>
        <form onSubmit={salvarSenha} style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 420 }}>
          <div style={{ position: "relative" }}>
            <DarkInput label="Senha atual" type={show.atual ? "text" : "password"} placeholder="••••••••" />
            <button type="button" onClick={() => setShow(s => ({...s, atual: !s.atual}))} style={{ position: "absolute", right: 12, bottom: 11, background: "none", border: "none", cursor: "pointer", color: TEXT_MUTED }}>
              {show.atual ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div style={{ position: "relative" }}>
            <DarkInput label="Nova senha" type={show.nova ? "text" : "password"} placeholder="Mínimo 8 caracteres" />
            <button type="button" onClick={() => setShow(s => ({...s, nova: !s.nova}))} style={{ position: "absolute", right: 12, bottom: 11, background: "none", border: "none", cursor: "pointer", color: TEXT_MUTED }}>
              {show.nova ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div style={{ position: "relative" }}>
            <DarkInput label="Confirmar nova senha" type={show.conf ? "text" : "password"} placeholder="Repita a nova senha" />
            <button type="button" onClick={() => setShow(s => ({...s, conf: !s.conf}))} style={{ position: "absolute", right: 12, bottom: 11, background: "none", border: "none", cursor: "pointer", color: TEXT_MUTED }}>
              {show.conf ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
            <button type="submit" className="btn-futurist btn-futurist-primary" style={{ padding: "11px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              Atualizar senha
            </button>
            {salvo && (
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#22c55e", animation: "cardEnter 0.3s ease both" }}>
                <CheckCircle size={15} /> Senha atualizada!
              </span>
            )}
          </div>
        </form>
      </Card>

      {/* 2FA */}
      <Card style={{ animation: "cardEnter 0.45s ease 80ms both" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: twoFa ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.05)", border: `1px solid ${twoFa ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.08)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.3s" }}>
              <Smartphone size={20} style={{ color: twoFa ? "#22c55e" : TEXT_MUTED }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: TEXT }}>Autenticação em dois fatores (2FA)</p>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: TEXT_MUTED, maxWidth: 440, lineHeight: 1.45 }}>
                Adicione uma camada extra de segurança. Ao ativar, você precisará de um código do app autenticador em cada login.
              </p>
              <span style={{ display: "inline-block", marginTop: 8, fontSize: 12, fontWeight: 600, color: twoFa ? "#22c55e" : "rgba(255,255,255,0.3)" }}>
                {twoFa ? "✓ Ativo" : "Inativo"}
              </span>
            </div>
          </div>
          <div
            onClick={() => setTwoFa(v => !v)}
            style={{
              width: 46, height: 26, borderRadius: 99, flexShrink: 0,
              background:   twoFa ? "rgba(34,197,94,0.25)" : "rgba(255,255,255,0.07)",
              border:       `1px solid ${twoFa ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.12)"}`,
              position:     "relative", cursor: "pointer",
              transition:   "background 0.22s, border-color 0.22s",
            }}
          >
            <div style={{
              position:   "absolute", top: 3, left: twoFa ? 22 : 3,
              width: 18, height: 18, borderRadius: "50%",
              background: twoFa ? "#22c55e" : "rgba(255,255,255,0.35)",
              transition: "left 0.22s cubic-bezier(0.4,0,0.2,1), background 0.22s",
            }} />
          </div>
        </div>
      </Card>

      {/* Sessões ativas */}
      <Card style={{ animation: "cardEnter 0.45s ease 160ms both", padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "18px 20px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: TEXT }}>Sessões ativas</h3>
          <button style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "1px solid rgba(239,68,68,0.2)", color: "rgba(239,68,68,0.7)", fontSize: 12, fontFamily: "var(--font-body)", padding: "6px 12px", borderRadius: 7, cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#ef4444"; e.currentTarget.style.color = "#ef4444"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)"; e.currentTarget.style.color = "rgba(239,68,68,0.7)"; }}>
            <LogOut size={13} /> Encerrar todas
          </button>
        </div>
        {sessoes.map((s, i) => (
          <div key={s.id} style={{ padding: "14px 20px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.ativo ? "#22c55e" : "rgba(255,255,255,0.2)", flexShrink: 0 }} />
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: s.ativo ? 600 : 400, color: s.ativo ? TEXT : TEXT_MUTED }}>{s.dispositivo}</p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{s.ip} · {s.local} · {s.ult}</p>
              </div>
            </div>
            {!s.ativo && (
              <button onClick={() => revogarSessao(s.id)} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: TEXT_MUTED, fontSize: 12, fontFamily: "var(--font-body)", padding: "5px 10px", borderRadius: 6, cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#ef4444"; e.currentTarget.style.color = "#ef4444"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = TEXT_MUTED; }}>
                Revogar
              </button>
            )}
            {s.ativo && <span style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", padding: "3px 8px", borderRadius: 99, background: "rgba(34,197,94,0.1)" }}>Atual</span>}
          </div>
        ))}
      </Card>
    </PageShell>
  );
}
