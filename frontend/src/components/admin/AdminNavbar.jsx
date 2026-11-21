import { useLocation } from 'react-router-dom';
import { Bell, Menu, Search } from 'lucide-react';

const titles = {
  '/admin': 'Dashboard',
  '/admin/orders': 'Orders',
  '/admin/menu-management': 'Menu Management',
  '/admin/categories': 'Categories',
  '/admin/customers': 'Customers',
  '/admin/analytics': 'Analytics',
  '/admin/settings': 'Settings',
};

function AdminNavbar({ onMenu }) {
  const location = useLocation();
  const date = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <header className="admin-topbar">
      <div className="admin-topbar-title">
        <button type="button" className="admin-mobile-menu" onClick={onMenu} aria-label="Open admin navigation">
          <Menu size={20} />
        </button>
        <div>
          <span>Restaurant</span>
          <h1>{titles[location.pathname] || 'Admin'}</h1>
        </div>
      </div>

      <div className="admin-topbar-actions">
        <label className="admin-search">
          <Search size={16} />
          <input type="search" placeholder="Search" aria-label="Admin search" />
        </label>
        <button type="button" className="admin-icon-button" aria-label="Notifications">
          <Bell size={18} />
          <span />
        </button>
        <div className="admin-profile">
          <span className="admin-avatar">A</span>
          <div>
            <strong>Admin</strong>
            <small>{date}</small>
          </div>
        </div>
      </div>
    </header>
  );
}

export default AdminNavbar;