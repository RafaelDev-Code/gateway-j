import { useState } from "react";
import { Globe, CheckCircle, Plus, RefreshCw, Unlink } from "lucide-react";
import { PageShell, Card, StatCard } from "../../componentes/PageShell";
import { theme } from "../../theme";

const ACCENT = theme.accent; const TEXT = theme.text; const TEXT_MUTED = theme.textMuted;

const PLATAFORMAS_INIT = [
  { id: "hotmart",   nome: "Hotmart",     emoji: "🔥", desc: "Plataforma de produtos digitais",     conectada: true,  ultSync: "Há 5 min"  },
  { id: "eduzz",     nome: "Eduzz",       emoji: "⚡", desc: "Marketplace de produtos digitais",    conectada: true,  ultSync: "Há 1h"     },
  { id: "monetizze", nome: "Monetizze",   emoji: "💰", desc: "Gestão de assinaturas e afiliados",   conectada: false, ultSync: null        },
  { id: "kiwify",    nome: "Kiwify",      emoji: "🥝", desc: "Vendas de infoprodutos",               conectada: false, ultSync: null        },
  { id: "braip",     nome: "Braip",       emoji: "💡", desc: "Plataforma de afiliados e produtos",  conectada: false, ultSync: null        },
  { id: "shopify",   nome: "Shopify",     emoji: "🛍", desc: "E-commerce e lojas virtuais",         conectada: true,  ultSync: "Há 30 min" },
];

export function Plataformas() {
  const [plataformas, setPlataformas] = useState(PLATAFORMAS_INIT);

  const toggle = (id) => setPlataformas(prev => prev.map(p => p.id === id ? { ...p, conectada: !p.conectada, ultSync: p.conectada ? null : "Agora mesmo" } : p));
  const conectadas = plataformas.filter(p => p.conectada).length;

  return (
    <PageShell icon={Globe} title="Plataformas" subtitle="Conecte e gerencie suas integrações de plataformas de venda">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        <StatCard icon={CheckCircle} label="Conectadas"      value={`${conectadas}`}                              sub="Ativas e sincronizando" delay={0}  />
        <StatCard icon={Globe}       label="Disponíveis"     value={`${plataformas.length - conectadas}`}         sub="Para integrar"          delay={60} />
        <StatCard icon={RefreshCw}   label="Última sync"     value="Há 5 min"                                    sub="Hotmart"                delay={120} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
        {plataformas.map((p, i) => (
          <Card key={p.id} style={{ animation: `cardEnter 0.4s ease ${200 + i * 50}ms both`, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                  {p.emoji}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: TEXT }}>{p.nome}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: TEXT_MUTED }}>{p.desc}</p>
                </div>
              </div>
              {/* Toggle switch */}
              <div
                onClick={() => toggle(p.id)}
                style={{
                  width: 40, height: 22, borderRadius: 99, flexShrink: 0,
                  background: p.conectada ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.08)",
                  border: `1px solid ${p.conectada ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.12)"}`,
                  position: "relative", cursor: "pointer",
                  transition: "background 0.2s, border-color 0.2s",
                }}
              >
                <div style={{
                  position: "absolute", top: 2, left: p.conectada ? 20 : 2,
                  width: 16, height: 16, borderRadius: "50%",
                  background: p.conectada ? "#22c55e" : "rgba(255,255,255,0.4)",
                  transition: "left 0.22s cubic-bezier(0.4,0,0.2,1), background 0.2s",
                }} />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, color: p.conectada ? "#22c55e" : TEXT_MUTED, fontWeight: p.conectada ? 600 : 400 }}>
                {p.conectada ? `✓ Conectada · ${p.ultSync}` : "Não conectada"}
              </span>
              {p.conectada && (
                <button
                  onClick={() => toggle(p.id)}
                  style={{ display: "flex", alignItems: "center", gap: 4, background: "transparent", border: "none", cursor: "pointer", color: "rgba(239,68,68,0.6)", fontSize: 12, fontFamily: "var(--font-body)", transition: "color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(239,68,68,0.6)"}
                >
                  <Unlink size={12} /> Desconectar
                </button>
              )}
              {!p.conectada && (
                <button
                  onClick={() => toggle(p.id)}
                  style={{ display: "flex", alignItems: "center", gap: 4, background: "transparent", border: "none", cursor: "pointer", color: ACCENT, fontSize: 12, fontFamily: "var(--font-body)", fontWeight: 600, transition: "opacity 0.2s" }}
                >
                  <Plus size={12} /> Conectar
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
