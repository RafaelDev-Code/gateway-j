import { useState } from "react";
import { RotateCcw, Search, Download, AlertCircle, DollarSign, Clock } from "lucide-react";
import { PageShell, Card, StatCard, StatusBadge, DarkInput, DarkSelect } from "../../componentes/PageShell";
import { theme } from "../../theme";

const TEXT = theme.text; const TEXT_MUTED = theme.textMuted; const ACCENT = theme.accent;

const REEMBOLSOS = [
  { id: "RMB-001", cliente: "João Silva",    valor: "R$ 300,00",  motivo: "Produto não entregue",   data: "Hoje 10:14",   status: "concluido",   tipo: "PIX"    },
  { id: "RMB-002", cliente: "Maria Souza",   valor: "R$ 150,00",  motivo: "Desistência",            data: "Ontem 14:22",  status: "processando", tipo: "Cartão" },
  { id: "RMB-003", cliente: "Carlos Lima",   valor: "R$ 800,00",  motivo: "Cobrança duplicada",     data: "Seg 09:00",    status: "pendente",    tipo: "TED"    },
  { id: "RMB-004", cliente: "Ana Pereira",   valor: "R$ 50,00",   motivo: "Serviço não prestado",   data: "Dom 16:30",    status: "concluido",   tipo: "PIX"    },
  { id: "RMB-005", cliente: "Pedro Costa",   valor: "R$ 1.200,00",motivo: "Fraude identificada",    data: "Sáb 11:45",    status: "cancelado",   tipo: "Boleto" },
];

export function Reembolsos() {
  const [busca,  setBusca]  = useState("");
  const [modal,  setModal]  = useState(false);
  const lista = REEMBOLSOS.filter(r => r.cliente.toLowerCase().includes(busca.toLowerCase()) || r.id.toLowerCase().includes(busca.toLowerCase()));

  const total    = REEMBOLSOS.reduce((acc, r) => acc + parseFloat(r.valor.replace(/[^0-9,]/g, "").replace(",", ".")), 0);
  const pendente = REEMBOLSOS.filter(r => r.status === "pendente" || r.status === "processando").length;

  return (
    <PageShell icon={RotateCcw} title="Reembolsos" subtitle="Gerencie e acompanhe todos os reembolsos"
      actions={
        <button onClick={() => setModal(true)} className="btn-futurist btn-futurist-primary" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          <RotateCcw size={15} /> Novo Reembolso
        </button>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        <StatCard icon={RotateCcw}   label="Total reembolsado" value={`R$ ${total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} sub="Este período" delay={0}   />
        <StatCard icon={Clock}       label="Em andamento"      value={`${pendente}`} sub="Aguardando processamento" delay={60}  />
        <StatCard icon={AlertCircle} label="Motivo principal"  value="Desistência"  sub="34% dos casos"            delay={120} />
      </div>

      <Card style={{ animation: "cardEnter 0.45s ease 200ms both", padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "18px 20px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: TEXT }}>Histórico de reembolsos</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "rgba(255,255,255,0.04)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)" }}>
            <Search size={14} style={{ color: TEXT_MUTED }} />
            <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar..." style={{ background: "transparent", border: "none", outline: "none", color: TEXT, fontSize: 13, fontFamily: "var(--font-body)", width: 160 }} />
          </div>
        </div>
        <table style={{ width: "100%", minWidth: 620, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              {["ID", "Cliente", "Valor", "Motivo", "Tipo", "Data", "Status"].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lista.map(r => (
              <tr key={r.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "13px 16px", fontSize: 12, color: TEXT_MUTED, fontWeight: 600 }}>{r.id}</td>
                <td style={{ padding: "13px 16px", fontSize: 14, color: TEXT, fontWeight: 500 }}>{r.cliente}</td>
                <td style={{ padding: "13px 16px", fontSize: 14, fontWeight: 700, color: "#a855f7" }}>{r.valor}</td>
                <td style={{ padding: "13px 16px", fontSize: 13, color: TEXT_MUTED }}>{r.motivo}</td>
                <td style={{ padding: "13px 16px", fontSize: 13, color: TEXT_MUTED }}>{r.tipo}</td>
                <td style={{ padding: "13px 16px", fontSize: 12, color: TEXT_MUTED }}>{r.data}</td>
                <td style={{ padding: "13px 16px" }}><StatusBadge status={r.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {modal && (
        <div onClick={() => setModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#0d0204", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 28, width: "100%", maxWidth: 440, animation: "cardEnter 0.3s ease both" }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 17, fontWeight: 800, color: TEXT }}>Novo Reembolso</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <DarkInput label="ID da transação" placeholder="TRX-0000" />
              <DarkInput label="Valor do reembolso (R$)" type="number" placeholder="0,00" />
              <DarkSelect label="Motivo">
                <option>Produto não entregue</option>
                <option>Desistência</option>
                <option>Cobrança duplicada</option>
                <option>Serviço não prestado</option>
                <option>Fraude identificada</option>
              </DarkSelect>
              <DarkInput label="Observação (opcional)" placeholder="Detalhes adicionais..." />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
              <button onClick={() => setModal(false)} className="btn-futurist btn-futurist-outline" style={{ flex: 1, padding: "12px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
              <button onClick={() => setModal(false)} className="btn-futurist btn-futurist-primary" style={{ flex: 1, padding: "12px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
