import { useState } from "react";
import { KeyRound, Copy, CheckCircle, RefreshCw, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { PageShell, Card, StatCard } from "../../componentes/PageShell";
import { theme } from "../../theme";

const ACCENT = theme.accent; const TEXT = theme.text; const TEXT_MUTED = theme.textMuted;

const MASK = (v) => v.slice(0, 8) + "•".repeat(v.length - 12) + v.slice(-4);

export function Credenciais() {
  const [copiado,    setCopiado]    = useState(null);
  const [visivel,    setVisivel]    = useState({});
  const [regenModal, setRegenModal] = useState(null);

  const CHAVES = [
    { id: "pub",    label: "Chave Pública",  tipo: "Produção",  valor: "gjj_pub_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", icone: ShieldCheck, cor: "#22c55e"  },
    { id: "secret", label: "Chave Secreta",  tipo: "Produção",  valor: "gjj_sec_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", icone: KeyRound,    cor: ACCENT     },
    { id: "pub_t",  label: "Chave Pública",  tipo: "Teste",     valor: "gjj_pub_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", icone: ShieldCheck, cor: "#3b82f6"  },
    { id: "sec_t",  label: "Chave Secreta",  tipo: "Teste",     valor: "gjj_sec_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", icone: KeyRound,    cor: "#eab308"  },
  ];

  const copiar = (id, val) => {
    navigator.clipboard.writeText(val).catch(() => {});
    setCopiado(id);
    setTimeout(() => setCopiado(null), 2000);
  };

  return (
    <PageShell icon={KeyRound} title="Credenciais" subtitle="Gerencie suas chaves de API para integração com a plataforma">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        <StatCard icon={KeyRound}    label="Chaves ativas"   value="4"              sub="2 produção + 2 teste" delay={0}  />
        <StatCard icon={ShieldCheck} label="Última geração"  value="15 Jan 2026"    sub="Chave secreta"        delay={60} />
        <StatCard icon={RefreshCw}   label="Próxima rotação" value="15 Abr 2026"    sub="Recomendado"          delay={120} />
      </div>

      {/* Aviso */}
      <div style={{ display: "flex", gap: 12, padding: "14px 16px", borderRadius: 10, background: "rgba(234,179,8,0.07)", border: "1px solid rgba(234,179,8,0.2)", animation: "cardEnter 0.4s ease 160ms both" }}>
        <ShieldCheck size={18} style={{ color: "#eab308", flexShrink: 0, marginTop: 1 }} />
        <p style={{ margin: 0, fontSize: 13, color: "rgba(234,179,8,0.9)", lineHeight: 1.5 }}>
          Nunca compartilhe suas chaves secretas. Em caso de comprometimento, regenere imediatamente. As chaves de teste não realizam cobranças reais.
        </p>
      </div>

      {/* Grupos produção e teste */}
      {["Produção", "Teste"].map((grupo, gi) => (
        <div key={grupo} style={{ animation: `cardEnter 0.45s ease ${200 + gi * 80}ms both` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: grupo === "Produção" ? "#22c55e" : "#3b82f6" }} />
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>{grupo}</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {CHAVES.filter(c => c.tipo === grupo).map((c) => {
              const Icon    = c.icone;
              const isVis   = visivel[c.id];
              const mostrar = isVis ? c.valor : MASK(c.valor);
              return (
                <Card key={c.id} style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${c.cor}15`, border: `1px solid ${c.cor}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon size={17} style={{ color: c.cor }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: "0 0 2px", fontSize: 12, color: TEXT_MUTED, fontWeight: 500 }}>{c.label}</p>
                        <p style={{ margin: 0, fontSize: 13, color: TEXT, fontWeight: 500, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{mostrar}</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                      <button onClick={() => setVisivel(v => ({...v, [c.id]: !v[c.id]}))} title={isVis ? "Ocultar" : "Revelar"} style={{ background: "transparent", border: "none", cursor: "pointer", color: TEXT_MUTED, padding: 6, borderRadius: 6, transition: "color 0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.color = TEXT} onMouseLeave={e => e.currentTarget.style.color = TEXT_MUTED}>
                        {isVis ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button onClick={() => copiar(c.id, c.valor)} title="Copiar" style={{ display: "flex", alignItems: "center", gap: 4, background: "transparent", border: "none", cursor: "pointer", color: copiado === c.id ? "#22c55e" : TEXT_MUTED, fontSize: 12, fontFamily: "var(--font-body)", padding: 6, borderRadius: 6, transition: "color 0.2s" }}>
                        {copiado === c.id ? <CheckCircle size={15} /> : <Copy size={15} />}
                        {copiado === c.id ? "Copiado" : "Copiar"}
                      </button>
                      <button onClick={() => setRegenModal(c.id)} title="Regenerar" style={{ display: "flex", alignItems: "center", gap: 4, background: "transparent", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", color: TEXT_MUTED, fontSize: 12, fontFamily: "var(--font-body)", padding: "5px 10px", borderRadius: 6, transition: "all 0.2s" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.color = ACCENT; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = TEXT_MUTED; }}>
                        <RefreshCw size={13} /> Regenerar
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      {/* Modal confirmação regenerar */}
      {regenModal && (
        <div onClick={() => setRegenModal(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#0d0204", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 28, maxWidth: 400, width: "100%", animation: "cardEnter 0.3s ease both", textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(243,15,34,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <RefreshCw size={26} style={{ color: ACCENT }} />
            </div>
            <h3 style={{ margin: "0 0 10px", fontSize: 17, fontWeight: 800, color: TEXT }}>Regenerar chave?</h3>
            <p style={{ margin: "0 0 22px", fontSize: 14, color: TEXT_MUTED, lineHeight: 1.5 }}>Esta ação revogará a chave atual. Todas as integrações usando esta chave deixarão de funcionar imediatamente.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setRegenModal(null)} className="btn-futurist btn-futurist-outline" style={{ flex: 1, padding: "12px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
              <button onClick={() => setRegenModal(null)} className="btn-futurist btn-futurist-primary" style={{ flex: 1, padding: "12px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
