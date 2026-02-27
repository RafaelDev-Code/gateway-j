import { useState } from "react";
import { AlertOctagon, Clock, CheckCircle2, XCircle, MoreHorizontal } from "lucide-react";
import { Paginacao } from "../../components/Paginacao";

const CONTESTACOES = [
  { id: "DSP-441", txn: "TXN-8817", cliente: "Loja ABC",     valor: 445.00,   motivo: "Produto não recebido",        status: "aberta",  prazo: "05/03/2026" },
  { id: "DSP-440", txn: "TXN-8804", cliente: "Cliente C",    valor: 1_200.00, motivo: "Transação não reconhecida",   status: "analise", prazo: "03/03/2026" },
  { id: "DSP-439", txn: "TXN-8798", cliente: "Tech Store",   valor: 320.00,   motivo: "Cobrança duplicada",          status: "ganha",   prazo: "01/03/2026" },
  { id: "DSP-438", txn: "TXN-8790", cliente: "Empresa Z",    valor: 890.50,   motivo: "Produto com defeito",         status: "perdida", prazo: "28/02/2026" },
  { id: "DSP-437", txn: "TXN-8785", cliente: "Serviços XYZ", valor: 2_100.00, motivo: "Cancelamento negado",         status: "aberta",  prazo: "07/03/2026" },
  { id: "DSP-436", txn: "TXN-8770", cliente: "Cliente D",    valor: 650.00,   motivo: "Produto divergente",          status: "analise", prazo: "10/03/2026" },
  { id: "DSP-435", txn: "TXN-8760", cliente: "Empresa K",    valor: 3_400.00, motivo: "Não autorizado pelo titular", status: "ganha",   prazo: "25/02/2026" },
  { id: "DSP-434", txn: "TXN-8750", cliente: "Loja Beta",    valor: 210.00,   motivo: "Cobrança indevida",           status: "perdida", prazo: "22/02/2026" },
  { id: "DSP-433", txn: "TXN-8740", cliente: "Cliente F",    valor: 980.00,   motivo: "Produto não entregue",        status: "aberta",  prazo: "12/03/2026" },
];

const STATUS = {
  aberta:   { label: "Aberta",     cls: "badge-yellow", icon: Clock        },
  analise:  { label: "Em análise", cls: "badge-blue",   icon: AlertOctagon },
  ganha:    { label: "Ganha",      cls: "badge-green",  icon: CheckCircle2 },
  perdida:  { label: "Perdida",    cls: "badge-red",    icon: XCircle      },
};

const fmt = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
const PER_PAGE = 7;

export function Contestacoes() {
  const [filtro, setFiltro] = useState("todos");
  const [pagina, setPagina] = useState(1);

  const filtrada = filtro === "todos" ? CONTESTACOES : CONTESTACOES.filter((c) => c.status === filtro);

  const total     = CONTESTACOES.length;
  const abertas   = CONTESTACOES.filter((c) => c.status === "aberta" || c.status === "analise").length;
  const valorTotal = CONTESTACOES.reduce((s, c) => s + c.valor, 0);

  const totalPags  = Math.max(1, Math.ceil(filtrada.length / PER_PAGE));
  const paginaReal = Math.min(pagina, totalPags);
  const lista      = filtrada.slice((paginaReal - 1) * PER_PAGE, paginaReal * PER_PAGE);

  const onFiltro = (s) => { setFiltro(s); setPagina(1); };

  return (
    <div>
      <div className="page-header animate-fade-in">
        <div>
          <h1 className="page-title">Contestações</h1>
          <p className="page-subtitle">Gerencie disputas e chargebacks</p>
        </div>
      </div>

      <div className="kpi-row animate-fade-up" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {[
          { label: "Total de disputas", value: total,           sub: "este mês",          color: "var(--text-1)" },
          { label: "Em aberto",         value: abertas,         sub: "aguardando ação",   color: "var(--yellow)" },
          { label: "Valor em disputa",  value: fmt(valorTotal), sub: "soma das disputas", color: "var(--red)"    },
        ].map((k) => (
          <div key={k.label} className="kpi-card">
            <span className="kpi-label">{k.label}</span>
            <p className="kpi-value" style={{ color: k.color }}>{k.value}</p>
            <span className="kpi-sublabel">{k.sub}</span>
          </div>
        ))}
      </div>

      <div className="card animate-fade-up">
        <div className="card-head">
          <p className="card-title">Disputas</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["todos", "aberta", "analise", "ganha", "perdida"].map((s) => (
              <button key={s}
                className={`btn btn-xs${filtro === s ? " btn-primary" : " btn-ghost"}`}
                onClick={() => onFiltro(s)}>
                {s === "todos" ? "Todos" : s === "analise" ? "Em análise" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>ID</th>
                <th>Transação</th>
                <th>Cliente</th>
                <th>Valor</th>
                <th>Motivo</th>
                <th>Status</th>
                <th>Prazo</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {lista.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "28px", color: "var(--text-3)" }}>
                    Nenhuma contestação encontrada.
                  </td>
                </tr>
              ) : lista.map((c) => {
                const st = STATUS[c.status];
                const Icon = st.icon;
                return (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600, color: "var(--text-1)", fontFamily: "monospace", fontSize: 12 }}>{c.id}</td>
                    <td style={{ color: "var(--text-3)", fontSize: 12 }}>{c.txn}</td>
                    <td style={{ fontWeight: 500, color: "var(--text-1)" }}>{c.cliente}</td>
                    <td style={{ fontWeight: 700, color: "var(--red)" }}>{fmt(c.valor)}</td>
                    <td style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.motivo}</td>
                    <td><span className={`badge ${st.cls}`}><Icon size={11} />{st.label}</span></td>
                    <td style={{ color: "var(--text-3)", fontSize: 12 }}>{c.prazo}</td>
                    <td>
                      <button className="btn btn-ghost btn-icon btn-xs" title="Ações">
                        <MoreHorizontal size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <Paginacao total={filtrada.length} porPagina={PER_PAGE} pagina={paginaReal} onChange={setPagina} />
      </div>
    </div>
  );
}
