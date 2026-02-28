import { useState, useRef } from "react";
import { Shield, Lock, Smartphone, Monitor, LogOut, Eye, EyeOff, CheckCircle2, KeyRound, QrCode, AlertCircle, X, Loader2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { apiJson } from "../../api/client";

const SESSOES = [
  { id: 1, dispositivo: "Chrome — macOS",      ip: "177.92.14.5",   local: "São Paulo, BR",      atual: true,  ultima: "Agora"      },
  { id: 2, dispositivo: "Safari — iPhone 15",  ip: "177.92.14.6",   local: "São Paulo, BR",      atual: false, ultima: "há 2 horas" },
  { id: 3, dispositivo: "Chrome — Windows 11", ip: "200.132.8.201", local: "Rio de Janeiro, BR", atual: false, ultima: "há 1 dia"   },
];

/* ─── Modal genérico ───────────────────────────────────────── */
function Modal({ titulo, subtitulo, onClose, children, footer }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <p className="modal-titulo">{titulo}</p>
            {subtitulo && <p className="modal-subtitulo">{subtitulo}</p>}
          </div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

/* ─── Caixas de PIN (4 ou 6 dígitos) ─────────────────────────── */
function PinBoxes({ value, onChange, error = false, label, size = 6 }) {
  const refs = useRef([]);
  const digits = value.split("").concat(Array(size).fill("")).slice(0, size);

  const handleKey = (i, e) => {
    const key = e.key;

    if (key === "Backspace") {
      e.preventDefault();
      if (digits[i]) {
        const next = digits.map((d, idx) => idx === i ? "" : d).join("").padEnd(size, "").slice(0, size).trimEnd();
        onChange(next);
      } else if (i > 0) {
        refs.current[i - 1]?.focus();
        const next = digits.map((d, idx) => idx === i - 1 ? "" : d).join("").trimEnd();
        onChange(next);
      }
      return;
    }

    if (key === "ArrowLeft" && i > 0) { refs.current[i - 1]?.focus(); return; }
    if (key === "ArrowRight" && i < size - 1) { refs.current[i + 1]?.focus(); return; }

    if (/^\d$/.test(key)) {
      e.preventDefault();
      const arr = [...digits];
      arr[i] = key;
      onChange(arr.join("").trimEnd());
      if (i < size - 1) refs.current[i + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, size);
    onChange(pasted);
    const focusIdx = Math.min(pasted.length, size - 1);
    refs.current[focusIdx]?.focus();
  };

  return (
    <div>
      {label && <label className="form-label">{label}</label>}
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => (refs.current[i] = el)}
            type="password"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onKeyDown={(e) => handleKey(i, e)}
            onPaste={handlePaste}
            onChange={() => {}}
            style={{
              width: 46, height: 52,
              textAlign: "center",
              fontSize: 22, fontWeight: 700,
              border: `2px solid ${error && value.length === size ? "var(--red)" : d ? "var(--accent)" : "var(--border)"}`,
              borderRadius: "var(--radius-sm)",
              background: "var(--surface-2)",
              color: "var(--text-1)",
              outline: "none",
              caretColor: "transparent",
              transition: "border-color var(--dur)",
              cursor: "text",
            }}
            onFocus={(e) => e.target.style.borderColor = error && value.length === size ? "var(--red)" : "var(--accent)"}
            onBlur={(e) => e.target.style.borderColor = error && value.length === size ? "var(--red)" : d ? "var(--accent)" : "var(--border)"}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Campo de senha com toggle ────────────────────────────── */
function SenhaInput({ label, value, onChange, placeholder }) {
  const [ver, setVer] = useState(false);
  return (
    <div>
      <label className="form-label">{label}</label>
      <div style={{ position: "relative" }}>
        <input className="form-input" type={ver ? "text" : "password"} placeholder={placeholder}
          value={value} onChange={onChange} style={{ paddingRight: 38 }} />
        <button type="button" onClick={() => setVer((v) => !v)} style={{
          position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
          background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", padding: 0,
        }}>
          {ver ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );
}

const PIN_LEN = 4;

export function Seguranca() {
  const { user, setUserData } = useAuth();
  const has_pin = user?.has_pin ?? false;
  const [modal, setModal] = useState(null);

  const [senhas, setSenhas] = useState({ atual: "", nova: "", confirm: "" });
  const setSenha = (k) => (e) => setSenhas((s) => ({ ...s, [k]: e.target.value }));
  const senhaOk = senhas.atual && senhas.nova.length >= 8 && senhas.nova === senhas.confirm;
  const [senhaLoading, setSenhaLoading] = useState(false);
  const [senhaSalva, setSenhaSalva] = useState(false);
  const [senhaErr, setSenhaErr] = useState("");

  const [twoFA, setTwoFA] = useState(false);

  const [pin, setPin] = useState("");
  const [pinConf, setPinConf] = useState("");
  const [pinAtual, setPinAtual] = useState("");
  const [pinSalvo, setPinSalvo] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState("");
  const pinOk = pin.length === PIN_LEN && pin === pinConf;
  const pinAlterarOk = has_pin && pinAtual.length === PIN_LEN && pinOk;

  const handleSalvarPin = async () => {
    if (!pinOk && !pinAlterarOk) return;
    setPinError("");
    setPinLoading(true);
    try {
      if (has_pin) {
        await apiJson("/pin", { method: "PUT", body: JSON.stringify({ current_pin: pinAtual, pin, pin_confirmation: pinConf }) });
      } else {
        await apiJson("/pin", { method: "POST", body: JSON.stringify({ pin, pin_confirmation: pinConf }) });
      }
      setPinSalvo(true);
      const me = await apiJson("/auth/me");
      if (me?.data) setUserData(me.data);
      setTimeout(() => { setPinSalvo(false); fechar(); setModal(null); }, 1500);
    } catch (err) {
      setPinError(err?.data?.message || err?.message || "Falha ao salvar PIN.");
    } finally {
      setPinLoading(false);
    }
  };

  /* Sessões */
  const [sessoes, setSessoes] = useState(SESSOES);
  const encerrar = (id) => setSessoes((s) => s.filter((x) => x.id === 1 || x.id !== id));

  const handleSalvarSenha = async () => {
    if (!senhaOk || senhaLoading) return;
    setSenhaLoading(true);
    setSenhaErr("");
    try {
      await apiJson("/auth/password", {
        method: "PUT",
        body: { current_password: senhas.atual, password: senhas.nova, password_confirmation: senhas.confirm },
      });
      setSenhaSalva(true);
      setTimeout(() => { setSenhaSalva(false); fechar(); }, 1500);
    } catch (err) {
      setSenhaErr(
        err?.errors?.current_password?.[0]
          || err?.errors?.password?.[0]
          || err?.message
          || "Erro ao alterar senha."
      );
    } finally {
      setSenhaLoading(false);
    }
  };

  const fechar = () => {
    setModal(null);
    setSenhas({ atual: "", nova: "", confirm: "" });
    setSenhaErr(""); setSenhaSalva(false);
    setPin(""); setPinConf(""); setPinAtual(""); setPinError("");
  };

  /* Cards de segurança */
  const CARDS = [
    {
      id: "senha",
      icon: <Lock size={20} style={{ color: "var(--accent)" }} />,
      bg: "var(--accent-faint)",
      titulo: "Alterar senha",
      desc: "Atualize sua senha de acesso com uma nova senha segura.",
      btn: "Alterar senha",
    },
    {
      id: "2fa",
      icon: <Smartphone size={20} style={{ color: twoFA ? "var(--green)" : "var(--text-3)" }} />,
      bg: twoFA ? "var(--green-faint)" : "var(--surface-2)",
      titulo: "Autenticação 2FA",
      desc: "Adicione uma camada extra de proteção com app autenticador.",
      btn: twoFA ? "Gerenciar 2FA" : "Ativar 2FA",
      badge: twoFA ? <span className="badge badge-green" style={{ fontSize: 11 }}><CheckCircle2 size={10} /> Ativo</span> : null,
    },
    {
      id: "pin",
      icon: <KeyRound size={20} style={{ color: "var(--yellow)" }} />,
      bg: "var(--yellow-faint)",
      titulo: "PIN de segurança",
      desc: has_pin ? "PIN ativo. Altere quando quiser (4 dígitos)." : "Código de 4 dígitos exigido em saques e operações sensíveis.",
      btn: has_pin ? "Alterar PIN" : "Configurar PIN",
      badge: has_pin ? <span className="badge badge-green" style={{ fontSize: 11 }}><CheckCircle2 size={10} /> Ativo</span> : null,
    },
    {
      id: "sessoes",
      icon: <Monitor size={20} style={{ color: "var(--blue)" }} />,
      bg: "var(--blue-faint)",
      titulo: "Sessões ativas",
      desc: `${sessoes.length} dispositivo${sessoes.length > 1 ? "s" : ""} conectado${sessoes.length > 1 ? "s" : ""}. Encerre sessões suspeitas.`,
      btn: "Ver sessões",
    },
  ];

  return (
    <div>
      <div className="page-header animate-fade-in">
        <div>
          <h1 className="page-title">Segurança</h1>
          <p className="page-subtitle">Gerencie senha, 2FA, PIN e sessões ativas</p>
        </div>
      </div>

      {/* 4 cards em linha */}
      <div className="layout-4col animate-fade-up">
        {CARDS.map((c) => (
          <div key={c.id} className="card sec-action-card">
            <div style={{
              width: 44, height: 44, borderRadius: "var(--radius)",
              background: c.bg, display: "flex", alignItems: "center",
              justifyContent: "center", marginBottom: 12,
            }}>
              {c.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>{c.titulo}</p>
                {c.badge}
              </div>
              <p style={{ fontSize: 12, color: "var(--text-3)", lineHeight: 1.5 }}>{c.desc}</p>
            </div>
            <button className="btn btn-ghost btn-sm" style={{ width: "100%", justifyContent: "center", marginTop: 14 }}
              onClick={() => setModal(c.id)}>
              {c.btn}
            </button>
          </div>
        ))}
      </div>

      {/* ── Modal: Alterar senha ──────────────────────────────── */}
      {modal === "senha" && (
        <Modal titulo="Alterar senha" subtitulo="Use uma senha forte com letras, números e símbolos." onClose={fechar}
          footer={<>
            <button className="btn btn-ghost btn-sm" onClick={fechar} disabled={senhaLoading}>Cancelar</button>
            <button className="btn btn-primary btn-sm" style={{ gap: 6 }} disabled={!senhaOk || senhaLoading} onClick={handleSalvarSenha}>
              {senhaLoading
                ? <><Loader2 size={13} className="spin" /> Salvando...</>
                : senhaSalva
                  ? <><CheckCircle2 size={13} /> Senha alterada!</>
                  : <><Shield size={13} /> Atualizar senha</>}
            </button>
          </>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <SenhaInput label="Senha atual"          value={senhas.atual}    onChange={setSenha("atual")}   placeholder="••••••••" />
            <SenhaInput label="Nova senha"            value={senhas.nova}     onChange={setSenha("nova")}    placeholder="Mínimo 8 caracteres" />
            <SenhaInput label="Confirmar nova senha"  value={senhas.confirm}  onChange={setSenha("confirm")} placeholder="Repita a nova senha" />
            {senhas.nova && senhas.confirm && senhas.nova !== senhas.confirm && (
              <p style={{ fontSize: 12, color: "var(--red)", display: "flex", alignItems: "center", gap: 4 }}>
                <AlertCircle size={12} /> As senhas não coincidem.
              </p>
            )}
            {senhaErr && (
              <p style={{ fontSize: 12, color: "var(--red)", display: "flex", alignItems: "center", gap: 4 }}>
                <AlertCircle size={12} /> {senhaErr}
              </p>
            )}
          </div>
        </Modal>
      )}

      {/* ── Modal: 2FA ───────────────────────────────────────── */}
      {modal === "2fa" && (
        <Modal titulo="Autenticação em 2 fatores"
          subtitulo={twoFA ? "2FA ativo. Desative somente se necessário." : "Use um app como Google Authenticator ou Authy."}
          onClose={fechar}
          footer={<>
            <button className="btn btn-ghost btn-sm" onClick={fechar}>Fechar</button>
            <button
              className={`btn btn-sm ${twoFA ? "btn-ghost" : "btn-primary"}`}
              style={{ gap: 6, color: twoFA ? "var(--red)" : undefined }}
              onClick={() => { setTwoFA((v) => !v); fechar(); }}>
              {twoFA ? <><X size={13} /> Desativar 2FA</> : <><CheckCircle2 size={13} /> Ativar 2FA</>}
            </button>
          </>}>
          {twoFA ? (
            <div style={{
              background: "var(--accent-faint)", border: "1px solid var(--accent)",
              borderRadius: "var(--radius-sm)", padding: "12px 14px",
            }}>
              <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>
                <strong>2FA ativo</strong> via app autenticador. Use o código gerado a cada 30 segundos no login.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 120, height: 120, background: "var(--surface-2)", border: "1px solid var(--border-2)",
                borderRadius: "var(--radius)", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <QrCode size={64} style={{ opacity: 0.2 }} />
              </div>
              <p style={{ fontSize: 13, color: "var(--text-3)", textAlign: "center", lineHeight: 1.5, maxWidth: 300 }}>
                Ative o 2FA para exibir o QR Code. Escaneie com seu aplicativo autenticador.
              </p>
            </div>
          )}
        </Modal>
      )}

      {/* ── Modal: PIN ───────────────────────────────────────── */}
      {modal === "pin" && (
        <Modal titulo={has_pin ? "Alterar PIN" : "PIN de segurança"} subtitulo="4 dígitos numéricos. Exigido em saques." onClose={fechar}
          footer={<>
            <button className="btn btn-ghost btn-sm" onClick={fechar}>Cancelar</button>
            <button className="btn btn-primary btn-sm" style={{ gap: 6 }}
              disabled={(has_pin ? !pinAlterarOk : !pinOk) || pinLoading} onClick={handleSalvarPin}>
              {pinLoading ? <><Loader2 size={13} className="spin" /> Salvando...</> : pinSalvo ? <><CheckCircle2 size={13} /> PIN salvo!</> : <><KeyRound size={13} /> Salvar PIN</>}
            </button>
          </>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {pinError && <p className="field-error">{pinError}</p>}
            {has_pin && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
                <PinBoxes size={PIN_LEN} label="PIN atual" value={pinAtual} onChange={setPinAtual} />
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
              <PinBoxes size={PIN_LEN} label={has_pin ? "Novo PIN" : "Criar PIN"} value={pin} onChange={setPin} />
            </div>
            <div style={{ height: 1, background: "var(--border-2)" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
              <PinBoxes size={PIN_LEN} label="Confirmar PIN" value={pinConf} onChange={setPinConf}
                error={pinConf.length === PIN_LEN && pin !== pinConf} />
              {pinConf.length === PIN_LEN && pin !== pinConf && (
                <p style={{ fontSize: 12, color: "var(--red)", display: "flex", alignItems: "center", gap: 4 }}><AlertCircle size={12} /> Os PINs não coincidem.</p>
              )}
              {pinConf.length === PIN_LEN && pin === pinConf && (
                <p style={{ fontSize: 12, color: "var(--green)", display: "flex", alignItems: "center", gap: 4 }}><CheckCircle2 size={12} /> PINs conferem!</p>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ── Modal: Sessões ───────────────────────────────────── */}
      {modal === "sessoes" && (
        <Modal titulo="Sessões ativas" subtitulo={`${sessoes.length} dispositivo(s) com acesso à sua conta.`} onClose={fechar}
          footer={<>
            <button className="btn btn-ghost btn-sm" style={{ gap: 5, color: "var(--red)" }}
              onClick={() => setSessoes((s) => s.filter((x) => x.atual))}>
              <LogOut size={13} /> Encerrar todas
            </button>
            <button className="btn btn-ghost btn-sm" onClick={fechar}>Fechar</button>
          </>}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {sessoes.map((s, i) => (
              <div key={s.id} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "12px 0",
                borderBottom: i < sessoes.length - 1 ? "1px solid var(--border-2)" : "none",
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "var(--radius-sm)", flexShrink: 0,
                  background: "var(--surface-2)", border: "1px solid var(--border-2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Monitor size={15} style={{ color: "var(--text-3)" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>{s.dispositivo}</p>
                  <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 1 }}>{s.ip} · {s.local} · {s.ultima}</p>
                </div>
                {s.atual ? (
                  <span className="badge badge-green">Sessão atual</span>
                ) : (
                  <button className="btn btn-ghost btn-xs" style={{ gap: 4, color: "var(--red)" }}
                    onClick={() => encerrar(s.id)}>
                    <LogOut size={12} /> Encerrar
                  </button>
                )}
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
