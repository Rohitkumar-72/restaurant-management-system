import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

function ProtectedRoute() {
  const { admin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="admin-auth-loading" role="status">
        <span />
        <p>Verifying secure session</p>
      </div>
    );
  }

  if (!admin) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  if (admin.role !== 'admin') return <Navigate to="/admin/login" replace />;
  return <Outlet />;
}

export default ProtectedRoute;