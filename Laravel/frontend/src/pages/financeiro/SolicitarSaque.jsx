import { useState, useEffect } from "react";
import {
  ArrowUpRight, Wallet, AlertCircle, CheckCircle2,
  Landmark, Info, Plus, X, Building2, Trash2, Loader2,
} from "lucide-react";
import { apiJson } from "../../api/client";
import { formatDateShort } from "../../utils/date";

/* ─── Estado inicial de contas ──────────────────────────────── */
const BANCOS_INIT = [
  { id: "itau",     nome: "Itaú Unibanco", agencia: "0001", conta: "12345-6", tipo: "Corrente" },
  { id: "bradesco", nome: "Bradesco",       agencia: "1234", conta: "98765-4", tipo: "Corrente" },
];

/* Histórico virá de GET /transactions?type=WITHDRAW */

const BANCOS_LISTA = [
  "Itaú Unibanco", "Bradesco", "Banco do Brasil", "Caixa Econômica Federal",
  "Santander", "Nubank", "Inter", "C6 Bank", "BTG Pactual", "XP Investimentos",
  "Sicoob", "Sicredi", "Outro",
];

const TAXA_SAQUE = 0;
const TAXA_PCT   = 0;

const fmt = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

function parseValor(raw) {
  return parseFloat(raw.replace(/\./g, "").replace(",", ".")) || 0;
}
function formatValor(raw) {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  const num = parseInt(digits, 10) / 100;
  if (num === 0) return "";
  return num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ─── Formatadores de chave PIX ─────────────────────────────── */
const PIX_TIPOS = [
  { id: "cpf",       label: "CPF",             placeholder: "000.000.000-00"         },
  { id: "cnpj",      label: "CNPJ",            placeholder: "00.000.000/0001-00"     },
  { id: "email",     label: "E-mail",          placeholder: "exemplo@email.com"       },
  { id: "telefone",  label: "Telefone",        placeholder: "(00) 90000-0000"        },
  { id: "aleatoria", label: "Chave aleatória", placeholder: "xxxxxxxx-xxxx-xxxx-..."  },
];

function formatarCPF(v) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, "$1.$2.$3-$4")
          .replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3")
          .replace(/(\d{3})(\d{1,3})/, "$1.$2");
}
function formatarCNPJ(v) {
  const d = v.replace(/\D/g, "").slice(0, 14);
  return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})/, "$1.$2.$3/$4-$5")
          .replace(/(\d{2})(\d{3})(\d{3})(\d{1,4})/, "$1.$2.$3/$4")
          .replace(/(\d{2})(\d{3})(\d{1,3})/, "$1.$2.$3")
          .replace(/(\d{2})(\d{1,3})/, "$1.$2");
}
function formatarTelefone(v) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2)  return `(${d}`;
  if (d.length <= 7)  return `(${d.slice(0,2)}) ${d.slice(2)}`;
  if (d.length <= 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  return d;
}

function formatarPixKey(tipo, raw) {
  if (tipo === "cpf")      return formatarCPF(raw);
  if (tipo === "cnpj")     return formatarCNPJ(raw);
  if (tipo === "telefone") return formatarTelefone(raw);
  return raw; // email e aleatória: livre
}

