import { useState, useEffect, useRef } from "react";
import {
  CheckCircle2, Clock, XCircle, RotateCcw, MoreHorizontal,
  Search, FileText, Download, X,
} from "lucide-react";
import { Paginacao } from "../../components/Paginacao";
import logoImg from "../../assets/logo.webp";

/* ─── Dados de transações ───────────────────────────────────── */
const TXS = [
  {
    id: "TXN-8821", tipo: "Pix",    cliente: "Loja ABC",     valor: 1_240.00, status: "aprovado",
    data: "26/02/2026 14:32:01",
    pagador: { nome: "João Silva",      cpfCnpj: "123.456.789-09", telegram: "@joaosilva"   },
    recebedor: { nome: "GATEWAY JJ PAGAMENTOS LTDA", cpfCnpj: "46.872.831/0001-54", instituicao: "GATEWAY JJ PAGAMENTOS LTDA", chavePix: "46.872.831/0001-54" },
    autenticacao: "E60746948202602270652A144730gSQk",
    identificacao: "b61aa8413cabfc6b01c3mm4jb2yk1ab2",
    geradoEm: "26/02/2026 14:30:15",
  },
  {
    id: "TXN-8820", tipo: "Cartão", cliente: "Tech Store",   valor: 890.50,   status: "aprovado",
    data: "26/02/2026 14:28:44",
    pagador: { nome: "Ana Souza",       cpfCnpj: "987.654.321-00", telegram: "@anasouza"    },
    recebedor: { nome: "GATEWAY JJ PAGAMENTOS LTDA", cpfCnpj: "46.872.831/0001-54", instituicao: "GATEWAY JJ PAGAMENTOS LTDA", chavePix: "—" },
    autenticacao: "C50736848202602270631B233620fTRk",
    identificacao: "a50bb7302daceb5a00b2ll3ib1xk0ba1",
    geradoEm: "26/02/2026 14:26:10",
  },
  {
    id: "TXN-8819", tipo: "Boleto", cliente: "Serviços XYZ", valor: 2_100.00, status: "pendente",
    data: "26/02/2026 13:15:22",
    pagador: { nome: "Carlos Lima",     cpfCnpj: "111.222.333-44", telegram: "@carloslima"  },
    recebedor: { nome: "GATEWAY JJ PAGAMENTOS LTDA", cpfCnpj: "46.872.831/0001-54", instituicao: "GATEWAY JJ PAGAMENTOS LTDA", chavePix: "—" },
    autenticacao: "D40625737202602270520A022510eSPj",
    identificacao: "c72cc9524ebdfd7b12d4nn5kc3zl2cd3",
    geradoEm: "26/02/2026 13:13:05",
  },
  {
    id: "TXN-8818", tipo: "Pix",    cliente: "Cliente A",    valor: 156.90,   status: "falhou",
    data: "26/02/2026 12:58:33",
    pagador: { nome: "Mariana Costa",   cpfCnpj: "555.666.777-88", telegram: "@marianac"    },
    recebedor: { nome: "GATEWAY JJ PAGAMENTOS LTDA", cpfCnpj: "46.872.831/0001-54", instituicao: "GATEWAY JJ PAGAMENTOS LTDA", chavePix: "46.872.831/0001-54" },
    autenticacao: "F71857059202602261149C355641hUQl",
    identificacao: "d83dd0635fcegh8c23e5oo6ld4am3de4",
    geradoEm: "26/02/2026 12:56:00",
  },
  {
    id: "TXN-8817", tipo: "Cartão", cliente: "Loja ABC",     valor: 445.00,   status: "estornado",
    data: "26/02/2026 11:22:11",
    pagador: { nome: "João Silva",      cpfCnpj: "123.456.789-09", telegram: "@joaosilva"   },
    recebedor: { nome: "GATEWAY JJ PAGAMENTOS LTDA", cpfCnpj: "46.872.831/0001-54", instituicao: "GATEWAY JJ PAGAMENTOS LTDA", chavePix: "—" },
    autenticacao: "G82968160202602261038D466752iVRm",
    identificacao: "e94ee1746gdfhi9d34f6pp7me5bn4ef5",
    geradoEm: "26/02/2026 11:20:05",
  },
  {
    id: "TXN-8816", tipo: "Pix",    cliente: "Tech Store",   valor: 3_780.00, status: "aprovado",
    data: "26/02/2026 10:41:55",
    pagador: { nome: "Pedro Alves",     cpfCnpj: "222.333.444-55", telegram: "@pedroalves"  },
    recebedor: { nome: "GATEWAY JJ PAGAMENTOS LTDA", cpfCnpj: "46.872.831/0001-54", instituicao: "GATEWAY JJ PAGAMENTOS LTDA", chavePix: "46.872.831/0001-54" },
    autenticacao: "H93079271202602260927E577863jWQn",
    identificacao: "f05ff2857hfgij0e45g7qq8nf6co5fg6",
    geradoEm: "26/02/2026 10:39:30",
  },
  {
    id: "TXN-8815", tipo: "Boleto", cliente: "Empresa Z",    valor: 5_000.00, status: "pendente",
    data: "26/02/2026 09:10:48",
    pagador: { nome: "Empresa Z LTDA",  cpfCnpj: "12.345.678/0001-99", telegram: "—"        },
    recebedor: { nome: "GATEWAY JJ PAGAMENTOS LTDA", cpfCnpj: "46.872.831/0001-54", instituicao: "GATEWAY JJ PAGAMENTOS LTDA", chavePix: "—" },
    autenticacao: "I04180382202602260816F688974kXRo",
    identificacao: "g16gg3968igghjk1f56h8rr9og7dp6gh7",
    geradoEm: "26/02/2026 09:08:12",
  },
  {
    id: "TXN-8814", tipo: "Pix",    cliente: "Cliente B",    valor: 320.00,   status: "aprovado",
    data: "26/02/2026 08:47:20",
    pagador: { nome: "Luciana Ferreira", cpfCnpj: "333.444.555-66", telegram: "@lucianaF"   },
    recebedor: { nome: "GATEWAY JJ PAGAMENTOS LTDA", cpfCnpj: "46.872.831/0001-54", instituicao: "GATEWAY JJ PAGAMENTOS LTDA", chavePix: "46.872.831/0001-54" },
    autenticacao: "J15291493202602260705G799085lYQp",
    identificacao: "h27hh4079jhhikl2g67i9ss0ph8eq7hi8",
    geradoEm: "26/02/2026 08:45:00",
  },
  {
    id: "TXN-8813", tipo: "Cartão", cliente: "Empresa W",    valor: 980.00,   status: "aprovado",
    data: "25/02/2026 18:10:09",
    pagador: { nome: "Empresa W LTDA",  cpfCnpj: "98.765.432/0001-11", telegram: "—"        },
    recebedor: { nome: "GATEWAY JJ PAGAMENTOS LTDA", cpfCnpj: "46.872.831/0001-54", instituicao: "GATEWAY JJ PAGAMENTOS LTDA", chavePix: "—" },
    autenticacao: "K26302504202602251594H800196mZRq",
    identificacao: "i38ii5180kiijlm3h78j0tt1qi9fr8ij9",
    geradoEm: "25/02/2026 18:08:22",
  },
  {
    id: "TXN-8812", tipo: "Pix",    cliente: "Cliente C",    valor: 2_450.00, status: "aprovado",
    data: "25/02/2026 15:30:33",
    pagador: { nome: "Roberto Gomes",   cpfCnpj: "444.555.666-77", telegram: "@robertog"    },
    recebedor: { nome: "GATEWAY JJ PAGAMENTOS LTDA", cpfCnpj: "46.872.831/0001-54", instituicao: "GATEWAY JJ PAGAMENTOS LTDA", chavePix: "46.872.831/0001-54" },
    autenticacao: "L37413615202602251483I911207nAQr",
    identificacao: "j49jj6291ljjkmn4i89k1uu2rj0gs9jk0",
    geradoEm: "25/02/2026 15:28:10",
  },
  {
    id: "TXN-8811", tipo: "Boleto", cliente: "Loja XYZ",     valor: 670.00,   status: "pendente",
    data: "25/02/2026 12:00:15",
    pagador: { nome: "Loja XYZ ME",     cpfCnpj: "55.666.777/0001-22", telegram: "—"        },
    recebedor: { nome: "GATEWAY JJ PAGAMENTOS LTDA", cpfCnpj: "46.872.831/0001-54", instituicao: "GATEWAY JJ PAGAMENTOS LTDA", chavePix: "—" },
    autenticacao: "M48524726202602251372J022318oBRs",
    identificacao: "k50kk7302mkkno5j90l2vv3sk1ht0kl1",
    geradoEm: "25/02/2026 11:58:00",
  },
  {
    id: "TXN-8810", tipo: "Pix",    cliente: "Tech Store",   valor: 1_100.00, status: "falhou",
    data: "25/02/2026 09:45:50",
    pagador: { nome: "Ana Souza",       cpfCnpj: "987.654.321-00", telegram: "@anasouza"    },
    recebedor: { nome: "GATEWAY JJ PAGAMENTOS LTDA", cpfCnpj: "46.872.831/0001-54", instituicao: "GATEWAY JJ PAGAMENTOS LTDA", chavePix: "46.872.831/0001-54" },
    autenticacao: "N59635837202602251261K133429pCQT",
    identificacao: "l61ll8413nllop6k01m3ww4tl2iu1lm2",
    geradoEm: "25/02/2026 09:43:30",
  },
  {
    id: "TXN-8809", tipo: "Cartão", cliente: "Cliente D",    valor: 3_200.00, status: "aprovado",
    data: "24/02/2026 17:22:44",
    pagador: { nome: "Fernanda Reis",   cpfCnpj: "666.777.888-99", telegram: "@fernandar"   },
    recebedor: { nome: "GATEWAY JJ PAGAMENTOS LTDA", cpfCnpj: "46.872.831/0001-54", instituicao: "GATEWAY JJ PAGAMENTOS LTDA", chavePix: "—" },
    autenticacao: "O60746948202602241150L244530qDRU",
    identificacao: "m72mm9524ommpq7l12n4xx5um3jv2mn3",
    geradoEm: "24/02/2026 17:20:15",
  },
  {
    id: "TXN-8808", tipo: "Pix",    cliente: "Empresa A",    valor: 550.00,   status: "estornado",
    data: "24/02/2026 14:08:12",
    pagador: { nome: "Empresa A LTDA",  cpfCnpj: "11.222.333/0001-44", telegram: "—"        },
    recebedor: { nome: "GATEWAY JJ PAGAMENTOS LTDA", cpfCnpj: "46.872.831/0001-54", instituicao: "GATEWAY JJ PAGAMENTOS LTDA", chavePix: "46.872.831/0001-54" },
    autenticacao: "P71857059202602241039M355641rERV",
    identificacao: "n83nn0635pnnqr8m23o5yy6vn4kw3no4",
    geradoEm: "24/02/2026 14:06:00",
  },
];

