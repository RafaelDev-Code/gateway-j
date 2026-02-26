import { PlusCircle } from "lucide-react";

export function CriarRecebimento() {
  return (
    <div>
      <div className="page-header animate-fade-in">
        <div>
          <h1 className="page-title">Criar Recebimento</h1>
          <p className="page-subtitle">Gere cobranças e QR Codes PIX</p>
        </div>
      </div>
      <div className="card card-p animate-fade-up">
        <div className="empty-page">
          <div className="empty-page-icon"><PlusCircle size={28} /></div>
          <p style={{ fontWeight: 600, color: "var(--text-secondary)", fontSize: 16 }}>Em desenvolvimento</p>
          <p style={{ fontSize: 14 }}>Esta página será implementada em breve.</p>
        </div>
      </div>
    </div>
  );
}
