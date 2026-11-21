import { TrendingUp } from 'lucide-react';

function PopularItems({ items }) {
  return (
    <article className="admin-panel popular-items-panel">
      <div className="admin-panel-heading">
        <div><span>Popular items</span><strong>Top performers</strong></div>
        <TrendingUp size={18} />
      </div>
      <div className="popular-items-list">
        {items.map((item, index) => (
          <div className="popular-item" key={item.name}>
            <span className="popular-rank">0{index + 1}</span>
            <img src={item.image} alt="" />
            <div>
              <strong>{item.name}</strong>
              <span>{item.category} · {item.orders} orders</span>
            </div>
            <b>{item.revenue}</b>
          </div>
        ))}
      </div>
    </article>
  );
}

export default PopularItems;
