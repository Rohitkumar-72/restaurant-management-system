import { apiRequest } from './api.js';

export const authService = {
  login(email, password) {
    return apiRequest('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  verifySession() {
    return apiRequest('/auth/admin/me');
  },
  logout() {
    return apiRequest('/auth/admin/logout', { method: 'POST' });
  },
};