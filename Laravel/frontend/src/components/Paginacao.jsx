import { ChevronLeft, ChevronRight } from "lucide-react";
import { gerarPaginas } from "../utils/paginacao";

/**
 * Barra de paginação reutilizável.
 * Props: total (nº registros), porPagina, pagina, onChange(p)
 */
export function Paginacao({ total, porPagina, pagina, onChange }) {
  const totalPags  = Math.max(1, Math.ceil(total / porPagina));
  const paginaReal = Math.min(pagina, totalPags);
  const paginas    = gerarPaginas(paginaReal, totalPags);

  const inicio = total === 0 ? 0 : (paginaReal - 1) * porPagina + 1;
  const fim    = Math.min(paginaReal * porPagina, total);

  return (
    <div className="tbl-pagination">
      <span className="tbl-pag-info">
        {total === 0 ? "0 resultados" : `${inicio}–${fim} de ${total}`}
      </span>
      <div className="tbl-pag-btns">
        <button
          className="btn btn-ghost btn-icon"
          disabled={paginaReal <= 1}
          onClick={() => onChange(paginaReal - 1)}
          aria-label="Página anterior"
        >
          <ChevronLeft size={15} />
        </button>

        {paginas.map((p, i) =>
          p === "..." ? (
            <span key={`el-${i}`} className="tbl-pag-ellipsis">…</span>
          ) : (
            <button
              key={p}
              className={`btn${p === paginaReal ? " btn-primary" : " btn-ghost"}`}
              onClick={() => onChange(p)}
            >
              {p}
            </button>
          )
        )}

        <button
          className="btn btn-ghost btn-icon"
          disabled={paginaReal >= totalPags}
          onClick={() => onChange(paginaReal + 1)}
          aria-label="Próxima página"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
