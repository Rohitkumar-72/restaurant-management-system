import { motion } from 'framer-motion';

function SalesChart({ data }) {
  const max = Math.max(...data.map((point) => point.revenue));
  const points = data.map((point, index) => ({
    ...point,
    x: 34 + index * 84,
    y: 170 - (point.revenue / max) * 132,
  }));
  const line = points.map((point) => `${point.x},${point.y}`).join(' ');
  const area = `34,170 ${line} 538,170`;

  return (
    <article className="admin-panel admin-sales-panel">
      <div className="admin-panel-heading">
        <div>
          <span>Sales overview</span>
          <strong>$130,560</strong>
        </div>
        <span className="admin-demo-label">Demo data</span>
      </div>
      <div className="admin-chart" role="img" aria-label="Sample revenue chart for the last seven days">
        <svg viewBox="0 0 572 190" preserveAspectRatio="none">
          {[38, 72, 106, 140, 170].map((y) => (
            <line key={y} x1="34" x2="538" y1={y} y2={y} className="admin-chart-grid" />
          ))}
          <motion.polygon
            points={area}
            className="admin-chart-area"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
          />
          <motion.polyline
            points={line}
            className="admin-chart-line"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
          {points.map((point) => (
            <g key={point.day} className="admin-chart-point">
              <circle cx={point.x} cy={point.y} r="5" />
              <title>{point.day}: ${point.revenue.toLocaleString()}</title>
            </g>
          ))}
        </svg>
        <div className="admin-chart-days">
          {data.map((point) => <span key={point.day}>{point.day}</span>)}
        </div>
      </div>
    </article>
  );
}

export default SalesChart;
