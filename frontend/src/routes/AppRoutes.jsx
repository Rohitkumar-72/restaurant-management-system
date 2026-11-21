import { Routes, Route } from 'react-router-dom';
import CustomerLayout from '../layouts/CustomerLayout.jsx';
import Home from '../pages/customer/Home.jsx';
import Menu from '../pages/customer/Menu.jsx';
import Cart from '../pages/customer/Cart.jsx';
import Checkout from '../pages/customer/Checkout.jsx';
import OrderSuccess from '../pages/customer/OrderSuccess.jsx';
import AdminLayout from '../layouts/AdminLayout.jsx';
import Dashboard from '../pages/admin/Dashboard.jsx';
import AdminOrders from '../pages/admin/Orders.jsx';
import AdminMenuManagement from '../pages/admin/MenuManagement.jsx';
import AdminCategories from '../pages/admin/Categories.jsx';
import AdminCustomers from '../pages/admin/Customers.jsx';
import AdminAnalytics from '../pages/admin/AdminAnalytics.jsx';
import AdminSettings from '../pages/admin/Settings.jsx';
import AdminLogin from '../pages/admin/AdminLogin.jsx';
import ProtectedRoute from '../components/common/ProtectedRoute.jsx';
import TrackOrder from '../pages/customer/TrackOrder.jsx';

function AppRoutes() {
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-confirmation" element={<OrderSuccess />} />
        <Route path="/track-order/:orderNumber" element={<TrackOrder />} />
        <Route path="*" element={<Home />} />
      </Route>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="menu-management" element={<AdminMenuManagement />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default AppRoutes;