const STATUS = {
  aprovado:  { label: "Aprovado",  cls: "badge-green",  icon: CheckCircle2 },
  pendente:  { label: "Pendente",  cls: "badge-yellow", icon: Clock        },
  falhou:    { label: "Falhou",    cls: "badge-red",    icon: XCircle      },
  estornado: { label: "Estornado", cls: "badge-blue",   icon: RotateCcw    },
};

const fmt = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
const PER_PAGE = 7;

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

/* ─── Página principal ──────────────────────────────────────── */
export function Transacoes() {
  const [q,            setQ]            = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [pagina,       setPagina]       = useState(1);
  const [txComprovante, setTxComprovante] = useState(null);

  const filtrada = TXS.filter((tx) => {
    const matchQ = q === "" || tx.id.toLowerCase().includes(q.toLowerCase()) || tx.cliente.toLowerCase().includes(q.toLowerCase());
    const matchS = filtroStatus === "todos" || tx.status === filtroStatus;
    return matchQ && matchS;
  });

  const totalPags  = Math.max(1, Math.ceil(filtrada.length / PER_PAGE));
  const paginaReal = Math.min(pagina, totalPags);
  const lista      = filtrada.slice((paginaReal - 1) * PER_PAGE, paginaReal * PER_PAGE);

  const onFiltro = (s) => { setFiltroStatus(s); setPagina(1); };
  const onBusca  = (v) => { setQ(v); setPagina(1); };

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
              {lista.length === 0 ? (
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

        <Paginacao total={filtrada.length} porPagina={PER_PAGE} pagina={paginaReal} onChange={setPagina} />
      </div>

      {txComprovante && (
        <ModalComprovante tx={txComprovante} onClose={() => setTxComprovante(null)} />
      )}
    </div>
  );
}
