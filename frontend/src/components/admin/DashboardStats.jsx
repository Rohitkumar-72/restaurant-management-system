import {
  ChefHat,
  CircleCheck,
  Clock3,
  DollarSign,
  ShoppingBag,
  UtensilsCrossed,
} from 'lucide-react';
import { motion } from 'framer-motion';

const icons = {
  ShoppingBag,
  DollarSign,
  Clock3,
  ChefHat,
  CircleCheck,
  UtensilsCrossed,
};

function DashboardStats({ stats }) {
  return (
    <div className="admin-stat-grid">
      {stats.map((stat, index) => {
        const Icon = icons[stat.icon];
        return (
          <motion.article
            className={`admin-stat-card ${stat.accent}`}
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, delay: index * 0.05 }}
            whileHover={{ y: -3 }}
          >
            <div className="admin-stat-icon"><Icon size={20} strokeWidth={1.7} /></div>
            <div>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
              <small>{stat.change}</small>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}

export default DashboardStats;