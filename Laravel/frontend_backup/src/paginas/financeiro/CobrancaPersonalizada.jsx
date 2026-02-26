import { useState } from "react";
import { Receipt, Plus, Copy, CheckCircle, Search, Filter } from "lucide-react";
import { PageShell, Card, StatCard, StatusBadge, DarkInput, DarkSelect } from "../../componentes/PageShell";
import { theme } from "../../theme";

const ACCENT     = theme.accent;
const TEXT       = theme.text;
const TEXT_MUTED = theme.textMuted;

const COBRANÇAS = [
  { id: "COB-001", cliente: "João Silva",    valor: "R$ 450,00",   tipo: "PIX",    venc: "20/01/2026", status: "concluido"   },
  { id: "COB-002", cliente: "Maria Souza",   valor: "R$ 1.200,00", tipo: "Boleto", venc: "25/01/2026", status: "pendente"    },
  { id: "COB-003", cliente: "Carlos Lima",   valor: "R$ 800,00",   tipo: "PIX",    venc: "28/01/2026", status: "pendente"    },
  { id: "COB-004", cliente: "Ana Pereira",   valor: "R$ 3.500,00", tipo: "Cartão", venc: "15/01/2026", status: "cancelado"   },
  { id: "COB-005", cliente: "Pedro Costa",   valor: "R$ 950,00",   tipo: "Boleto", venc: "18/01/2026", status: "concluido"   },
];

export function CobrancaPersonalizada() {
  const [modal,    setModal]    = useState(false);
  const [busca,    setBusca]    = useState("");
  const [copiado,  setCopiado]  = useState(null);
  const [form,     setForm]     = useState({ cliente: "", email: "", valor: "", tipo: "pix", desc: "" });

  const cobranças = COBRANÇAS.filter((c) => c.cliente.toLowerCase().includes(busca.toLowerCase()) || c.id.toLowerCase().includes(busca.toLowerCase()));

  const copiarLink = (id) => {
    navigator.clipboard.writeText(`https://pagar.vorix.com.br/${id}`).catch(() => {});
    setCopiado(id);
    setTimeout(() => setCopiado(null), 2000);
  };

  return (
    <PageShell
      icon={Receipt}
      title="Cobrança Personalizada"
      subtitle="Crie e gerencie cobranças para seus clientes"
      actions={
        <button onClick={() => setModal(true)} className="btn-futurist btn-futurist-primary" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          <Plus size={16} /> Nova Cobrança
        </button>
      }
    >
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        <StatCard icon={Receipt}      label="Total geradas"    value="5"           sub="Este mês"               delay={0}   />
        <StatCard icon={CheckCircle}  label="Pagas"            value="2"           sub="R$ 1.400,00 recebido"   delay={60}  />
        <StatCard icon={Receipt}      label="Pendentes"        value="2"           sub="R$ 2.000,00 a receber"  delay={120} />
      </div>

      {/* Tabela */}
      <Card style={{ animation: "cardEnter 0.45s ease 200ms both", padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "18px 20px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: TEXT }}>Cobranças geradas</h3>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "rgba(255,255,255,0.04)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)" }}>
              <Search size={14} style={{ color: TEXT_MUTED }} />
              <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar cliente ou ID..." style={{ background: "transparent", border: "none", outline: "none", color: TEXT, fontSize: 13, fontFamily: "var(--font-body)", width: 180 }} />
            </div>
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", minWidth: 600, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {["ID", "Cliente", "Valor", "Tipo", "Vencimento", "Status", "Link"].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cobranças.map((c) => (
                <tr key={c.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: TEXT_MUTED }}>{c.id}</td>
                  <td style={{ padding: "12px 16px", fontSize: 14, color: TEXT, fontWeight: 500 }}>{c.cliente}</td>
                  <td style={{ padding: "12px 16px", fontSize: 14, color: TEXT, fontWeight: 700 }}>{c.valor}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: TEXT_MUTED }}>{c.tipo}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: TEXT_MUTED }}>{c.venc}</td>
                  <td style={{ padding: "12px 16px" }}><StatusBadge status={c.status} /></td>
                  <td style={{ padding: "12px 16px" }}>
                    <button onClick={() => copiarLink(c.id)} style={{ display: "flex", alignItems: "center", gap: 5, background: "transparent", border: "none", cursor: "pointer", color: copiado === c.id ? "#22c55e" : TEXT_MUTED, fontSize: 12, fontFamily: "var(--font-body)", transition: "color 0.2s" }}>
                      {copiado === c.id ? <CheckCircle size={13} /> : <Copy size={13} />}
                      {copiado === c.id ? "Copiado" : "Copiar link"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal nova cobrança */}
      {modal && (
        <div onClick={() => setModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#0d0204", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 28, width: "100%", maxWidth: 460, animation: "cardEnter 0.3s ease both" }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 17, fontWeight: 800, color: TEXT }}>Nova Cobrança</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <DarkInput label="Nome do cliente" placeholder="Ex: João Silva" value={form.cliente} onChange={e => setForm({...form, cliente: e.target.value})} />
              <DarkInput label="E-mail do cliente" type="email" placeholder="joao@email.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              <DarkInput label="Valor (R$)" type="number" placeholder="0,00" value={form.valor} onChange={e => setForm({...form, valor: e.target.value})} />
              <DarkSelect label="Forma de pagamento" value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}>
                <option value="pix">PIX</option>
                <option value="boleto">Boleto</option>
                <option value="cartao">Cartão de Crédito</option>
              </DarkSelect>
              <DarkInput label="Descrição (opcional)" placeholder="Ex: Serviço de consultoria" value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
              <button onClick={() => setModal(false)} className="btn-futurist btn-futurist-outline" style={{ flex: 1, padding: "12px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
              <button onClick={() => setModal(false)} className="btn-futurist btn-futurist-primary" style={{ flex: 1, padding: "12px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Criar Cobrança</button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
