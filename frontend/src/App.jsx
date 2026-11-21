import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { TableProvider } from './context/TableContext.jsx';
import { MascotReactionProvider } from './context/MascotReactionContext.jsx';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <TableProvider>
            <MascotReactionProvider>
              <AppRoutes />
            </MascotReactionProvider>
          </TableProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;