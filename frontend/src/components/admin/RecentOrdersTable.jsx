function RecentOrdersTable({ orders }) {
  return (
    <article className="admin-panel recent-orders-panel">
      <div className="admin-panel-heading">
        <div><span>Recent orders</span><strong>Latest activity</strong></div>
        <a href="/admin/orders">View all</a>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Order Type</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td><strong>{order.id}</strong></td>
                <td>{order.customer}</td>
                <td>{order.items}</td>
                <td>{order.type}</td>
                <td><strong>{order.amount}</strong></td>
                <td><span className={`admin-status status-${order.status.toLowerCase()}`}>{order.status}</span></td>
                <td>{order.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

export default RecentOrdersTable;
