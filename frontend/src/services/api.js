const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

export class ApiServiceError extends Error {
  constructor(message, status = 0, data = null) {
    super(message);
    this.name = 'ApiServiceError';
    this.status = status;
    this.data = data;
  }
}

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path.startsWith('/') ? path : `/${path}`}`, {
    ...options,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new ApiServiceError(
      payload?.message || 'Unable to communicate with the server',
      response.status,
      payload?.data || null,
    );
  }

  if (!payload?.success) {
    throw new ApiServiceError(payload?.message || 'The server returned an invalid response');
  }

  return payload.data;
}