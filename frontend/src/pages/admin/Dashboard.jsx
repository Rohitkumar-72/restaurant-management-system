import { motion } from 'framer-motion';
import { CalendarDays, Download } from 'lucide-react';
import DashboardStats from '../../components/admin/DashboardStats.jsx';
import SalesChart from '../../components/admin/SalesChart.jsx';
import RecentOrdersTable from '../../components/admin/RecentOrdersTable.jsx';
import PopularItems from '../../components/admin/PopularItems.jsx';
import QuickActions from '../../components/admin/QuickActions.jsx';
import {
  adminStats,
  popularItems,
  recentOrders,
  salesData,
} from '../../data/adminDashboardData.js';

function Dashboard() {
  const date = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  return (
    <motion.div
      className="admin-dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <section className="admin-welcome">
        <div>
          <p>Restaurant overview</p>
          <h1>Good afternoon, Admin</h1>
          <span>Here's what's happening at Sapphire Vista today.</span>
        </div>
        <div className="admin-welcome-actions">
          <span><CalendarDays size={16} /> {date}</span>
          <button type="button"><Download size={16} /> Export report</button>
        </div>
      </section>

      <DashboardStats stats={adminStats} />

      <div className="admin-dashboard-grid">
        <SalesChart data={salesData} />
        <PopularItems items={popularItems} />
      </div>

      <RecentOrdersTable orders={recentOrders} />
      <QuickActions />
    </motion.div>
  );
}

export default Dashboard;