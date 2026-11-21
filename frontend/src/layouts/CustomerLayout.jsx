import { Outlet, ScrollRestoration } from 'react-router-dom';
import Navbar from '../components/common/Navbar.jsx';
import Footer from '../components/common/Footer.jsx';

function CustomerLayout() {
  return (
    <div className="customer-layout">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  );
}

export default CustomerLayout;