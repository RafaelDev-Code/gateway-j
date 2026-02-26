import { useState } from "react";
import { ArrowDownLeft, Copy, CheckCircle, RefreshCw, QrCode, Clock, DollarSign } from "lucide-react";
import { PageShell, Card, StatCard } from "../../componentes/PageShell";
import { theme } from "../../theme";

const ACCENT     = theme.accent;
const TEXT       = theme.text;
const TEXT_MUTED = theme.textMuted;

const CHAVE_PIX   = "gateway@vorix.com.br";
const DADOS_BANCO = { banco: "Banco Vorix S.A.", agencia: "0001", conta: "123456-7", cnpj: "12.345.678/0001-90" };

const DEPOSITOS_RECENTES = [
  { id: "DEP-001", valor: "R$ 5.000,00",  tipo: "PIX",     origem: "João Silva",       data: "Hoje, 08:30",   status: "concluido"   },
  { id: "DEP-002", valor: "R$ 1.200,00",  tipo: "TED",     origem: "Maria Souza",      data: "Ontem, 15:22",  status: "concluido"   },
  { id: "DEP-003", valor: "R$ 3.800,00",  tipo: "PIX",     origem: "Pedro Costa",      data: "Seg, 10:11",    status: "concluido"   },
  { id: "DEP-004", valor: "R$ 500,00",    tipo: "Boleto",  origem: "Carlos Lima",      data: "Dom, 13:45",    status: "processando" },
];

export function EfetuarDeposito() {
  const [copiado, setCopiado] = useState(null);
  const [aba,     setAba]     = useState("pix");

  const copiar = (texto, key) => {
    navigator.clipboard.writeText(texto).catch(() => {});
    setCopiado(key);
    setTimeout(() => setCopiado(null), 2000);
  };

  const CopyBtn = ({ texto, id }) => (
    <button
      onClick={() => copiar(texto, id)}
      style={{ background: "transparent", border: "none", cursor: "pointer", color: copiado === id ? "#22c55e" : TEXT_MUTED, padding: "4px 6px", borderRadius: 6, transition: "color 0.2s", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontFamily: "var(--font-body)" }}
    >
      {copiado === id ? <CheckCircle size={14} /> : <Copy size={14} />}
      {copiado === id ? "Copiado!" : "Copiar"}
    </button>
  );

  return (
    <PageShell icon={ArrowDownLeft} title="Efetuar Depósito" subtitle="Receba valores na sua conta via PIX, TED ou Boleto">
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        <StatCard icon={DollarSign} label="Saldo atual"     value="R$ 12.840,50" sub="Disponível"           delay={0}   />
        <StatCard icon={Clock}      label="Em processamento" value="R$ 500,00"   sub="1 depósito pendente"   delay={60}  />
        <StatCard icon={ArrowDownLeft} label="Recebidos hoje" value="R$ 5.000,00" sub="1 depósito"          delay={120} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" }}>
        {/* Métodos de depósito */}
        <Card style={{ animation: "cardEnter 0.45s ease 180ms both" }}>
          <h3 style={{ margin: "0 0 18px", fontSize: 16, fontWeight: 700, color: TEXT }}>Dados para depósito</h3>

          {/* Abas */}
          <div style={{ display: "flex", gap: 6, marginBottom: 22, borderBottom: "1px solid rgba(255,255,255,0.07)", paddingBottom: 0 }}>
            {["pix", "ted", "boleto"].map((a) => (
              <button key={a} onClick={() => setAba(a)} style={{
                padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer",
                background: "transparent", border: "none", fontFamily: "var(--font-body)",
                color: aba === a ? ACCENT : TEXT_MUTED,
                borderBottom: aba === a ? `2px solid ${ACCENT}` : "2px solid transparent",
                transition: "color 0.2s, border-color 0.2s",
                textTransform: "uppercase", letterSpacing: "0.04em",
              }}>
                {a}
              </button>
            ))}
          </div>

          {/* PIX */}
          {aba === "pix" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {/* QR Code simulado */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "24px 20px", background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ width: 140, height: 140, borderRadius: 12, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <QrCode size={72} style={{ color: TEXT_MUTED }} />
                </div>
                <p style={{ margin: 0, fontSize: 12, color: TEXT_MUTED }}>Escaneie o QR Code com o app do seu banco</p>
              </div>
              {/* Chave */}
              <div>
                <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 500, color: TEXT_MUTED }}>Chave PIX (e-mail)</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "rgba(255,255,255,0.04)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)" }}>
                  <span style={{ fontSize: 14, color: TEXT, fontWeight: 500 }}>{CHAVE_PIX}</span>
                  <CopyBtn texto={CHAVE_PIX} id="pix-key" />
                </div>
              </div>
            </div>
          )}

          {/* TED */}
          {aba === "ted" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {Object.entries({ "Banco": DADOS_BANCO.banco, "Agência": DADOS_BANCO.agencia, "Conta": DADOS_BANCO.conta, "CNPJ": DADOS_BANCO.cnpj }).map(([label, val]) => (
                <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "rgba(255,255,255,0.04)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 11, color: TEXT_MUTED, fontWeight: 500 }}>{label}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 14, color: TEXT, fontWeight: 600 }}>{val}</p>
                  </div>
                  <CopyBtn texto={val} id={label} />
                </div>
              ))}
            </div>
          )}

          {/* Boleto */}
          {aba === "boleto" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, textAlign: "center", padding: "24px 0" }}>
              <RefreshCw size={40} style={{ color: TEXT_MUTED, margin: "0 auto" }} />
              <p style={{ margin: 0, color: TEXT_MUTED, fontSize: 14 }}>
                Gere um boleto de depósito informando o valor desejado
              </p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <input type="number" placeholder="Valor (R$)" style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: TEXT, fontSize: 14, outline: "none", fontFamily: "var(--font-body)", width: 160 }} />
                <button className="btn-futurist btn-futurist-primary" style={{ padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Gerar Boleto</button>
              </div>
            </div>
          )}
        </Card>

        {/* Depósitos recentes */}
        <Card style={{ animation: "cardEnter 0.45s ease 240ms both", padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "18px 20px 12px" }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: TEXT }}>Depósitos recentes</h3>
          </div>
          {DEPOSITOS_RECENTES.map((d) => {
            const statusCor = d.status === "concluido" ? "#22c55e" : "#3b82f6";
            return (
              <div key={d.id} style={{ padding: "12px 20px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", gap: 3 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{d.valor}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: statusCor }}>{d.status === "concluido" ? "Concluído" : "Processando"}</span>
                </div>
                <span style={{ fontSize: 12, color: TEXT_MUTED }}>{d.tipo} · {d.origem}</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{d.data}</span>
              </div>
            );
          })}
        </Card>
      </div>
    </PageShell>
  );
}
