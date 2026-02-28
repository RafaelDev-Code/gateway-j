import { useState, useEffect, useRef } from "react";
import {
  CheckCircle2, Clock, XCircle, RotateCcw, MoreHorizontal,
  Search, FileText, Download, X,
} from "lucide-react";
import { Paginacao } from "../../components/Paginacao";
import logoImg from "../../assets/logo.webp";
import { apiJson } from "../../api/client";
import { formatDateTimeBR } from "../../utils/date";

/* Mapeia status da API para o usado na UI */
const API_STATUS_MAP = { PAID: "aprovado", PENDING: "pendente", CANCELLED: "falhou", REVERSED: "estornado" };
function mapApiTxToRow(api) {
  const status = API_STATUS_MAP[api.status] ?? "pendente";
  const data = formatDateTimeBR(api.created_at);
  return {
    id: String(api.id),
    tipo: api.type_label ?? api.type ?? "—",
    cliente: api.nome ?? api.descricao ?? "—",
    valor: parseFloat(api.amount) || 0,
    status,
    data,
    nome: api.nome,
    descricao: api.descricao,
    created_at: api.created_at,
    pagador: { nome: api.nome ?? "—", cpfCnpj: "—", telegram: "—" },
    recebedor: { nome: "—", cpfCnpj: "—", instituicao: "—", chavePix: "—" },
    autenticacao: String(api.id),
    identificacao: api.id ?? "—",
    geradoEm: data,
  };
}

const STATUS = {
  aprovado:  { label: "Aprovado",  cls: "badge-green",  icon: CheckCircle2 },
  pendente:  { label: "Pendente",  cls: "badge-yellow", icon: Clock        },
  falhou:    { label: "Falhou",    cls: "badge-red",    icon: XCircle      },
  estornado: { label: "Estornado", cls: "badge-blue",   icon: RotateCcw    },
};

const fmt = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
const PER_PAGE = 50;

