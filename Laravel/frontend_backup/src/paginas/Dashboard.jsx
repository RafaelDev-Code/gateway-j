import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  MoreVertical,
  Plus,
  Search,
  Menu,
  ShoppingCart,
  Plane,
  Building2,
  CreditCard,
  DollarSign,
  TrendingUp,
  Settings,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";

const dadosGrafico = [
  { mes: "Jan", lucro: 32, perda: 8 },
  { mes: "Fev", lucro: 28, perda: 12 },
  { mes: "Mar", lucro: 38, perda: 10 },
  { mes: "Abr", lucro: 42, perda: 14 },
  { mes: "Mai", lucro: 35, perda: 15 },
  { mes: "Jun", lucro: 48, perda: 12 },
  { mes: "Jul", lucro: 45, perda: 18 },
  { mes: "Ago", lucro: 50, perda: 10 },
];

const carteiras = [
  { moeda: "USD", bandeira: "🇺🇸", valor: "$22.678,00", limite: "Limite de $10k por mês", status: "Ativo", statusCor: "#22c55e" },
  { moeda: "EUR", bandeira: "🇪🇺", valor: "€18.345,00", limite: "Limite de €8k por mês", status: "Ativo", statusCor: "#22c55e" },
  { moeda: "GBP", bandeira: "🇬🇧", valor: "£15.000,00", limite: "Limite de £7,5k por mês", status: "Inativo", statusCor: "#ef4444" },
];

const atividades = [
  { id: "INV_000076", atividade: "Compra App Mobile", icone: "A", valor: "$25.500", status: "Concluído", statusCor: "#22c55e" },
  { id: "INV_000075", atividade: "Reserva de Hotel", icone: Building2, valor: "$32.750", status: "Pendente", statusCor: "#ef4444" },
  { id: "INV_000074", atividade: "Passagem Aérea", icone: Plane, valor: "$40.200", status: "Concluído", statusCor: "#22c55e" },
  { id: "INV_000073", atividade: "Compra Supermercado", icone: ShoppingCart, valor: "$50.200", status: "Em andamento", statusCor: "#eab308", selecionado: true },
];

