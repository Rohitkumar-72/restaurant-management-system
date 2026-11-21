import { apiRequest } from './api.js';

export const orderService = {
  createOrder(payload, idempotencyKey) {
    return apiRequest('/orders', {
      method: 'POST',
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
      body: JSON.stringify(payload),
    });
  },
  trackOrder(orderNumber, mobile, trackingToken) {
    const params = new URLSearchParams({ mobile, token: trackingToken });
    return apiRequest(`/orders/track/${encodeURIComponent(orderNumber)}?${params}`);
  },
  listOrders(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) query.set(key, value);
    });
    const suffix = query.toString() ? `?${query}` : '';
    return apiRequest(`/orders${suffix}`);
  },
  updateStatus(orderId, status, reason) {
    return apiRequest(`/orders/${encodeURIComponent(orderId)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    });
  },
};