/* ─── Gera o HTML do comprovante para impressão/PDF ─────────── */
function gerarHTMLComprovante(tx) {
  const stMap = { aprovado: ["#d1fae5","#065f46"], pendente: ["#fef9c3","#92400e"], falhou: ["#fee2e2","#991b1b"], estornado: ["#dbeafe","#1e40af"] };
  const [stBg, stFg] = stMap[tx.status] ?? stMap.pendente;
  const stLabel = STATUS[tx.status]?.label ?? tx.status;

  const row = (l, v) => v ? `<div class="row"><span class="lbl">${l}</span><span class="val">${v}</span></div>` : "";
  const sep = `<div class="sep"></div>`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <title>Comprovante ${tx.id}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif;background:#f1f5f9;display:flex;justify-content:center;align-items:flex-start;padding:40px 16px;min-height:100vh}
    .page{background:#fff;width:100%;max-width:420px;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08),0 8px 32px rgba(0,0,0,.06)}
    .head{padding:24px 26px 22px;border-bottom:1px solid #f1f5f9}
    .brand{display:flex;align-items:center;gap:8px;margin-bottom:18px}
    .brand-logo{width:20px;height:20px;border-radius:5px;background:#0f172a;display:flex;align-items:center;justify-content:center}
    .brand-name{font-size:12px;font-weight:700;color:#0f172a;letter-spacing:-.2px}
    .brand-sep{width:1px;height:12px;background:#e2e8f0}
    .brand-tipo{font-size:11px;color:#94a3b8;font-weight:500}
    .valor{font-size:30px;font-weight:800;color:#0f172a;letter-spacing:-1px;line-height:1;margin-bottom:10px}
    .status{display:inline-flex;align-items:center;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:700;background:${stBg};color:${stFg}}
    .dt-row{display:flex;justify-content:space-between;align-items:center;padding:10px 26px;background:#fafafa;border-bottom:1px solid #f1f5f9}
    .dt-lbl{font-size:11px;color:#94a3b8}
    .dt-val{font-size:12px;font-weight:600;color:#374151}
    .body{padding:4px 26px}
    .sec-title{font-size:10px;font-weight:700;color:#cbd5e1;text-transform:uppercase;letter-spacing:.08em;padding:14px 0 6px}
    .row{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;padding:5px 0}
    .lbl{font-size:12px;color:#9ca3af;flex-shrink:0}
    .val{font-size:12px;font-weight:500;color:#111827;text-align:right;word-break:break-all;max-width:65%}
    .sep{height:1px;background:#f3f4f6;margin:4px 0}
    .hash-block{margin:6px 0 10px}
    .hash-lbl{font-size:10px;color:#9ca3af;margin-bottom:3px;text-transform:uppercase;letter-spacing:.04em}
    .hash-val{font-family:'Courier New',monospace;font-size:10px;color:#475569;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:7px 10px;word-break:break-all;line-height:1.7}
    .foot{padding:14px 26px 20px;border-top:1px solid #f1f5f9;text-align:center}
    .foot-txt{font-size:10px;color:#cbd5e1}
    @media print{body{background:#fff;padding:0}.page{box-shadow:none;border-radius:0;max-width:100%}}
  </style>
</head>
<body>
<div class="page">
  <div class="head">
    <div class="brand">
      <div class="brand-logo"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#fff" stroke-width="2"/><path d="M8 12h8M12 8v8" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg></div>
      <span class="brand-name">Gateway JJ</span>
      <span class="brand-sep"></span>
      <span class="brand-tipo">Comprovante ${tx.tipo}</span>
    </div>
    <p class="valor">${fmt(tx.valor)}</p>
    <span class="status">${stLabel}</span>
  </div>

  <div class="dt-row">
    <span class="dt-lbl">Pagamento realizado</span>
    <span class="dt-val">${tx.data}</span>
  </div>

  <div class="body">
    <p class="sec-title">Quem pagou</p>
    ${row("Nome", tx.pagador.nome)}
    ${tx.pagador.telegram !== "—" ? row("Telegram", tx.pagador.telegram) : ""}
    ${row("CPF/CNPJ", tx.pagador.cpfCnpj)}
    ${sep}
    <p class="sec-title">Quem recebeu</p>
    ${row("Nome", tx.recebedor.nome)}
    ${row("CPF/CNPJ", tx.recebedor.cpfCnpj)}
    ${row("Instituição", tx.recebedor.instituicao)}
    ${tx.recebedor.chavePix !== "—" ? row("Chave Pix", tx.recebedor.chavePix) : ""}
    ${sep}
    <p class="sec-title">Autenticação</p>
    <div class="hash-block"><p class="hash-lbl">Autenticação</p><p class="hash-val">${tx.autenticacao}</p></div>
    <div class="hash-block"><p class="hash-lbl">Identificação</p><p class="hash-val">${tx.identificacao}</p></div>
  </div>

  <div class="foot">
    <p class="foot-txt">Recibo gerado às ${tx.geradoEm} &nbsp;·&nbsp; Gateway JJ</p>
  </div>
</div>
</body>
</html>`;
}

/* ─── Paleta fixa (branca) — independente do tema ── */
const R = {
  bg:      "#ffffff",
  surf:    "#fafafa",
  border:  "#f1f5f9",
  border2: "#e2e8f0",
  t1:      "#0f172a",
  t2:      "#374151",
  t3:      "#9ca3af",
  t4:      "#cbd5e1",
};

const statusReceipt = {
  aprovado:  { label: "Aprovado",  bg: "#d1fae5", color: "#065f46" },
  pendente:  { label: "Pendente",  bg: "#fef9c3", color: "#92400e" },
  falhou:    { label: "Falhou",    bg: "#fee2e2", color: "#991b1b" },
  estornado: { label: "Estornado", bg: "#dbeafe", color: "#1e40af" },
};

function RRow({ label, value, mono = false }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, padding: "5px 0" }}>
      <span style={{ fontSize: 12, color: R.t3, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 500, color: R.t1, textAlign: "right", wordBreak: "break-all", maxWidth: "62%", fontFamily: mono ? "'Courier New',monospace" : undefined }}>{value}</span>
    </div>
  );
}

function RSep() {
  return <div style={{ height: 1, background: R.border, margin: "4px 0" }} />;
}

function RSecLabel({ label }) {
  return <p style={{ fontSize: 10, fontWeight: 700, color: R.t4, textTransform: "uppercase", letterSpacing: ".08em", padding: "12px 0 5px" }}>{label}</p>;
}

/* ─── Modal comprovante ─────────────────────────────────────── */
function ModalComprovante({ tx, onClose }) {
  const baixar = () => {
    const html = gerarHTMLComprovante(tx);
    const win  = window.open("", "_blank", "width=500,height=760");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 500);
  };

  const st = statusReceipt[tx.status] ?? statusReceipt.pendente;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: R.bg,
          borderRadius: 14,
          width: "100%", maxWidth: 400,
          boxShadow: "0 20px 60px rgba(0,0,0,.16), 0 0 0 1px rgba(0,0,0,.05)",
          display: "flex", flexDirection: "column",
          maxHeight: "90vh", overflow: "hidden",
          animation: "fadeUp 200ms ease both",
          color: R.t1,
        }}
      >
        {/* ── Cabeçalho limpo ── */}
        <div style={{ padding: "20px 22px 18px", borderBottom: `1px solid ${R.border}`, position: "relative" }}>
          <button onClick={onClose} style={{
            position: "absolute", top: 14, right: 14,
            width: 26, height: 26, borderRadius: "50%",
            background: R.surf, border: `1px solid ${R.border2}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: R.t3,
          }}>
            <X size={12} />
          </button>

          {/* marca + tipo */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <img src={logoImg} alt="Gateway JJ" style={{ height: 18, objectFit: "contain" }} />
            <span style={{ width: 1, height: 12, background: R.border2, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: R.t3, fontWeight: 500 }}>Comprovante {tx.tipo}</span>
          </div>

          {/* valor */}
          <p style={{ fontSize: 30, fontWeight: 800, color: R.t1, letterSpacing: "-1px", lineHeight: 1, marginBottom: 10 }}>
            {fmt(tx.valor)}
          </p>

          {/* status + ID */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{
              display: "inline-flex", alignItems: "center",
              background: st.bg, color: st.color,
              borderRadius: 999, padding: "3px 10px",
              fontSize: 11, fontWeight: 700,
            }}>
              {st.label}
            </span>
            <span style={{ fontSize: 10, fontFamily: "'Courier New',monospace", color: R.t4 }}>{tx.id}</span>
          </div>
        </div>

        {/* ── Faixa data ── */}
        <div style={{
          background: R.surf, borderBottom: `1px solid ${R.border}`,
          padding: "9px 22px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontSize: 11, color: R.t3 }}>Pagamento realizado</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: R.t2 }}>{tx.data}</span>
        </div>

        {/* ── Corpo ── */}
        <div style={{ overflowY: "auto", flex: 1, padding: "0 22px 4px" }}>

          <RSecLabel label="Quem pagou" />
          <RRow label="Nome"     value={tx.pagador.nome}    />
          {tx.pagador.telegram !== "—" && <RRow label="Telegram" value={tx.pagador.telegram} />}
          <RRow label="CPF/CNPJ" value={tx.pagador.cpfCnpj} />

          <RSep />

          <RSecLabel label="Quem recebeu" />
          <RRow label="Nome"        value={tx.recebedor.nome}        />
          <RRow label="CPF/CNPJ"    value={tx.recebedor.cpfCnpj}     />
          <RRow label="Instituição" value={tx.recebedor.instituicao} />
          {tx.recebedor.chavePix !== "—" && <RRow label="Chave Pix" value={tx.recebedor.chavePix} />}

          <RSep />

          <RSecLabel label="Autenticação" />
          {[
            { l: "Autenticação",  v: tx.autenticacao  },
            { l: "Identificação", v: tx.identificacao  },
          ].map(({ l, v }) => (
            <div key={l} style={{ marginBottom: 8 }}>
              <p style={{ fontSize: 10, color: R.t4, marginBottom: 3, textTransform: "uppercase", letterSpacing: ".04em" }}>{l}</p>
              <p style={{
                fontFamily: "'Courier New',monospace", fontSize: 10, color: R.t2,
                background: R.surf, border: `1px solid ${R.border2}`,
                borderRadius: 6, padding: "7px 10px",
                wordBreak: "break-all", lineHeight: 1.7,
              }}>{v}</p>
            </div>
          ))}

          <div style={{ height: 10 }} />
        </div>

        {/* ── Rodapé ── */}
        <div style={{
          background: R.surf, borderTop: `1px solid ${R.border}`,
          padding: "11px 22px 16px",
        }}>
          <p style={{ fontSize: 10, color: R.t4, textAlign: "center", marginBottom: 11 }}>
            Recibo gerado às {tx.geradoEm}
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onClose} style={{
              flex: 1, height: 38, borderRadius: 8,
              border: `1px solid ${R.border2}`, background: R.bg,
              color: R.t2, fontSize: 13, fontWeight: 500,
              cursor: "pointer",
            }}>
              Fechar
            </button>
            <button onClick={baixar} style={{
              flex: 1, height: 38, borderRadius: 8,
              border: "none", background: "#0f172a",
              color: "#fff", fontSize: 13, fontWeight: 600,
              cursor: "pointer", display: "flex", alignItems: "center",
              justifyContent: "center", gap: 6,
            }}>
              <Download size={13} /> Baixar PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Menu de ações (3 pontinhos) ───────────────────────────── */
function MenuAcoes({ tx, onComprovante }) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!aberto) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setAberto(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [aberto]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button className="btn btn-ghost btn-icon btn-xs" onClick={() => setAberto((v) => !v)} title="Ações">
        <MoreHorizontal size={14} />
      </button>
      {aberto && (
        <div style={{
          position: "absolute", right: 0, top: "calc(100% + 4px)", zIndex: 200,
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-sm)", boxShadow: "0 8px 24px rgba(0,0,0,.12)",
          padding: 4, minWidth: 150,
          animation: "fadeUp 140ms ease both",
        }}>
          <button
            className="tb-dropdown-item"
            onClick={() => { setAberto(false); onComprovante(tx); }}
            style={{ fontSize: 13 }}
          >
            <FileText size={13} /> Comprovante
          </button>
        </div>
      )}
    </div>
  );
}

const STATUS_API_MAP = { todos: "", aprovado: "PAID", pendente: "PENDING", falhou: "CANCELLED", estornado: "REVERSED" };

/* ─── Página principal ──────────────────────────────────────── */
export function Transacoes() {
  const [q, setQ] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [pagina, setPagina] = useState(1);
  const [txComprovante, setTxComprovante] = useState(null);
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const statusParam = STATUS_API_MAP[filtroStatus] || "";
    const url = statusParam ? `/transactions?page=${pagina}&status=${statusParam}` : `/transactions?page=${pagina}`;
    setLoading(true);
    apiJson(url)
      .then((r) => {
        const data = Array.isArray(r?.data) ? r.data : r?.data ?? [];
        setList(data.map(mapApiTxToRow));
        setTotal(r?.meta?.total ?? data.length);
        setLastPage(r?.meta?.last_page ?? 1);
      })
      .catch(() => { setList([]); setTotal(0); setLastPage(1); })
      .finally(() => setLoading(false));
  }, [pagina, filtroStatus]);

  const filtrada = list.filter((tx) =>
    q === "" || tx.id.toLowerCase().includes(q.toLowerCase()) || (tx.cliente || "").toLowerCase().includes(q.toLowerCase())
  );
  const totalPags = Math.max(1, lastPage);
  const paginaReal = Math.min(pagina, totalPags);
  const lista = filtrada;

  const onFiltro = (s) => { setFiltroStatus(s); setPagina(1); };
  const onBusca = (v) => setQ(v);

  return (
    <div>
      <div className="page-header animate-fade-in">
        <div>
          <h1 className="page-title">Transações</h1>
          <p className="page-subtitle">Histórico completo de movimentações</p>
        </div>
      </div>

      <div className="card animate-fade-up">
        <div className="card-head">
          <p className="card-title">Todas as transações</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["todos", "aprovado", "pendente", "falhou", "estornado"].map((s) => (
              <button key={s}
                className={`btn btn-xs${filtroStatus === s ? " btn-primary" : " btn-ghost"}`}
                onClick={() => onFiltro(s)}>
                {s === "todos" ? "Todos" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border-2)" }}>
          <div className="form-icon-wrap" style={{ maxWidth: 300 }}>
            <Search size={14} className="form-icon" />
            <input className="form-input" placeholder="Buscar por ID ou cliente…"
              value={q} onChange={(e) => onBusca(e.target.value)} />
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="tbl" style={{ tableLayout: "fixed", width: "100%" }}>
            <colgroup>
              <col style={{ width: 130 }} />
              <col style={{ width: 80  }} />
              <col />                        {/* Cliente — flex */}
              <col style={{ width: 130 }} />
              <col style={{ width: 110 }} />
              <col style={{ width: 140 }} />
              <col style={{ width: 56  }} />
            </colgroup>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tipo</th>
                <th>Cliente</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Data</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "28px", color: "var(--text-3)" }}>
                    Carregando...
                  </td>
                </tr>
              ) : lista.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "28px", color: "var(--text-3)" }}>
                    Nenhuma transação encontrada.
                  </td>
                </tr>
              ) : lista.map((tx) => {
                const st = STATUS[tx.status] ?? STATUS.pendente;
                const Icon = st.icon;
                return (
                  <tr key={tx.id}>
                    <td style={{ fontWeight: 600, color: "var(--text-1)", fontFamily: "monospace", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tx.id}</td>
                    <td style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tx.tipo}</td>
                    <td style={{ color: "var(--text-1)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tx.cliente}</td>
                    <td style={{ fontWeight: 700, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fmt(tx.valor)}</td>
                    <td>
                      <span className={`badge ${st.cls}`}><Icon size={11} />{st.label}</span>
                    </td>
                    <td style={{ color: "var(--text-3)", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tx.data}</td>
                    <td style={{ paddingRight: 12, textAlign: "right" }}>
                      <MenuAcoes tx={tx} onComprovante={setTxComprovante} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <Paginacao total={total} porPagina={PER_PAGE} pagina={paginaReal} onChange={setPagina} />
      </div>

      {txComprovante && (
        <ModalComprovante tx={txComprovante} onClose={() => setTxComprovante(null)} />
      )}
    </div>
  );
}
