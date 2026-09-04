import axios from 'axios';

const TOKEN_KEY = 'dineflow.token';

/** Base64url-decodes a JWT payload and returns its `exp` (seconds since epoch), or null. */
export function decodeExp(token) {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const exp = JSON.parse(json).exp;
    return typeof exp === 'number' ? exp : null;
  } catch {
    return null;
  }
}

/** True when the token is present and its `exp` is still in the future. */
export function isTokenValid(token) {
  if (!token) return false;
  const exp = decodeExp(token);
  return exp != null && exp * 1000 > Date.now();
}

export function getToken() {
  const token = localStorage.getItem(TOKEN_KEY);
  // Treat an expired/malformed token as absent, and clear it so it can't linger.
  if (token && !isTokenValid(token)) {
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
  return token;
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

// Notified whenever a request comes back 401 (expired/invalid session).
let onUnauthorized = null;
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

/** Single axios instance. Base URL is /api (Vite proxies it to the gateway). */
const client = axios.create({ baseURL: '/api' });

// Attach the admin token to every request when present.
client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// A 401 means the session is gone (expired or invalid) — clear it and notify.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      setToken(null);
      if (onUnauthorized) onUnauthorized();
    }
    return Promise.reject(error);
  },
);

/** Turns an axios error into a readable message from the backend's ErrorResponse. */
export function toMessage(error, fallback = 'Something went wrong') {
  const data = error?.response?.data;
  if (data?.fieldErrors) {
    return Object.values(data.fieldErrors).join(', ');
  }
  return data?.message || error?.message || fallback;
}

export default client;
