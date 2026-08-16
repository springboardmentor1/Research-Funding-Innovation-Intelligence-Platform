// Central API client. Every network call in the app goes through here.
//
// Why one file instead of fetch() scattered across components:
//   - the base URL is defined once (change it in one place for deployment)
//   - the auth token is attached in one place
//   - a 401 is handled in one place (session expired -> log out)
//   - request/response shape is consistent
//
// This is the single seam between your React UI and your FastAPI backend.

const BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/v1";

// The token lives in memory (this module variable), not localStorage.
// Reason: localStorage is readable by any JavaScript on the page, so an XSS
// bug would leak the token. In-memory means a page refresh logs you out,
// which we accept for a project of this scope. AuthContext re-hydrates from
// a short-lived check on load.
let authToken = null;

export function setToken(token) {
  authToken = token;
}

export function getToken() {
  return authToken;
}

// Core request function. Everything else is a thin wrapper over this.
async function request(path, { method = "GET", body, isForm = false } = {}) {
  const headers = {};
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

  let payload;
  if (isForm) {
    // The /auth/token endpoint expects form-encoded data (OAuth2 spec),
    // not JSON. This branch handles that one case.
    payload = new URLSearchParams(body).toString();
    headers["Content-Type"] = "application/x-www-form-urlencoded";
  } else if (body !== undefined) {
    payload = JSON.stringify(body);
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${BASE}${path}`, { method, headers, body: payload });

  // 204 No Content has no body to parse.
  if (res.status === 204) return null;

  let data;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    // FastAPI puts the message in `detail`. Normalise it into an Error so
    // every caller can just catch and read err.message.
    const message =
      (data && data.detail) ||
      (typeof data === "string" ? data : `Request failed (${res.status})`);
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  return data;
}

// Download a binary file (the PDF / Excel reports). fetch returns a blob,
// we turn it into a temporary object URL and trigger a browser download.
async function download(path, filename) {
  const res = await fetch(`${BASE}${path}`, {
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
  });
  if (!res.ok) throw new Error(`Download failed (${res.status})`);

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// The public API surface, grouped by domain. Components call api.auth.login(),
// api.recommendations.list(), etc - they never touch fetch directly.
export const api = {
  auth: {
    register: (data) => request("/auth/register", { method: "POST", body: data }),
    login: (email, password) =>
      request("/auth/token", {
        method: "POST",
        isForm: true,
        body: { username: email, password },
      }),
    me: () => request("/auth/me"),
  },
  profile: {
    get: () => request("/profiles/me"),
    create: (data) => request("/profiles/me", { method: "POST", body: data }),
    update: (data) => request("/profiles/me", { method: "PATCH", body: data }),
  },
  recommendations: {
    list: (topK = 10, method = "hybrid") =>
      request(`/recommendations?top_k=${topK}&method=${method}`),
    explain: (topK = 5) => request(`/recommendations/explain?top_k=${topK}`),
    compare: (topK = 10) => request(`/recommendations/compare?top_k=${topK}`),
  },
  trends: {
    pubsPerYear: () => request("/trends/publications-per-year"),
    topTopics: (n = 15) => request(`/trends/top-topics?limit=${n}`),
    openAccess: () => request("/trends/open-access"),
    topCountries: (n = 12) => request(`/trends/top-countries?limit=${n}`),
    citations: () => request("/trends/citations"),
  },
  patents: {
    volumeByYear: () => request("/patents/volume-by-year"),
    topApplicants: (n = 15) => request(`/patents/top-applicants?limit=${n}`),
    topCpc: (n = 15) => request(`/patents/top-cpc?limit=${n}`),
    jurisdictions: (n = 10) => request(`/patents/jurisdictions?limit=${n}`),
    jurisdictionShare: (n = 5) => request(`/patents/jurisdiction-share?top_n=${n}`),
  },
  score: {
    me: () => request("/score/me"),
    compute: () => request("/score/me", { method: "POST" }),
    history: () => request("/score/history"),
  },
  commercialization: {
    me: () => request("/commercialization/me"),
  },
  reports: {
    excel: () => download("/reports/excel", "rfiip_report.xlsx"),
    pdf: () => download("/reports/pdf", "rfiip_report.pdf"),
  },
};
