/**
 * Cliente HTTP para a API do backend.
 * Base URL: VITE_API_URL (ex.: http://localhost:8000) + /api/v1
 * Envia Bearer token em rotas protegidas; em 401 faz logout e redireciona para /login.
 */

const getBaseUrl = () => {
  const url = import.meta.env.VITE_API_URL;
  return (url || "http://localhost:8000").replace(/\/$/, "") + "/api/v1";
};

let onUnauthorized = () => {};

export function setApiOnUnauthorized(callback) {
  onUnauthorized = callback;
}

export async function apiRequest(path, options = {}) {
  const base = getBaseUrl();
  const url = path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const token = localStorage.getItem("gjj_token");

  const headers = {
    Accept: "application/json",
    ...options.headers,
  };

  if (options.body instanceof FormData) {
    // Não definir Content-Type para FormData (browser define com boundary)
    if (headers["Content-Type"]) delete headers["Content-Type"];
  } else if (headers["Content-Type"] === undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    onUnauthorized();
    const err = new Error("Não autorizado");
    err.status = 401;
    throw err;
  }

  return res;
}

export async function apiJson(path, options = {}) {
  const res = await apiRequest(path, options);
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const err = new Error(data?.message || `Erro ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}
