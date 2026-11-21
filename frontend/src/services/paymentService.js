import { apiRequest } from './api.js';

export const loadRazorpayCheckout = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.querySelector('script[data-razorpay-checkout]');
    if (existing) {
      existing.addEventListener('load', () => resolve(true), { once: true });
      existing.addEventListener('error', () => reject(new Error('Unable to load Razorpay Checkout')), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.dataset.razorpayCheckout = 'true';
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Unable to load Razorpay Checkout'));
    document.body.appendChild(script);
  });

export const paymentService = {
  getConfig() {
    return apiRequest('/payments/config');
  },
  createPaymentOrder(orderId) {
    return apiRequest(`/payments/create/${encodeURIComponent(orderId)}`, { method: 'POST' });
  },
  verifyPayment(payload) {
    return apiRequest('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  reportFailure(orderId, reason) {
    return apiRequest('/payments/failure', {
      method: 'POST',
      body: JSON.stringify({ orderId, reason }),
    });
  },
  refund(orderId, amount) {
    return apiRequest(`/payments/${encodeURIComponent(orderId)}/refund`, {
      method: 'POST',
      body: JSON.stringify(amount == null ? {} : { amount }),
    });
  },
};