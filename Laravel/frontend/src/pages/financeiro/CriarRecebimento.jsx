import { useState, useRef, useEffect } from "react";
import {
  Plus, QrCode, Copy, Check, Link2, Banknote, Zap,
  Download, X, MoreHorizontal, Clock, CheckCircle2,
  XCircle, AlertCircle, ChevronLeft,
} from "lucide-react";
import { Paginacao } from "../../components/Paginacao";
import { gerarPaginas } from "../../utils/paginacao";
import { apiJson } from "../../api/client";
import { formatDateTimeBR } from "../../utils/date";

const STATUS_MAP = { PAID: "pago", PENDING: "pendente", CANCELLED: "cancelado", REVERSED: "expirado" };

const POR_PAGINA = 7;

/* ─── Formatação ─────────────────────────────────────────────── */
const fmt = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

function formatValorInput(raw) {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  return (parseInt(digits, 10) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ─── Tipo config ────────────────────────────────────────────── */
const TIPO_CFG = {
  pix:    { label: "Pix",    Icon: Zap,      color: "var(--accent)",  bg: "var(--accent-faint)"      },
  boleto: { label: "Boleto", Icon: Banknote, color: "var(--yellow)",  bg: "rgba(234,179,8,.10)"      },
  link:   { label: "Link",   Icon: Link2,    color: "var(--blue)",    bg: "rgba(59,130,246,.10)"     },
};

/* ─── Status config ──────────────────────────────────────────── */
const STATUS_CFG = {
  pago:      { label: "Pago",      Icon: CheckCircle2, cls: "badge-green"   },
  pendente:  { label: "Pendente",  Icon: Clock,        cls: "badge-yellow"  },
  expirado:  { label: "Expirado",  Icon: AlertCircle,  cls: "badge-neutral" },
  cancelado: { label: "Cancelado", Icon: XCircle,      cls: "badge-red"     },
};

/* ─── Badge tipo ─────────────────────────────────────────────── */
function TipoBadge({ tipo }) {
  const c = TIPO_CFG[tipo];
  if (!c) return null;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: c.bg, color: c.color,
      borderRadius: 6, padding: "2px 8px",
      fontSize: 11, fontWeight: 600,
    }}>
      <c.Icon size={10} />
      {c.label}
    </span>
  );
}

/* ─── Badge status ───────────────────────────────────────────── */
function StatusBadge({ status }) {
  const c = STATUS_CFG[status];
  if (!c) return null;
  return (
    <span className={`badge ${c.cls}`} style={{ gap: 4, fontSize: 11 }}>
      <c.Icon size={10} />
      {c.label}
    </span>
  );
}

