import { ArrowUpRight } from "lucide-react";

export function SolicitarSaque() {
  return (
    <div>
      <div className="page-header animate-fade-in">
        <div>
          <h1 className="page-title">Solicitar Saque</h1>
          <p className="page-subtitle">Transfira seu saldo para sua conta bancária</p>
        </div>
      </div>
      <div className="card card-p animate-fade-up">
        <div className="empty-page">
          <div className="empty-page-icon"><ArrowUpRight size={28} /></div>
          <p style={{ fontWeight: 600, color: "var(--text-secondary)", fontSize: 16 }}>Em desenvolvimento</p>
          <p style={{ fontSize: 14 }}>Esta página será implementada em breve.</p>
        </div>
      </div>
    </div>
  );
}