/* ─── Modal: Adicionar conta bancária ───────────────────────── */
function ModalConta({ onClose, onSalvar }) {
  const [form, setForm] = useState({
    banco: "", bancoOutro: "", agencia: "", conta: "", tipo: "Corrente",
    titular: "", cpfCnpj: "", pixTipo: "", pixKey: "",
  });
  const [erros, setErros] = useState({});

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handlePixTipo = (tipo) => setForm((f) => ({ ...f, pixTipo: tipo, pixKey: "" }));

  const handlePixKey = (e) => {
    const formatado = formatarPixKey(form.pixTipo, e.target.value);
    setForm((f) => ({ ...f, pixKey: formatado }));
  };

  const validar = () => {
    const e = {};
    if (!form.banco)                          e.banco    = "Selecione o banco";
    if (form.banco === "Outro" && !form.bancoOutro.trim()) e.bancoOutro = "Informe o nome do banco";
    if (!form.agencia)                        e.agencia  = "Informe a agência";
    if (!form.conta)                          e.conta    = "Informe a conta";
    if (!form.titular)                        e.titular  = "Informe o titular";
    if (!form.cpfCnpj)                        e.cpfCnpj  = "Informe o CPF ou CNPJ";
    if (!form.pixTipo)                        e.pixTipo  = "Selecione o tipo de chave";
    if (!form.pixKey.trim())                  e.pixKey   = "Informe a chave PIX";
    setErros(e);
    return Object.keys(e).length === 0;
  };

  const handleSalvar = () => {
    if (!validar()) return;
    const nomeExibido = form.banco === "Outro" ? form.bancoOutro.trim() : form.banco;
    onSalvar({ ...form, nome: nomeExibido, id: Date.now().toString() });
    onClose();
  };

  const pixInfo = PIX_TIPOS.find((p) => p.id === form.pixTipo);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <p className="modal-titulo">Adicionar conta bancária</p>
            <p className="modal-subtitulo">A conta deve estar no seu nome ou da sua empresa.</p>
          </div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><X size={15} /></button>
        </div>

        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Banco */}
          <div>
            <label className="form-label">Banco <span style={{ color: "var(--red)" }}>*</span></label>
            <select className={`form-input${erros.banco ? " input-error" : ""}`}
              value={form.banco} onChange={set("banco")} style={{ cursor: "pointer" }}>
              <option value="">Selecione o banco</option>
              {BANCOS_LISTA.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            {erros.banco && <p className="field-error">{erros.banco}</p>}
          </div>

          {/* Campo extra quando "Outro" */}
          {form.banco === "Outro" && (
            <div>
              <label className="form-label">Nome do banco <span style={{ color: "var(--red)" }}>*</span></label>
              <input
                className={`form-input${erros.bancoOutro ? " input-error" : ""}`}
                placeholder="Ex: Banco Inter, Nubank..."
                value={form.bancoOutro}
                onChange={set("bancoOutro")}
              />
              {erros.bancoOutro && <p className="field-error">{erros.bancoOutro}</p>}
            </div>
          )}

          {/* Agência + Conta */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label className="form-label">Agência <span style={{ color: "var(--red)" }}>*</span></label>
              <input className={`form-input${erros.agencia ? " input-error" : ""}`}
                placeholder="0000" value={form.agencia}
                onChange={(e) => setForm((f) => ({ ...f, agencia: e.target.value.replace(/\D/g, "").slice(0, 6) }))} />
              {erros.agencia && <p className="field-error">{erros.agencia}</p>}
            </div>
            <div>
              <label className="form-label">Conta <span style={{ color: "var(--red)" }}>*</span></label>
              <input className={`form-input${erros.conta ? " input-error" : ""}`}
                placeholder="00000-0" value={form.conta} onChange={set("conta")} />
              {erros.conta && <p className="field-error">{erros.conta}</p>}
            </div>
          </div>

          {/* Tipo de conta */}
          <div>
            <label className="form-label">Tipo de conta</label>
            <div style={{ display: "flex", gap: 8 }}>
              {["Corrente", "Poupança"].map((t) => (
                <label key={t} style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                  gap: 8, padding: "9px 12px", cursor: "pointer",
                  border: `1px solid ${form.tipo === t ? "var(--accent)" : "var(--border)"}`,
                  borderRadius: "var(--radius-sm)",
                  background: form.tipo === t ? "var(--accent-faint)" : "transparent",
                  transition: "all var(--dur)",
                }}>
                  <input type="radio" name="tipo" value={t} checked={form.tipo === t}
                    onChange={() => setForm((f) => ({ ...f, tipo: t }))}
                    style={{ accentColor: "var(--accent)" }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: form.tipo === t ? "var(--accent)" : "var(--text-1)" }}>{t}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Titular */}
          <div>
            <label className="form-label">Nome do titular <span style={{ color: "var(--red)" }}>*</span></label>
            <input className={`form-input${erros.titular ? " input-error" : ""}`}
              placeholder="Nome completo ou razão social"
              value={form.titular} onChange={set("titular")} />
            {erros.titular && <p className="field-error">{erros.titular}</p>}
          </div>

          {/* CPF/CNPJ */}
          <div>
            <label className="form-label">CPF / CNPJ do titular <span style={{ color: "var(--red)" }}>*</span></label>
            <input className={`form-input${erros.cpfCnpj ? " input-error" : ""}`}
              placeholder="000.000.000-00 ou 00.000.000/0001-00"
              value={form.cpfCnpj} onChange={set("cpfCnpj")} />
            {erros.cpfCnpj && <p className="field-error">{erros.cpfCnpj}</p>}
          </div>

          {/* Divisor */}
          <div style={{ borderTop: "1px solid var(--border-2)", paddingTop: 4 }}>
            <label className="form-label" style={{ marginBottom: 8 }}>
              Tipo de chave PIX <span style={{ color: "var(--red)" }}>*</span>
            </label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {PIX_TIPOS.map((p) => (
                <button key={p.id} type="button"
                  onClick={() => handlePixTipo(p.id)}
                  className={`btn btn-xs${form.pixTipo === p.id ? " btn-primary" : " btn-ghost"}`}
                  style={{ borderRadius: "var(--radius-sm)" }}>
                  {p.label}
                </button>
              ))}
            </div>
            {erros.pixTipo && <p className="field-error" style={{ marginTop: 6 }}>{erros.pixTipo}</p>}
          </div>

          {/* Chave PIX — aparece após selecionar tipo */}
          {form.pixTipo && (
            <div>
              <label className="form-label">
                Chave PIX — {pixInfo?.label} <span style={{ color: "var(--red)" }}>*</span>
              </label>
              <input
                className={`form-input${erros.pixKey ? " input-error" : ""}`}
                placeholder={pixInfo?.placeholder}
                value={form.pixKey}
                onChange={handlePixKey}
                inputMode={["cpf", "cnpj", "telefone"].includes(form.pixTipo) ? "numeric" : "text"}
              />
              {erros.pixKey && <p className="field-error">{erros.pixKey}</p>}
            </div>
          )}

        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary btn-sm" style={{ gap: 6 }} onClick={handleSalvar}>
            <CheckCircle2 size={13} /> Salvar conta
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Página principal ──────────────────────────────────────── */
export function SolicitarSaque() {
  const [valor, setValor] = useState("");
  const [pin, setPin] = useState("");
  const [banco, setBanco] = useState(BANCOS_INIT[0]?.id ?? "");
  const [bancos, setBancos] = useState(BANCOS_INIT);
  const [modalConta, setModalConta] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [saldoDisponivel, setSaldoDisponivel] = useState(0);
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saqueError, setSaqueError] = useState("");

  useEffect(() => {
    apiJson("/balance").then((r) => setSaldoDisponivel(parseFloat(r?.balance ?? r?.data?.balance ?? 0) || 0)).catch(() => {});
    apiJson("/transactions?type=WITHDRAW").then((r) => {
      const data = Array.isArray(r?.data) ? r.data : [];
      setHistorico(data.map((t) => ({ data: formatDateShort(t.created_at), valor: parseFloat(t.amount), status: "processado", banco: t.nome || "—" })));
    }).catch(() => setHistorico([]));
  }, []);

  const valorNum = parseValor(valor);
  const taxaValor = TAXA_PCT > 0 ? valorNum * TAXA_PCT : TAXA_SAQUE;
  const valorLiq = Math.max(0, valorNum - taxaValor);
  const saldoApos = saldoDisponivel - valorNum;
  const excede = valorNum > saldoDisponivel;
  const contaSelecionada = bancos.find((b) => b.id === banco);
  const invalido = valorNum <= 0 || excede || !pin || !contaSelecionada || !contaSelecionada.pixKey;

  const handleValor = (e) => {
    const f = formatValor(e.target.value);
    if (f && parseValor(f) > saldoDisponivel) return;
    setValor(f);
  };

  const taxaLabel = TAXA_PCT > 0
    ? `${(TAXA_PCT * 100).toFixed(1)}%`
    : TAXA_SAQUE > 0 ? fmt(TAXA_SAQUE) : "Isento";

  const adicionarConta = (novaConta) => {
    if (bancos.length >= 3) return;
    setBancos((prev) => [...prev, novaConta]);
    setBanco(novaConta.id);
  };

  const solicitarSaque = async () => {
    if (invalido || !contaSelecionada) return;
    setSaqueError("");
    setLoading(true);
    try {
      await apiJson("/pix/cashout", {
        method: "POST",
        body: JSON.stringify({
          nome: contaSelecionada.titular || contaSelecionada.nome,
          cpf: (contaSelecionada.cpfCnpj || "").replace(/\D/g, ""),
          key: contaSelecionada.pixKey || "",
          valor: valorNum,
          pin,
        }),
      });
      setValor("");
      setPin("");
      const bal = await apiJson("/balance");
      setSaldoDisponivel(parseFloat(bal?.balance ?? bal?.data?.balance ?? 0) || 0);
      const list = await apiJson("/transactions?type=WITHDRAW");
      const data = Array.isArray(list?.data) ? list.data : [];
      setHistorico(data.map((t) => ({ data: formatDateShort(t.created_at), valor: parseFloat(t.amount), status: "processado", banco: t.nome || "—" })));
    } catch (err) {
      setSaqueError(err?.data?.message || err?.message || "Falha ao solicitar saque.");
    } finally {
      setLoading(false);
    }
  };

  const excluirConta = (id) => {
    setBancos((prev) => prev.filter((b) => b.id !== id));
    if (banco === id) setBanco(bancos.find((b) => b.id !== id)?.id ?? "");
    setConfirmDelete(null);
  };

  return (
    <div>
      <div className="page-header animate-fade-in">
        <div>
          <h1 className="page-title">Solicitar Saque</h1>
          <p className="page-subtitle">Transfira seu saldo para a conta bancária</p>
        </div>
        <button className="btn btn-ghost btn-sm" style={{ gap: 6 }} onClick={() => setModalConta(true)}>
          <Plus size={14} /> Adicionar conta
        </button>
      </div>

      <div className="layout-2col stretch animate-fade-up">

        {/* Formulário */}
        <div className="card" style={{ display: "flex", flexDirection: "column" }}>
          <div className="card-head">
            <p className="card-title">Novo saque</p>
          </div>
          <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>

            {/* Saldo disponível + taxa */}
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              background: "var(--accent-faint)", border: "1px solid var(--accent)",
              borderRadius: "var(--radius-sm)", padding: "12px 14px",
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: "var(--radius-sm)",
                background: "var(--accent)", display: "flex", alignItems: "center",
                justifyContent: "center", flexShrink: 0,
              }}>
                <Wallet size={16} color="#fff" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Saldo disponível</p>
                <p style={{ fontSize: 20, fontWeight: 700, color: "var(--text-1)", marginTop: 1 }}>{fmt(saldoDisponivel)}</p>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <p style={{ fontSize: 11, color: "var(--text-3)" }}>Taxa de saque</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-2)", marginTop: 1 }}>{taxaLabel}</p>
              </div>
            </div>

            {/* Valor */}
            <div>
              <label className="form-label">Valor a sacar</label>
              <div style={{ position: "relative" }}>
                <span style={{
                  position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                  fontSize: 14, fontWeight: 600, color: "var(--text-3)",
                }}>R$</span>
                <input
                  className={`form-input${excede ? " input-error" : ""}`}
                  placeholder="0,00"
                  value={valor}
                  onChange={handleValor}
                  style={{ paddingLeft: 36, fontSize: 16, fontWeight: 700 }}
                />
              </div>
              {valorNum > 0 && !excede && (
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 6 }}>
                  <Info size={12} style={{ color: "var(--text-3)", flexShrink: 0 }} />
                  <p style={{ fontSize: 12, color: "var(--text-3)" }}>
                    Seu saldo ficará em{" "}
                    <strong style={{ color: "var(--text-2)" }}>{fmt(saldoApos)}</strong>
                    {taxaValor > 0 && <> · Você receberá <strong style={{ color: "var(--text-1)" }}>{fmt(valorLiq)}</strong></>}
                  </p>
                </div>
              )}
              {excede && (
                <p style={{ fontSize: 12, color: "var(--red)", marginTop: 5, display: "flex", alignItems: "center", gap: 4 }}>
                  <AlertCircle size={12} /> Valor superior ao saldo disponível.
                </p>
              )}
            </div>

            {/* Conta de destino */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <label className="form-label" style={{ margin: 0 }}>Conta de destino</label>
                {bancos.length < 3
                  ? <button className="btn btn-ghost btn-xs" style={{ gap: 4 }} onClick={() => setModalConta(true)}>
                      <Plus size={12} /> Nova conta
                    </button>
                  : <span style={{ fontSize: 11, color: "var(--text-3)" }}>Limite de 3 contas atingido</span>
                }
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {bancos.map((b) => (
                  <div key={b.id} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    <label style={{
                      display: "flex", alignItems: "center", gap: 12,
                      border: `1px solid ${confirmDelete === b.id ? "var(--red)" : banco === b.id ? "var(--accent)" : "var(--border)"}`,
                      borderRadius: confirmDelete === b.id ? "var(--radius-sm) var(--radius-sm) 0 0" : "var(--radius-sm)",
                      padding: "10px 12px",
                      cursor: "pointer",
                      background: confirmDelete === b.id ? "color-mix(in srgb, var(--red) 6%, transparent)" : banco === b.id ? "var(--accent-faint)" : "transparent",
                      transition: "all var(--dur)",
                    }}>
                      <input type="radio" name="banco" value={b.id} checked={banco === b.id}
                        onChange={() => { setBanco(b.id); setConfirmDelete(null); }}
                        style={{ accentColor: "var(--accent)", flexShrink: 0 }} />
                      <div style={{
                        width: 30, height: 30, borderRadius: "var(--radius-sm)",
                        background: "var(--surface-2)", border: "1px solid var(--border-2)",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        <Landmark size={14} style={{ color: "var(--text-3)" }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.nome}</p>
                        <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 1 }}>Ag. {b.agencia} · Conta {b.conta} · {b.tipo}</p>
                      </div>
                      {banco === b.id && confirmDelete !== b.id && (
                        <CheckCircle2 size={15} style={{ color: "var(--accent)", flexShrink: 0 }} />
                      )}
                      {/* Lixeira */}
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); setConfirmDelete(confirmDelete === b.id ? null : b.id); }}
                        style={{
                          flexShrink: 0, width: 28, height: 28, borderRadius: "var(--radius-sm)",
                          border: "none", background: "transparent", cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: confirmDelete === b.id ? "var(--red)" : "var(--text-3)",
                          transition: "color var(--dur)",
                        }}
                        title="Remover conta"
                      >
                        <Trash2 size={14} />
                      </button>
                    </label>

                    {/* Confirmação inline de exclusão */}
                    {confirmDelete === b.id && (
                      <div style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        gap: 10, padding: "8px 12px",
                        border: "1px solid var(--red)", borderTop: "none",
                        borderRadius: "0 0 var(--radius-sm) var(--radius-sm)",
                        background: "color-mix(in srgb, var(--red) 6%, transparent)",
                      }}>
                        <p style={{ fontSize: 12, color: "var(--red)", fontWeight: 500 }}>
                          Remover <strong>{b.nome}</strong>?
                        </p>
                        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                          <button
                            type="button"
                            className="btn btn-ghost btn-xs"
                            onClick={() => setConfirmDelete(null)}
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            className="btn btn-xs"
                            style={{ background: "var(--red)", color: "#fff", border: "none", gap: 4 }}
                            onClick={() => excluirConta(b.id)}
                          >
                            <Trash2 size={11} /> Remover
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {bancos.length === 0 && (
                  <button className="btn btn-ghost" style={{ border: "1px dashed var(--border)", borderRadius: "var(--radius-sm)", padding: "14px", width: "100%", gap: 8, color: "var(--text-3)" }}
                    onClick={() => setModalConta(true)}>
                    <Building2 size={15} /> Adicionar sua primeira conta bancária
                  </button>
                )}

                {bancos.length >= 3 && (
                  <p style={{ fontSize: 11, color: "var(--text-3)", textAlign: "center", padding: "4px 0" }}>
                    Máximo de 3 contas bancárias cadastradas.
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="form-label">PIN de segurança</label>
              <input className="form-input" type="password" inputMode="numeric" placeholder="••••" maxLength={10} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} style={{ maxWidth: 120 }} />
            </div>
            {saqueError && <p className="field-error">{saqueError}</p>}
            <div style={{ marginTop: "auto" }}>
              <button type="button" className="btn btn-primary"
                style={{ width: "100%", justifyContent: "center", gap: 6 }}
                disabled={invalido || !banco}
                onClick={solicitarSaque}>
                {loading ? <><Loader2 size={15} className="spin" /> Processando...</> : <><ArrowUpRight size={15} /> Solicitar saque</>}
              </button>
            </div>
          </div>
        </div>

        {/* Histórico */}
        <div className="card" style={{ display: "flex", flexDirection: "column" }}>
          <div className="card-head">
            <p className="card-title">Histórico de saques</p>
          </div>
          <div style={{ flex: 1 }}>
            {historico.length === 0 ? (
              <p style={{ padding: "20px", textAlign: "center", color: "var(--text-3)", fontSize: 13 }}>Sem saques anteriores.</p>
            ) : historico.map((h, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "11px 16px",
                borderBottom: i < HISTORICO.length - 1 ? "1px solid var(--border-2)" : "none",
              }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)" }}>{fmt(h.valor)}</p>
                  <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 1 }}>{h.banco}</p>
                  <p style={{ fontSize: 11, color: "var(--text-3)" }}>{h.data}</p>
                </div>
                <span className="badge badge-green"><CheckCircle2 size={11} /> {h.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {modalConta && (
        <ModalConta onClose={() => setModalConta(false)} onSalvar={adicionarConta} />
      )}
    </div>
  );
}