/* ─── Menu 3 pontinhos ───────────────────────────────────────── */
function MenuAcoes({ cob, onVer }) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!aberto) return;
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setAberto(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [aberto]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        className="btn btn-ghost btn-icon btn-sm"
        onClick={() => setAberto((v) => !v)}
        style={{ width: 28, height: 28 }}
      >
        <MoreHorizontal size={14} />
      </button>
      {aberto && (
        <div style={{
          position: "absolute", right: 0, top: "calc(100% + 4px)", zIndex: 200,
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-sm)", boxShadow: "var(--shadow-md)",
          minWidth: 150, overflow: "hidden",
        }}>
          {(cob.tipo === "pix" || cob.tipo === "link") && (
            <button className="dropdown-item" onClick={() => { setAberto(false); onVer(cob); }}>
              <QrCode size={13} /> Ver QR / link
            </button>
          )}
          {cob.tipo === "boleto" && (
            <button className="dropdown-item" onClick={() => { setAberto(false); onVer(cob); }}>
              <Download size={13} /> Ver boleto
            </button>
          )}
          <button className="dropdown-item" onClick={() => { setAberto(false); }}>
            <Copy size={13} /> Copiar código
          </button>
          {cob.status === "pendente" && (
            <button className="dropdown-item" style={{ color: "var(--red)" }} onClick={() => setAberto(false)}>
              <XCircle size={13} /> Cancelar
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Modal Nova Cobrança ────────────────────────────────────── */
const MOCK_LINK   = "https://pay.gatewayjj.com/c/x7k2m9";
const MOCK_CODIGO = "34191.09008 61207.727285 61380.550003 3 94650000025000";

function ModalNovaCobranca({ onClose, onCriada }) {
  const [etapa, setEtapa] = useState("tipo");
  const [tipo, setTipo] = useState(null);
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [vencimento, setVencimento] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resultadoPix, setResultadoPix] = useState(null);

  const valorNum = parseFloat(valor.replace(/\./g, "").replace(",", ".")) || 0;
  const podeGerarPix = valorNum > 0 && nome.trim() && cpf.replace(/\D/g, "").length >= 11;
  const podeGerar = valorNum > 0 && (tipo !== "pix" ? (tipo !== "boleto" || vencimento) : podeGerarPix);

  const selecionar = (t) => { setTipo(t); setEtapa("form"); setError(""); };

  const gerar = async (e) => {
    e.preventDefault();
    if (!podeGerar) return;
    if (tipo === "pix") {
      setLoading(true);
      setError("");
      try {
        const res = await apiJson("/pix/cashin", {
          method: "POST",
          body: JSON.stringify({
            nome: nome.trim(),
            cpf: cpf.replace(/\D/g, ""),
            valor: valorNum,
            descricao: descricao || undefined,
          }),
        });
        setResultadoPix(res);
        setEtapa("resultado");
        onCriada?.(res);
      } catch (err) {
        setError(err?.data?.message || err?.message || "Falha ao gerar cobrança.");
      } finally {
        setLoading(false);
      }
    } else {
      setEtapa("resultado");
      onCriada?.({ tipo, valor: valorNum, desc: descricao });
    }
  };

  const copiar = () => { setCopiado(true); setTimeout(() => setCopiado(false), 2000); };

  const cfg = tipo ? TIPO_CFG[tipo] : null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-box"
        style={{ maxWidth: 420 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="modal-head">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {etapa === "form" && (
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setEtapa("tipo")} style={{ width: 26, height: 26 }}>
                <ChevronLeft size={14} />
              </button>
            )}
            <div>
              <p className="modal-titulo">
                {etapa === "tipo"      && "Nova cobrança"}
                {etapa === "form"      && cfg && `Cobrança via ${cfg.label}`}
                {etapa === "resultado" && "Cobrança gerada"}
              </p>
              <p className="modal-subtitulo">
                {etapa === "tipo"      && "Escolha a forma de pagamento"}
                {etapa === "form"      && "Preencha os dados da cobrança"}
                {etapa === "resultado" && "Compartilhe com o pagador"}
              </p>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Etapa 1 — Escolher tipo */}
        {etapa === "tipo" && (
          <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Object.entries(TIPO_CFG).map(([id, c]) => (
              <button
                key={id}
                onClick={() => selecionar(id)}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "14px 16px", textAlign: "left",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--surface)",
                  cursor: "pointer", transition: "border-color var(--dur)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = c.color; e.currentTarget.style.background = c.bg; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--surface)"; }}
              >
                <div style={{ width: 36, height: 36, borderRadius: "var(--radius-sm)", background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <c.Icon size={16} style={{ color: c.color }} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>{c.label}</p>
                  <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 1 }}>
                    {id === "pix"    && "Pagamento instantâneo com QR Code"}
                    {id === "boleto" && "Boleto bancário com data de vencimento"}
                    {id === "link"   && "Link de pagamento compartilhável"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Etapa 2 — Formulário */}
        {etapa === "form" && (
          <form onSubmit={gerar}>
            <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {tipo === "pix" && (
                <>
                  <div>
                    <label className="form-label">Nome do pagador</label>
                    <input className="form-input" placeholder="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} required />
                  </div>
                  <div>
                    <label className="form-label">CPF do pagador</label>
                    <input className="form-input" placeholder="000.000.000-00" value={cpf} onChange={(e) => setCpf(e.target.value.replace(/\D/g, "").slice(0, 11).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4"))} required />
                  </div>
                </>
              )}
              <div>
                <label className="form-label">Valor</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, fontWeight: 600, color: "var(--text-3)" }}>R$</span>
                  <input
                    className="form-input"
                    placeholder="0,00"
                    value={valor}
                    onChange={(e) => setValor(formatValorInput(e.target.value))}
                    style={{ paddingLeft: 36, fontSize: 15, fontWeight: 600 }}
                    autoFocus={tipo !== "pix"}
                  />
                </div>
              </div>
              <div>
                <label className="form-label">
                  Descrição <span style={{ color: "var(--text-3)", fontWeight: 400 }}>(opcional)</span>
                </label>
                <input
                  className="form-input"
                  placeholder="Ex: Pedido #1234"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                />
              </div>
              {tipo === "boleto" && (
                <div>
                  <label className="form-label">Data de vencimento</label>
                  <input
                    className="form-input"
                    type="date"
                    value={vencimento}
                    onChange={(e) => setVencimento(e.target.value)}
                  />
                </div>
              )}
            </div>
            {error && <p className="field-error" style={{ marginTop: 0 }}>{error}</p>}
            <div className="modal-footer">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEtapa("tipo")}>Voltar</button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={!podeGerar || loading} style={{ gap: 6 }}>
                {loading ? <><Loader2 size={13} className="spin" /> Gerando...</> : <><QrCode size={13} /> Gerar cobrança</>}
              </button>
            </div>
          </form>
        )}

        {/* Etapa 3 — Resultado */}
        {etapa === "resultado" && cfg && (
          <>
            <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Valor + tipo */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "var(--surface-2)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-2)" }}>
                <div>
                  <p style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 2 }}>Valor</p>
                  <p style={{ fontSize: 20, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.5px" }}>{fmt(valorNum)}</p>
                  {descricao && <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{descricao}</p>}
                </div>
                <TipoBadge tipo={tipo} />
              </div>

              {/* QR Code (pix / link) */}
              {(tipo === "pix" || tipo === "link") && (
                <div style={{ display: "flex", justifyContent: "center", padding: "16px 0 8px" }}>
                  <div style={{ width: 140, height: 140, background: "var(--surface-2)", border: "1px solid var(--border-2)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    {tipo === "pix" && resultadoPix?.qr_code ? (
                      <img src={resultadoPix.qr_code} alt="QR Code Pix" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    ) : (
                      <QrCode size={64} style={{ opacity: 0.2 }} />
                    )}
                  </div>
                </div>
              )}

              {/* Link */}
              {tipo === "link" && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--surface-2)", border: "1px solid var(--border-2)", borderRadius: "var(--radius-sm)", padding: "8px 10px" }}>
                  <Link2 size={12} style={{ color: "var(--text-3)", flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "var(--text-2)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{MOCK_LINK}</span>
                  <button className="btn btn-ghost btn-xs btn-icon" onClick={copiar}>
                    {copiado ? <Check size={12} style={{ color: "var(--green)" }} /> : <Copy size={12} />}
                  </button>
                </div>
              )}

              {/* Código Pix */}
              {tipo === "pix" && (resultadoPix?.qr_code_text || MOCK_CODIGO) && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <p style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".04em" }}>Código Pix copia e cola</p>
                  <p style={{ fontFamily: "monospace", fontSize: 10.5, color: "var(--text-2)", background: "var(--surface-2)", border: "1px solid var(--border-2)", borderRadius: "var(--radius-sm)", padding: "8px 10px", wordBreak: "break-all", lineHeight: 1.6 }}>{(resultadoPix && resultadoPix.qr_code_text) || MOCK_CODIGO}</p>
                  <button type="button" className="btn btn-ghost btn-sm" style={{ width: "100%", justifyContent: "center", gap: 6 }} onClick={() => { navigator.clipboard.writeText((resultadoPix && resultadoPix.qr_code_text) || MOCK_CODIGO); setCopiado(true); setTimeout(() => setCopiado(false), 2000); }}>
                    {copiado ? <><Check size={12} style={{ color: "var(--green)" }} /> Copiado!</> : <><Copy size={12} /> Copiar código Pix</>}
                  </button>
                </div>
              )}

              {/* Boleto */}
              {tipo === "boleto" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <p style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".04em" }}>Linha digitável</p>
                  <p style={{ fontFamily: "monospace", fontSize: 10.5, color: "var(--text-2)", background: "var(--surface-2)", border: "1px solid var(--border-2)", borderRadius: "var(--radius-sm)", padding: "8px 10px", wordBreak: "break-all", lineHeight: 1.6 }}>{MOCK_CODIGO}</p>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: "center", gap: 5 }} onClick={copiar}>
                      {copiado ? <><Check size={12} style={{ color: "var(--green)" }} /> Copiado!</> : <><Copy size={12} /> Copiar</>}
                    </button>
                    <button className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: "center", gap: 5 }}>
                      <Download size={12} /> Baixar PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost btn-sm" onClick={onClose}>Fechar</button>
              <button className="btn btn-primary btn-sm" style={{ gap: 6 }} onClick={() => { setEtapa("tipo"); setTipo(null); setValor(""); setDescricao(""); setVencimento(""); setNome(""); setCpf(""); setResultadoPix(null); }}>
                <Plus size={13} /> Nova cobrança
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Página principal ───────────────────────────────────────── */
function mapTxToCob(tx) {
  return {
    id: String(tx.id),
    tipo: "pix",
    valor: parseFloat(tx.amount) || 0,
    desc: tx.descricao || tx.nome || "",
    status: STATUS_MAP[tx.status] || "pendente",
    criado: formatDateTimeBR(tx.created_at),
  };
}

