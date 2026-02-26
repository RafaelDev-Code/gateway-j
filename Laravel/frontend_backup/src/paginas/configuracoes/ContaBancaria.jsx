import { useState } from "react";
import { Building2, Plus, Trash2, CheckCircle, Star } from "lucide-react";
import { PageShell, Card, DarkInput, DarkSelect } from "../../componentes/PageShell";
import { theme } from "../../theme";

const ACCENT = theme.accent; const TEXT = theme.text; const TEXT_MUTED = theme.textMuted;

const CONTAS_INIT = [
  { id: 1, banco: "Bradesco", ag: "1234", cc: "123456-7", tipo: "Conta Corrente", titular: "Rafael Araujo", padrao: true  },
  { id: 2, banco: "Itaú",    ag: "0001", cc: "654321-0", tipo: "Conta Poupança", titular: "Rafael Araujo", padrao: false },
];

const BANCOS = ["Banco do Brasil", "Bradesco", "Caixa Econômica", "Itaú", "Santander", "Nubank", "Inter", "C6 Bank", "Sicredi", "Outros"];

export function ContaBancaria() {
  const [contas, setContas] = useState(CONTAS_INIT);
  const [modal,  setModal]  = useState(false);
  const [form,   setForm]   = useState({ banco: BANCOS[0], ag: "", cc: "", tipo: "Conta Corrente", titular: "" });

  const setPadrao = (id) => setContas(prev => prev.map(c => ({ ...c, padrao: c.id === id })));
  const remover   = (id) => setContas(prev => prev.filter(c => c.id !== id));
  const adicionar = ()   => {
    if (!form.ag || !form.cc) return;
    setContas(prev => [...prev, { ...form, id: Date.now(), padrao: contas.length === 0 }]);
    setModal(false); setForm({ banco: BANCOS[0], ag: "", cc: "", tipo: "Conta Corrente", titular: "" });
  };

  return (
    <PageShell icon={Building2} title="Conta Bancária" subtitle="Gerencie as contas para recebimento de saques"
      actions={
        <button onClick={() => setModal(true)} className="btn-futurist btn-futurist-primary" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          <Plus size={16} /> Adicionar Conta
        </button>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {contas.map((c, i) => (
          <Card key={c.id} style={{ animation: `cardEnter 0.4s ease ${i * 60}ms both`, padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Building2 size={20} style={{ color: TEXT_MUTED }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: TEXT }}>{c.banco}</p>
                    {c.padrao && (
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: "rgba(243,15,34,0.1)", border: `1px solid rgba(243,15,34,0.2)`, color: ACCENT, fontWeight: 700 }}>Principal</span>
                    )}
                  </div>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: TEXT_MUTED }}>
                    {c.tipo} · Ag {c.ag} · CC {c.cc}
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{c.titular}</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                {!c.padrao && (
                  <button onClick={() => setPadrao(c.id)} title="Definir como principal" style={{ display: "flex", alignItems: "center", gap: 4, background: "transparent", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", color: TEXT_MUTED, fontSize: 12, padding: "6px 10px", borderRadius: 7, fontFamily: "var(--font-body)", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.color = ACCENT; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = TEXT_MUTED; }}>
                    <Star size={13} /> Principal
                  </button>
                )}
                <button onClick={() => remover(c.id)} title="Remover" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", color: TEXT_MUTED, padding: "6px 10px", borderRadius: 7, transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#ef4444"; e.currentTarget.style.color = "#ef4444"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = TEXT_MUTED; }}>
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </Card>
        ))}
        {contas.length === 0 && (
          <Card style={{ textAlign: "center", padding: "36px" }}>
            <Building2 size={36} style={{ color: "rgba(255,255,255,0.15)", marginBottom: 12 }} />
            <p style={{ margin: 0, color: TEXT_MUTED, fontSize: 14 }}>Nenhuma conta cadastrada</p>
          </Card>
        )}
      </div>

      {modal && (
        <div onClick={() => setModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#0d0204", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 28, width: "100%", maxWidth: 460, animation: "cardEnter 0.3s ease both" }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 17, fontWeight: 800, color: TEXT }}>Adicionar Conta Bancária</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <DarkSelect label="Banco" value={form.banco} onChange={e => setForm({...form, banco: e.target.value})}>
                {BANCOS.map(b => <option key={b}>{b}</option>)}
              </DarkSelect>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <DarkInput label="Agência" placeholder="0000" value={form.ag} onChange={e => setForm({...form, ag: e.target.value})} />
                <DarkInput label="Conta" placeholder="000000-0" value={form.cc} onChange={e => setForm({...form, cc: e.target.value})} />
              </div>
              <DarkSelect label="Tipo de conta" value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}>
                <option>Conta Corrente</option>
                <option>Conta Poupança</option>
              </DarkSelect>
              <DarkInput label="Nome do titular" placeholder="Igual ao documento" value={form.titular} onChange={e => setForm({...form, titular: e.target.value})} />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
              <button onClick={() => setModal(false)} className="btn-futurist btn-futurist-outline" style={{ flex: 1, padding: "12px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
              <button onClick={adicionar} className="btn-futurist btn-futurist-primary" style={{ flex: 1, padding: "12px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Adicionar</button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
