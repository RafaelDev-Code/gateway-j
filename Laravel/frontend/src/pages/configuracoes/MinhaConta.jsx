import { User } from "lucide-react";

export function MinhaConta() {
  return (
    <div>
      <div className="page-header animate-fade-in">
        <div>
          <h1 className="page-title">Minha Conta</h1>
          <p className="page-subtitle">Gerencie seus dados pessoais e preferências</p>
        </div>
      </div>
      <div className="card card-p animate-fade-up">
        <div className="empty-page">
          <div className="empty-page-icon"><User size={28} /></div>
          <p style={{ fontWeight: 600, color: "var(--text-secondary)", fontSize: 16 }}>Em desenvolvimento</p>
          <p style={{ fontSize: 14 }}>Esta página será implementada em breve.</p>
        </div>
      </div>
    </div>
  );
}
