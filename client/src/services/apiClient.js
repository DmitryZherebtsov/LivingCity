export async function apiClient(path, options = {}) {
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'; 
  const url = `${base}${path}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const res = await fetch(url, {
    headers: { ...defaultHeaders, ...(options.headers || {}) },
    credentials: options.credentials || 'same-origin', 
    ...options,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const message = text || res.statusText || `HTTP ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.body = text;
    throw err;
  }

  if (res.status === 204) return null;

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  return res.text();
}
