const TIMEZONE = "America/Sao_Paulo";

/**
 * Formata data/hora da API (ISO ou string) para exibição em pt-BR, em horário do Brasil.
 * @param {string|Date|null} value - Data da API (ex.: ISO 8601)
 * @param {{ dateStyle?: 'short'|'medium'|'long'|'full', timeStyle?: 'short'|'medium'|'long'|'full', dateOnly?: boolean }} opts
 * @returns {string} Data formatada ou string vazia se inválida
 */
export function formatDateBR(value, opts = {}) {
  if (value == null) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";

  const { dateStyle = "short", timeStyle = "short", dateOnly = false } = opts;

  if (dateOnly) {
    return d.toLocaleDateString("pt-BR", { timeZone: TIMEZONE, dateStyle: dateStyle || "short" });
  }
  return d.toLocaleString("pt-BR", {
    timeZone: TIMEZONE,
    dateStyle: dateStyle || "short",
    timeStyle: timeStyle || "short",
  });
}

/**
 * Data curta (dd/MM/yyyy) em horário do Brasil.
 */
export function formatDateShort(value) {
  return formatDateBR(value, { dateOnly: true, dateStyle: "short" });
}

/**
 * Data e hora curta (dd/MM/yyyy, HH:mm) em horário do Brasil.
 */
export function formatDateTimeBR(value) {
  return formatDateBR(value, { dateStyle: "short", timeStyle: "short" });
}
