import axios from 'axios';

const TOKEN_KEY = 'dineflow.token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

/** Single axios instance. Base URL is /api (Vite proxies it to the gateway). */
const client = axios.create({ baseURL: '/api' });

// Attach the admin token to every request when present.
client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** Turns an axios error into a readable message from the backend's ErrorResponse. */
export function toMessage(error, fallback = 'Something went wrong') {
  const data = error?.response?.data;
  if (data?.fieldErrors) {
    return Object.values(data.fieldErrors).join(', ');
  }
  return data?.message || error?.message || fallback;
}

export default client;
