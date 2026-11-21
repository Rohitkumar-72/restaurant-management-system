import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  QrCode,
  ReceiptText,
  Settings,
  Tags,
  UtensilsCrossed,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const navigation = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Orders', to: '/admin/orders', icon: ReceiptText },
  { label: 'Menu Management', to: '/admin/menu-management', icon: UtensilsCrossed },
  { label: 'Categories', to: '/admin/categories', icon: Tags },
  { label: 'Tables & QR', to: '/admin/tables', icon: QrCode },
  { label: 'Customers', to: '/admin/customers', icon: Users },
  { label: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
];

function AdminSidebar({ collapsed, mobileOpen, onCollapse, onMobileClose }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <aside className={`admin-sidebar${mobileOpen ? ' mobile-open' : ''}`}>
      <div className="admin-sidebar-brand">
        <Link to="/admin" className="admin-brand" onClick={onMobileClose}>
          <span className="admin-brand-mark">SV</span>
          {!collapsed && (
            <span>
              <strong>Sapphire Vista</strong>
              <small>Restaurant Management</small>
            </span>
          )}
        </Link>
        <button
          type="button"
          className="admin-collapse"
          onClick={onCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="admin-nav" aria-label="Admin navigation">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              onClick={onMobileClose}
              className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={19} strokeWidth={1.7} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <button type="button" className="admin-logout" onClick={handleLogout} aria-label="Logout">
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </aside>
  );
}

export default AdminSidebar;