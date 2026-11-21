import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { TableProvider } from './context/TableContext.jsx';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <TableProvider>
            <AppRoutes />
          </TableProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;