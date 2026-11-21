import { apiRequest } from './api.js';

const unwrapItems = (data) =>
  Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];

export const foodService = {
  async getFoods(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') query.set(key, String(value));
    });
    const suffix = query.toString() ? `?${query}` : '';
    return unwrapItems(await apiRequest(`/foods${suffix}`));
  },

  async getFoodById(id) {
    return apiRequest(`/foods/${encodeURIComponent(id)}`);
  },

  async getCategories() {
    const data = await apiRequest('/categories');
    return Array.isArray(data) ? data : [];
  },
};