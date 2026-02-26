import { useState } from "react";
import { ArrowUpRight, Wallet, Clock, AlertCircle, ChevronDown, CheckCircle } from "lucide-react";
import { PageShell, Card, StatCard, DarkInput, DarkSelect } from "../../componentes/PageShell";
import { theme } from "../../theme";

const ACCENT     = theme.accent;
const TEXT       = theme.text;
const TEXT_MUTED = theme.textMuted;

const HISTORICO = [
  { id: "SAQ-001", valor: "R$ 2.000,00", destino: "Bradesco ••2847",  data: "Hoje, 09:14",    status: "concluido"   },
  { id: "SAQ-002", valor: "R$ 5.500,00", destino: "Itaú ••1023",      data: "Ontem, 14:32",   status: "concluido"   },
  { id: "SAQ-003", valor: "R$ 800,00",   destino: "Nubank ••7761",     data: "Seg, 11:00",     status: "processando" },
  { id: "SAQ-004", valor: "R$ 3.200,00", destino: "BB ••4490",         data: "Dom, 16:45",     status: "cancelado"   },
];

const STATUS_MAP = {
  concluido:   { color: "#22c55e", label: "Concluído"   },
  processando: { color: "#3b82f6", label: "Processando" },
  cancelado:   { color: "#ef4444", label: "Cancelado"   },
};

export function EfetuarSaque() {
  const [valor,      setValor]      = useState("");
  const [conta,      setConta]      = useState("bradesco");
  const [descricao,  setDescricao]  = useState("");
  const [sucesso,    setSucesso]    = useState(false);
  const [loading,    setLoading]    = useState(false);

  const saldo = 12840.50;
  const limite = 10000;

  const handleSaque = (e) => {
    e.preventDefault();
    if (!valor) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setSucesso(true); }, 1600);
  };

  if (sucesso) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 420, gap: 16, animation: "cardEnter 0.4s ease both" }}>
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(34,197,94,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CheckCircle size={38} style={{ color: "#22c55e" }} />
      </div>
      <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: TEXT }}>Saque solicitado!</h2>
      <p style={{ margin: 0, color: TEXT_MUTED, fontSize: 14, textAlign: "center" }}>
        Seu saque de <strong style={{ color: TEXT }}>{valor}</strong> está sendo processado.<br />O prazo é de até 1 dia útil.
      </p>
      <button onClick={() => { setSucesso(false); setValor(""); }} className="btn-futurist btn-futurist-outline" style={{ marginTop: 8, padding: "12px 28px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
        Novo saque
      </button>
    </div>
  );

  return (
    <PageShell icon={ArrowUpRight} title="Efetuar Saque" subtitle="Transfira saldo para sua conta bancária vinculada">
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        <StatCard icon={Wallet} label="Disponível para Saque" value={`R$ ${saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} sub="Saldo líquido" delay={0} />
        <StatCard icon={ArrowUpRight} label="Limite por Saque" value={`R$ ${limite.toLocaleString("pt-BR")},00`} sub="Limite diário" delay={60} />
        <StatCard icon={Clock} label="Prazo de Crédito" value="Até 1 dia útil" sub="Após confirmação" delay={120} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>
        {/* Formulário */}
        <Card style={{ animation: "cardEnter 0.45s ease 180ms both" }}>
          <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: TEXT }}>Solicitar saque</h3>
          <form onSubmit={handleSaque} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <DarkInput
              label="Valor do saque (R$)"
              id="valor-saque"
              type="number"
              placeholder="0,00"
              min="1"
              max={saldo}
              value={valor}
              onChange={e => setValor(e.target.value)}
              required
            />
            <DarkSelect label="Conta de destino" id="conta-destino" value={conta} onChange={e => setConta(e.target.value)}>
              <option value="bradesco">Bradesco — Ag. 1234 / CC ••2847</option>
              <option value="itau">Itaú — Ag. 0001 / CC ••1023</option>
              <option value="nubank">Nubank — CC ••7761</option>
            </DarkSelect>
            <DarkInput
              label="Descrição (opcional)"
              id="desc-saque"
              placeholder="Ex: Retirada mensal"
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
            />

            {/* Aviso */}
            <div style={{ display: "flex", gap: 10, padding: "12px 14px", borderRadius: 10, background: "rgba(234,179,8,0.07)", border: "1px solid rgba(234,179,8,0.2)" }}>
              <AlertCircle size={16} style={{ color: "#eab308", flexShrink: 0, marginTop: 1 }} />
              <p style={{ margin: 0, fontSize: 13, color: "rgba(234,179,8,0.9)", lineHeight: 1.45 }}>
                Saques realizados até 17h são creditados no mesmo dia útil. Após esse horário, no próximo dia útil.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-futurist btn-futurist-primary"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "14px", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Processando..." : <><ArrowUpRight size={18} /> Confirmar Saque</>}
            </button>
          </form>
        </Card>

        {/* Histórico */}
        <Card style={{ animation: "cardEnter 0.45s ease 240ms both", padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "18px 20px 12px" }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: TEXT }}>Histórico recente</h3>
          </div>
          {HISTORICO.map((h, i) => {
            const s = STATUS_MAP[h.status];
            return (
              <div key={h.id} style={{ padding: "12px 20px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{h.valor}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: s.color }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color }} />
                    {s.label}
                  </span>
                </div>
                <span style={{ fontSize: 12, color: TEXT_MUTED }}>{h.destino}</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{h.data}</span>
              </div>
            );
          })}
        </Card>
      </div>
    </PageShell>
  );
}
