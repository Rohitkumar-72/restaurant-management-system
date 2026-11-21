import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, PackageCheck, UtensilsCrossed } from 'lucide-react';
import { useParams, useSearchParams } from 'react-router-dom';
import { orderService } from '../../services/orderService.js';
import { useSocket } from '../../hooks/useSocket.js';

const stages = ['PLACED', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED'];

function TrackOrder() {
  const { orderNumber } = useParams();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { socket, connected } = useSocket();
  const mobile = searchParams.get('mobile') || '';
  const token = searchParams.get('token') || '';

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await orderService.trackOrder(orderNumber, mobile, token);
        if (active) setOrder(data);
      } catch (requestError) {
        if (active) setError(requestError.message || 'Unable to load order');
      } finally {
        if (active) setLoading(false);
      }
    };
    if (orderNumber && mobile && token) load();
    else {
      setError('Order number, mobile number, and tracking link are required.');
      setLoading(false);
    }
    return () => { active = false; };
  }, [orderNumber, mobile, token]);

  useEffect(() => {
    if (!socket || !order) return undefined;
    const handleStatus = (updated) => setOrder(updated);
    socket.emit('order:track', { orderId: order._id, trackingToken: token, mobile });
    socket.on('order:status-changed', handleStatus);
    socket.on('order:tracking-error', (details) => setError(details.message));
    return () => {
      socket.off('order:status-changed', handleStatus);
      socket.off('order:tracking-error');
    };
  }, [socket, order, token, mobile]);

  if (loading) {
    return <main className="tracking-page"><section className="tracking-shell"><p>Loading order status...</p></section></main>;
  }
  if (error) {
    return <main className="tracking-page"><section className="tracking-shell"><h1>Unable to track order</h1><p>{error}</p></section></main>;
  }

  const currentIndex = stages.indexOf(order.orderStatus);

  return (
    <main className="tracking-page">
      <motion.section className="tracking-shell" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="tracking-heading">
          <div>
            <p className="eyebrow">Live order status</p>
            <h1>{order.orderNumber}</h1>
          </div>
          <span className={connected ? 'tracking-live connected' : 'tracking-live'}>{connected ? 'Live' : 'API fallback'}</span>
        </div>

        <div className="tracking-summary">
          <div><span>Order type</span><strong>{order.orderType === 'dine-in' ? 'Dine-in' : 'Takeaway'}</strong></div>
          {order.tableNumber && <div><span>Table</span><strong>{order.tableNumber}</strong></div>}
          <div><span>Payment</span><strong>{order.paymentStatus}</strong></div>
          <div><span>Estimated time</span><strong>{order.estimatedMinutes || 25} min</strong></div>
        </div>

        <div className="tracking-timeline" aria-label={`Order status: ${order.orderStatus}`}>
          {stages.map((stage, index) => {
            const completed = ['CANCELLED', 'REJECTED'].includes(order.orderStatus)
              ? false
              : index <= currentIndex;
            return (
              <div className={completed ? 'tracking-stage completed' : 'tracking-stage'} key={stage}>
                <span>{completed ? <Check size={15} /> : index + 1}</span>
                <strong>{stage.charAt(0) + stage.slice(1).toLowerCase()}</strong>
              </div>
            );
          })}
        </div>

        {['CANCELLED', 'REJECTED'].includes(order.orderStatus) && (
          <div className="tracking-alert">{order.orderStatus}: {order.rejectionReason || 'The restaurant updated this order.'}</div>
        )}

        <div className="tracking-items">
          {order.items.map((item) => (
            <div key={item.foodId}>
              <span><UtensilsCrossed size={16} /></span>
              <div><strong>{item.name}</strong><small>Quantity {item.quantity}</small></div>
              <strong>${item.itemTotal.toFixed(2)}</strong>
            </div>
          ))}
        </div>
        <div className="tracking-total"><span>Total</span><strong>${order.total.toFixed(2)}</strong></div>
      </motion.section>
    </main>
  );
}

export default TrackOrder;