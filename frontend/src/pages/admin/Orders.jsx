import { useEffect, useState } from 'react';
import { ReceiptText, Search } from 'lucide-react';
import { useOrders } from '../../hooks/useOrders.js';
import { useSocket } from '../../hooks/useSocket.js';
import { orderService } from '../../services/orderService.js';

function Orders() {
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const { orders, loading, error, refresh, setOrders } = useOrders(status);
  const { socket, connected } = useSocket();

  useEffect(() => {
    if (!socket) return undefined;
    const handleNew = (order) => setOrders((current) => [order, ...current.filter((item) => item._id !== order._id)]);
    const handleChanged = (order) => setOrders((current) => current.map((item) => item._id === order._id ? order : item));
    socket.on('order:new', handleNew);
    socket.on('order:status-changed', handleChanged);
    return () => {
      socket.off('order:new', handleNew);
      socket.off('order:status-changed', handleChanged);
    };
  }, [socket, setOrders]);

  const filtered = orders.filter((order) => {
    const matchesSearch = !search || order.orderNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !status || order.orderStatus === status;
    return matchesSearch && matchesStatus;
  });

  const updateStatus = async (order, nextStatus) => {
    try {
      const updated = await orderService.updateStatus(order._id, nextStatus);
      setOrders((current) => current.map((item) => item._id === order._id ? updated : item));
    } catch (requestError) {
      window.alert(requestError.message || 'Unable to update order');
    }
  };

  return (
    <section className="admin-orders-page">
      <div className="admin-orders-heading">
        <div>
          <p className="admin-demo-label">Live operations</p>
          <h1>Orders</h1>
        </div>
        <span className={connected ? 'admin-orders-live connected' : 'admin-orders-live'}>
          {connected ? 'Connected live' : 'API only'}
        </span>
      </div>

      <div className="admin-orders-tools">
        <label className="admin-orders-search">
          <Search size={16} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search order number" />
        </label>
        <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by status">
          <option value="">All statuses</option>
          {['PLACED', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED', 'REJECTED'].map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="admin-orders-empty">Loading live orders...</div>
      ) : error ? (
        <div className="admin-orders-empty"><p>{error}</p><button type="button" onClick={refresh}>Retry</button></div>
      ) : filtered.length === 0 ? (
        <div className="admin-orders-empty"><ReceiptText size={30} /><p>No orders match this view.</p></div>
      ) : (
        <div className="admin-order-grid">
          {filtered.map((order) => (
            <article className="admin-order-card" key={order._id}>
              <header>
                <div><span>Order</span><strong>{order.orderNumber}</strong></div>
                <span className={`admin-status status-${order.orderStatus.toLowerCase()}`}>{order.orderStatus}</span>
              </header>
              <div className="admin-order-customer">
                <strong>{order.customer.name}</strong>
                <span>{order.customer.mobile}</span>
                <span>{order.orderType === 'dine-in' ? `Table ${order.tableNumber || '-'}` : 'Takeaway'}</span>
              </div>
              <div className="admin-order-items">
                {order.items.map((item) => (
                  <div key={item.foodId}><span>{item.quantity}× {item.name}</span><strong>${item.itemTotal.toFixed(2)}</strong></div>
                ))}
              </div>
              {order.specialInstructions && <p className="admin-order-instructions">“{order.specialInstructions}”</p>}
              <footer>
                <strong>${order.total.toFixed(2)}</strong>
                <div>
                  {order.orderStatus === 'PLACED' && (
                    <>
                      <button type="button" onClick={() => updateStatus(order, 'CONFIRMED')}>Accept</button>
                      <button type="button" className="danger" onClick={() => updateStatus(order, 'REJECTED')}>Reject</button>
                    </>
                  )}
                  {order.orderStatus === 'CONFIRMED' && <button type="button" onClick={() => updateStatus(order, 'PREPARING')}>Start preparing</button>}
                  {order.orderStatus === 'PREPARING' && <button type="button" onClick={() => updateStatus(order, 'READY')}>Mark ready</button>}
                  {order.orderStatus === 'READY' && <button type="button" onClick={() => updateStatus(order, 'SERVED')}>Mark served</button>}
                  {order.orderStatus === 'SERVED' && <button type="button" onClick={() => updateStatus(order, 'COMPLETED')}>Complete</button>}
                </div>
              </footer>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default Orders;