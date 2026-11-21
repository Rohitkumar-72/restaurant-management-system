import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

function OrderSuccess() {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) {
    return (
      <div className="confirmation-page page-with-header">
        <section className="confirmation-empty section-shell">
          <p className="eyebrow">Demo order</p>
          <h1>No confirmation available</h1>
          <Link className="primary-button" to="/menu">Browse menu</Link>
        </section>
      </div>
    );
  }

  return (
    <div className="confirmation-page page-with-header">
      <motion.section
        className="confirmation-card section-shell"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="demo-label">ORDER CONFIRMED</div>
        <div className="confirmation-success">
          <span><Check size={26} /></span>
          <p className="eyebrow">Live order confirmation</p>
          <h1>Thank you, {order.customer.name}.</h1>
        </div>

        <div className="confirmation-details">
          <div>
            <span>Order ID</span>
            <strong>{order.orderNumber || order.orderId}</strong>
          </div>
          <div>
            <span>Order type</span>
            <strong>{order.orderType === 'dine-in' ? 'Dine-in' : 'Takeaway'}</strong>
          </div>
          {order.tableNumber && (
            <div>
              <span>Table</span>
              <strong>{order.tableNumber}</strong>
            </div>
          )}
          <div>
            <span>Created</span>
            <strong>{new Date(order.createdAt).toLocaleString()}</strong>
          </div>
          <div>
            <span>Payment</span>
            <strong>{order.paymentStatus || (order.status === 'demo' ? 'Demo' : 'Pending')}</strong>
          </div>
        </div>

        <div className="confirmation-items">
          {order.items.map((item) => (
            <div className="confirmation-item" key={item.foodId}>
              <img src={item.image} alt="" />
              <div>
                <strong>{item.name}</strong>
                <span>Quantity {item.quantity}</span>
              </div>
              <strong>${item.itemTotal.toFixed(2)}</strong>
            </div>
          ))}
        </div>

        <div className="confirmation-totals">
          {order.discount > 0 && <div><span>Discount</span><strong>-${order.discount.toFixed(2)}</strong></div>}
          <div><span>Total</span><strong>${order.total.toFixed(2)}</strong></div>
        </div>

        {order.orderNumber && (
          <Link
            className="primary-button"
            to={`/track-order/${order.orderNumber}?mobile=${encodeURIComponent(order.customer.mobile)}&token=${encodeURIComponent(order.trackingToken || '')}`}
          >
            Track this order <ArrowRight size={18} />
          </Link>
        )}
        <Link className="primary-button" to="/menu">
          Continue browsing <ArrowRight size={18} />
        </Link>
      </motion.section>
    </div>
  );
}

export default OrderSuccess;