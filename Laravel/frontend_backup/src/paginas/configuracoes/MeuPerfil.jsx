import { useState } from "react";
import { User, Camera, CheckCircle } from "lucide-react";
import { PageShell, Card, DarkInput, DarkSelect } from "../../componentes/PageShell";
import { theme } from "../../theme";

const ACCENT = theme.accent; const TEXT = theme.text; const TEXT_MUTED = theme.textMuted;

export function MeuPerfil() {
  const [salvo,  setSalvo]  = useState(false);
  const [form,   setForm]   = useState({
    nome: "Rafael Araujo", email: "rafael@vorix.com.br", telefone: "(21) 99999-0000",
    cpf: "123.456.789-00", nascimento: "1995-06-15", estado: "RJ", cidade: "Rio de Janeiro",
  });

  const salvar = (e) => {
    e.preventDefault();
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2500);
  };

  return (
    <PageShell icon={User} title="Meu Perfil" subtitle="Gerencie seus dados pessoais e informações de conta">
      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 20, alignItems: "start" }}>
        {/* Avatar */}
        <Card style={{ animation: "cardEnter 0.4s ease 0ms both", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "24px 16px" }}>
          <div style={{ position: "relative" }}>
            <div style={{ width: 88, height: 88, borderRadius: "50%", background: "rgba(255,255,255,0.07)", border: `2px solid rgba(243,15,34,0.3)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <User size={40} style={{ color: TEXT_MUTED }} />
            </div>
            <button style={{ position: "absolute", bottom: 0, right: 0, width: 28, height: 28, borderRadius: "50%", background: ACCENT, border: "2px solid #060102", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Camera size={13} style={{ color: "#fff" }} />
            </button>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: TEXT }}>{form.nome}</p>
            <p style={{ margin: "3px 0 0", fontSize: 12, color: TEXT_MUTED }}>{form.email}</p>
          </div>
          <div style={{ padding: "6px 14px", borderRadius: 99, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
            <span style={{ fontSize: 12, color: "#22c55e", fontWeight: 600 }}>✓ Conta verificada</span>
          </div>
        </Card>

        {/* Formulário */}
        <Card style={{ animation: "cardEnter 0.45s ease 80ms both" }}>
          <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: TEXT }}>Informações pessoais</h3>
          <form onSubmit={salvar} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <DarkInput label="Nome completo"   value={form.nome}       onChange={e => setForm({...form, nome: e.target.value})} />
              <DarkInput label="E-mail"          value={form.email}      onChange={e => setForm({...form, email: e.target.value})} type="email" />
              <DarkInput label="Telefone"        value={form.telefone}   onChange={e => setForm({...form, telefone: e.target.value})} />
              <DarkInput label="CPF"             value={form.cpf}        readOnly style={{ opacity: 0.6 }} />
              <DarkInput label="Data de nascimento" value={form.nascimento} onChange={e => setForm({...form, nascimento: e.target.value})} type="date" />
              <DarkSelect label="Estado" value={form.estado} onChange={e => setForm({...form, estado: e.target.value})}>
                {["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map(uf => <option key={uf}>{uf}</option>)}
              </DarkSelect>
            </div>
            <DarkInput label="Cidade" value={form.cidade} onChange={e => setForm({...form, cidade: e.target.value})} />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12, marginTop: 6 }}>
              {salvo && (
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#22c55e", animation: "cardEnter 0.3s ease both" }}>
                  <CheckCircle size={15} /> Salvo com sucesso!
                </span>
              )}
              <button type="submit" className="btn-futurist btn-futurist-primary" style={{ padding: "12px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                Salvar alterações
              </button>
            </div>
          </form>
        </Card>
      </div>
    </PageShell>
  );
}