export function CriarRecebimento() {
  const [cobracas, setCobracas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [pagina, setPagina] = useState(1);

  const loadTransactions = () => {
    setLoading(true);
    apiJson("/transactions?type=DEPOSIT")
      .then((r) => {
        const data = Array.isArray(r?.data) ? r.data : [];
        setCobracas(data.map(mapTxToCob));
      })
      .catch(() => setCobracas([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => loadTransactions(), []);

  const total = cobracas.length;
  const inicio = (pagina - 1) * POR_PAGINA;
  const paginas = gerarPaginas(pagina, Math.ceil(total / POR_PAGINA));
  const lista = cobracas.slice(inicio, inicio + POR_PAGINA);

  const handleCriada = (res) => {
    if (res && res.id) setCobracas((prev) => [mapTxToCob(res), ...prev]);
    else if (res?.tipo) setCobracas((prev) => [{ id: `mock-${Date.now()}`, tipo: res.tipo, valor: res.valor, desc: res.desc || "", status: "pendente", criado: formatDateTimeBR(new Date().toISOString()) }, ...prev]);
    setPagina(1);
  };

  const totalValor = cobracas.reduce((a, c) => a + c.valor, 0);
  const totalPago = cobracas.filter((c) => c.status === "pago").reduce((a, c) => a + c.valor, 0);
  const totalPendente = cobracas.filter((c) => c.status === "pendente").reduce((a, c) => a + c.valor, 0);

  return (
    <div>
      <div className="page-header animate-fade-in">
        <div>
          <h1 className="page-title">Cobranças</h1>
          <p className="page-subtitle">Gerencie cobranças, QR Codes Pix e links de pagamento</p>
        </div>
        <button className="btn btn-primary" style={{ gap: 6 }} onClick={() => setModalAberto(true)}>
          <Plus size={14} /> Nova cobrança
        </button>
      </div>

      {/* KPIs */}
      <div className="kpi-row animate-fade-up" style={{ marginBottom: 14 }}>
        {[
          { label: "Total gerado",   valor: totalValor,    sub: `${cobracas.length} cobranças` },
          { label: "Total recebido", valor: totalPago,     sub: `${cobracas.filter((c) => c.status === "pago").length} pagas` },
          { label: "Aguardando",     valor: totalPendente, sub: `${cobracas.filter((c) => c.status === "pendente").length} pendentes` },
        ].map((k) => (
          <div key={k.label} className="kpi-card">
            <p className="kpi-label">{k.label}</p>
            <p className="kpi-value">{fmt(k.valor)}</p>
            <p className="kpi-qty-row" style={{ color: "var(--text-3)", fontSize: 11, marginTop: 4 }}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabela */}
      <div className="card animate-fade-up" style={{ overflow: "hidden" }}>
        <div className="card-head">
          <p className="card-title">Cobranças geradas</p>
          <span style={{ fontSize: 11, color: "var(--text-3)" }}>{total} registros</span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-2)" }}>
                {["Referência", "Tipo", "Valor", "Descrição", "Status", "Criado em", ""].map((h) => (
                  <th key={h} style={{
                    padding: "9px 16px", textAlign: "left",
                    fontSize: 10, fontWeight: 700, color: "var(--text-3)",
                    textTransform: "uppercase", letterSpacing: ".05em",
                    whiteSpace: "nowrap",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: "32px 16px", textAlign: "center", color: "var(--text-3)", fontSize: 13 }}>Carregando...</td>
                </tr>
              ) : lista.map((c, i) => (
                <tr key={c.id} style={{ borderBottom: i < lista.length - 1 ? "1px solid var(--border-2)" : "none", transition: "background var(--dur)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-2)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  <td style={{ padding: "11px 16px", width: 110 }}>
                    <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text-3)", fontWeight: 600 }}>{c.id}</span>
                  </td>
                  <td style={{ padding: "11px 16px", width: 90 }}>
                    <TipoBadge tipo={c.tipo} />
                  </td>
                  <td style={{ padding: "11px 16px", width: 120 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)" }}>{fmt(c.valor)}</span>
                  </td>
                  <td style={{ padding: "11px 16px" }}>
                    <span style={{ fontSize: 12, color: c.desc ? "var(--text-2)" : "var(--text-3)" }}>
                      {c.desc || "—"}
                    </span>
                  </td>
                  <td style={{ padding: "11px 16px", width: 110 }}>
                    <StatusBadge status={c.status} />
                  </td>
                  <td style={{ padding: "11px 16px", width: 140 }}>
                    <span style={{ fontSize: 12, color: "var(--text-3)", whiteSpace: "nowrap" }}>{c.criado}</span>
                  </td>
                  <td style={{ padding: "11px 12px 11px 4px", width: 40, textAlign: "right" }}>
                    <MenuAcoes cob={c} onVer={() => {}} />
                  </td>
                </tr>
              ))}

              {lista.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: "32px 16px", textAlign: "center", color: "var(--text-3)", fontSize: 13 }}>
                    Nenhuma cobrança gerada ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {total > POR_PAGINA && (
          <div style={{ borderTop: "1px solid var(--border-2)", padding: "12px 16px" }}>
            <Paginacao
              paginas={paginas}
              paginaAtual={pagina}
              onMudar={setPagina}
            />
          </div>
        )}
      </div>

      {/* Modal */}
      {modalAberto && (
        <ModalNovaCobranca
          onClose={() => setModalAberto(false)}
          onCriada={handleCriada}
        />
      )}
    </div>
  );
}