export function Dashboard() {
  const [buscaAtividades, setBuscaAtividades] = useState("");

  return (
    <div className="dashboard-page-inner" style={{ display: "flex", flexDirection: "column", gap: 24, width: "100%", maxWidth: "100%", minWidth: 0 }}>
      <div style={{ marginBottom: 4 }}>
        <h1 className="dashboard-title" style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#1f2937" }}>
          Bom dia, Sajibur
        </h1>
        <p className="dashboard-subtitle" style={{ margin: "6px 0 0 0", fontSize: 14, color: "#6b7280" }}>
          Acompanhe suas tarefas, monitore o progresso e acompanhe o status.
        </p>
      </div>

      <div className="dashboard-grid-finexy">
        {/* Saldo Total */}
        <div className="card-branco" style={{ gridArea: "saldo", padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
          <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#6b7280" }}>Saldo Total</h3>
          <p style={{ margin: 0, fontSize: 34, fontWeight: 700, color: "#1f2937", letterSpacing: "-0.02em" }}>
            $689.372,00
          </p>
          <p style={{ margin: 0, fontSize: 13, color: "#22c55e", fontWeight: 500 }}>
            ↑ 5% em relação ao mês passado
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", background: "#f9fafb", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 14, color: "#374151" }}>
              🇺🇸 USD
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: "auto", flexWrap: "wrap" }} className="dashboard-saldo-actions">
            <button style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 16px", background: "#374151", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
              <ArrowLeft size={18} /> Transferir
            </button>
            <button style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 16px", background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb", borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
              Solicitar <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* 4 resumos */}
        <div className="dashboard-resumos" style={{ gridArea: "resumos", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
          {[
            { titulo: "Ganhos Totais", valor: "$950", variacao: "↑ 7% Este mês", variacaoVerde: true, fundo: "#AEDB2F", textoClaro: true, icone: DollarSign },
            { titulo: "Gastos Totais", valor: "$700", variacao: "↓ 5% Este mês", variacaoVermelho: true, fundo: "#fff", textoClaro: false, icone: ShoppingCart },
            { titulo: "Receita Total", valor: "$1.050", variacao: "↑ 8% Este mês", variacaoVerde: true, fundo: "#fff", textoClaro: false, icone: TrendingUp },
            { titulo: "Receita Líquida", valor: "$850", variacao: "↑ 4% Este mês", variacaoVerde: true, fundo: "#fff", textoClaro: false, icone: Settings },
          ].map((card) => {
            const Icon = card.icone;
            return (
              <div key={card.titulo} className="card-branco" style={{ padding: 18, background: card.fundo, color: card.textoClaro ? "#fff" : "#1f2937", border: card.fundo === "#fff" ? "1px solid #e5e7eb" : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ margin: "0 0 4px 0", fontSize: 12, opacity: card.textoClaro ? 0.95 : 0.75 }}>{card.titulo}</p>
                    <p style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{card.valor}</p>
                    <p style={{ margin: "4px 0 0 0", fontSize: 12, color: card.variacaoVermelho ? "#ef4444" : card.variacaoVerde ? (card.textoClaro ? "#fff" : "#22c55e") : "#6b7280" }}>{card.variacao}</p>
                  </div>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: card.textoClaro ? "rgba(255,255,255,0.25)" : "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", color: card.textoClaro ? "#fff" : "#6b7280" }}>
                    <Icon size={18} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Gráfico Receita Total */}
        <div className="card-branco" style={{ gridArea: "grafico", padding: 24, border: "1px solid #e5e7eb" }}>
          <h3 style={{ margin: "0 0 4px 0", fontSize: 16, fontWeight: 600, color: "#1f2937" }}>Receita Total</h3>
          <p style={{ margin: "0 0 20px 0", fontSize: 13, color: "#6b7280" }}>Veja sua receita em um determinado período</p>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosGrafico} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <pattern id="stripesLucro" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
                    <rect width="3" height="6" fill="#AEDB2F" />
                    <rect x="3" width="3" height="6" fill="rgba(174, 219, 47, 0.6)" />
                  </pattern>
                </defs>
                <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 11 }} domain={[0, 60]} ticks={[10, 20, 30, 40, 50]} tickFormatter={(v) => `${v}k`} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8 }} />
                <Legend formatter={(v) => (v === "lucro" ? "Lucro" : "Perda")} iconType="square" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="lucro" name="lucro" stackId="a" radius={[0, 0, 0, 0]} maxBarSize={26}>
                  {dadosGrafico.map((_, i) => (
                    <Cell key={i} fill="url(#stripesLucro)" />
                  ))}
                </Bar>
                <Bar dataKey="perda" name="perda" stackId="a" radius={[0, 0, 0, 0]} maxBarSize={26} fill="#374151" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Carteiras */}
        <div className="card-branco" style={{ gridArea: "carteiras", padding: 24 }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: 15, fontWeight: 600, color: "#1f2937" }}>Carteiras | Total 6 carteiras</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {carteiras.map((c) => (
              <div key={c.moeda} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 14, background: "#f9fafb", borderRadius: 10, border: "1px solid #e5e7eb" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 22 }}>{c.bandeira}</span>
                  <div>
                    <p style={{ margin: "0 0 2px 0", fontWeight: 600, color: "#1f2937", fontSize: 14 }}>{c.moeda}</p>
                    <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#1f2937" }}>{c.valor}</p>
                    <p style={{ margin: "4px 0 0 0", fontSize: 12, color: "#6b7280" }}>{c.limite}</p>
                    <p style={{ margin: "4px 0 0 0", fontSize: 13, fontWeight: 500, color: c.statusCor }}>{c.status}</p>
                  </div>
                </div>
                <button style={{ background: "transparent", border: "none", cursor: "pointer", color: "#6b7280", padding: 4 }}>
                  <MoreVertical size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Limite de gastos mensal */}
        <div className="card-branco" style={{ gridArea: "limite", padding: 24 }}>
          <h3 style={{ margin: "0 0 14px 0", fontSize: 15, fontWeight: 600, color: "#1f2937" }}>Limite de Gastos Mensal</h3>
          <div style={{ height: 10, background: "#e5e7eb", borderRadius: 9999, overflow: "hidden", marginBottom: 8 }}>
            <div style={{ width: "25%", height: "100%", background: "#dc2626", borderRadius: 9999 }} />
          </div>
          <p style={{ margin: 0, fontSize: 14, color: "#374151" }}>
            <strong>$1.400,00</strong> gastos de <strong>$5.500,00</strong>
          </p>
        </div>

        {/* Meus Cartões */}
        <div className="card-branco" style={{ gridArea: "cartoes", padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#1f2937" }}>Meus Cartões</h3>
            <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "#374151", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              <Plus size={16} /> Adicionar
            </button>
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <div style={{ width: 200, height: 118, borderRadius: 12, background: "#27272a", padding: 16, color: "#fff", display: "flex", flexDirection: "column", justifyContent: "space-between", border: "1px solid #3f3f46" }}>
              <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.8)", letterSpacing: 1 }}>))) Ativo</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <p style={{ margin: 0, fontSize: 11, letterSpacing: 2 }}>•••• •••• •••• 1289</p>
                <span style={{ fontSize: 10, fontWeight: 600, color: "#fff" }}>MasterCard</span>
              </div>
            </div>
            <div style={{ width: 200, height: 118, borderRadius: 12, background: "linear-gradient(135deg, #AEDB2F 0%, #8ab82a 100%)", padding: 16, color: "#fff", display: "flex", flexDirection: "column", justifyContent: "space-between", border: "none" }}>
              <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.95)", letterSpacing: 1 }}>))) Ativo</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <p style={{ margin: 0, fontSize: 11, letterSpacing: 2 }}>•••• •••• •••• 3773</p>
                <span style={{ fontSize: 10, fontWeight: 600, color: "#fff" }}>Visa</span>
              </div>
            </div>
          </div>
        </div>

        {/* Atividades Recentes */}
        <div className="card-branco" style={{ gridArea: "atividades", padding: 24 }}>
          <h3 style={{ margin: "0 0 18px 0", fontSize: 15, fontWeight: 600, color: "#1f2937" }}>Atividades Recentes</h3>
          <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200, display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#f9fafb", borderRadius: 8, border: "1px solid #e5e7eb" }}>
              <Search size={18} style={{ color: "#6b7280" }} />
              <input type="text" placeholder="Buscar" value={buscaAtividades} onChange={(e) => setBuscaAtividades(e.target.value)} style={{ flex: 1, border: "none", background: "transparent", fontSize: 14, outline: "none" }} />
            </div>
            <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, fontWeight: 500, fontSize: 14, color: "#374151", cursor: "pointer" }}>
              <Menu size={18} /> Filtrar
            </button>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", minWidth: 580, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                  <th style={{ textAlign: "left", padding: "12px 8px", fontSize: 12, fontWeight: 600, color: "#6b7280", width: 40 }}></th>
                  <th style={{ textAlign: "left", padding: "12px 8px", fontSize: 12, fontWeight: 600, color: "#6b7280" }}>ID do Pedido</th>
                  <th style={{ textAlign: "left", padding: "12px 8px", fontSize: 12, fontWeight: 600, color: "#6b7280" }}>Atividade</th>
                  <th style={{ textAlign: "right", padding: "12px 8px", fontSize: 12, fontWeight: 600, color: "#6b7280" }}>Preço</th>
                  <th style={{ textAlign: "left", padding: "12px 8px", fontSize: 12, fontWeight: 600, color: "#6b7280" }}>Status</th>
                  <th style={{ textAlign: "left", padding: "12px 8px", fontSize: 12, fontWeight: 600, color: "#6b7280" }}>Data</th>
                  <th style={{ width: 36 }}></th>
                </tr>
              </thead>
              <tbody>
                {atividades.map((a) => (
                  <tr key={a.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "14px 8px" }}>
                      <input type="checkbox" defaultChecked={a.selecionado} style={{ width: 16, height: 16, accentColor: "#374151" }} />
                    </td>
                    <td style={{ padding: "14px 8px", fontWeight: 500, color: "#1f2937", fontSize: 14 }}>{a.id}</td>
                    <td style={{ padding: "14px 8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: "#2563eb", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>
                          {typeof a.icone === "string" ? a.icone : (() => { const Icon = a.icone; return <Icon size={16} />; })()}
                        </div>
                        <span style={{ fontSize: 14, color: "#1f2937" }}>{a.atividade}</span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 8px", textAlign: "right", fontWeight: 600, color: "#1f2937", fontSize: 14 }}>{a.valor}</td>
                    <td style={{ padding: "14px 8px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: a.statusCor }} />
                        {a.status}
                      </span>
                    </td>
                    <td style={{ padding: "14px 8px", fontSize: 13, color: "#6b7280" }}>
                      {a.id === "INV_000076" && "17 Abr, 2026 15:45"}
                      {a.id === "INV_000075" && "15 Abr, 2026 11:30"}
                      {a.id === "INV_000074" && "15 Abr, 2026 12:00"}
                      {a.id === "INV_000073" && "14 Abr, 2026 21:15"}
                    </td>
                    <td style={{ padding: "14px 8px" }}>
                      <button style={{ background: "transparent", border: "none", cursor: "pointer", color: "#6b7280" }}>
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
