import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar.jsx';
import AdminNavbar from '../components/admin/AdminNavbar.jsx';
import '../styles/admin.css';

function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className={`admin-shell${collapsed ? ' sidebar-collapsed' : ''}`}>
      <AdminSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCollapse={() => setCollapsed((value) => !value)}
        onMobileClose={() => setMobileOpen(false)}
      />
      {mobileOpen && (
        <button
          type="button"
          className="admin-mobile-overlay"
          aria-label="Close admin navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div className="admin-main">
        <AdminNavbar onMenu={() => setMobileOpen(true)} />
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;