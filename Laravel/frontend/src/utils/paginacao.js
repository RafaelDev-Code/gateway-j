/**
 * Gera a sequência de botões de paginação com reticências.
 * Ex: [1, '...', 4, 5, 6, '...', 20]
 * @param {number} paginaAtual
 * @param {number} totalPags
 * @param {number} vizinhos – páginas visíveis ao redor da atual (padrão 1)
 */
export function gerarPaginas(paginaAtual, totalPags, vizinhos = 1) {
  if (totalPags <= 7) {
    return Array.from({ length: totalPags }, (_, i) => i + 1);
  }

  const items = [];
  const inicio = Math.max(2, paginaAtual - vizinhos);
  const fim    = Math.min(totalPags - 1, paginaAtual + vizinhos);

  items.push(1);

  if (inicio > 2) items.push("...");

  for (let i = inicio; i <= fim; i++) items.push(i);

  if (fim < totalPags - 1) items.push("...");

  items.push(totalPags);

  return items;
}
