import { useCallback, useEffect, useState } from 'react';
import { orderService } from '../services/orderService.js';

export function useOrders(initialStatus = '') {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await orderService.listOrders({ status: initialStatus });
      setOrders(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError(requestError.message || 'Unable to load orders');
    } finally {
      setLoading(false);
    }
  }, [initialStatus]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { orders, loading, error, refresh, setOrders };
}