import { apiRequest } from './api.js';

export const tableService = {
  validate(identifier) {
    return apiRequest(`/tables/validate/${encodeURIComponent(identifier)}`);
  },
  list(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') query.set(key, value);
    });
    const suffix = query.toString() ? `?${query}` : '';
    return apiRequest(`/tables${suffix}`);
  },
  create(payload) {
    return apiRequest('/tables', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  update(id, payload) {
    return apiRequest(`/tables/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
  getQr(id) {
    return apiRequest(`/tables/${encodeURIComponent(id)}/qr`);
  },
};
