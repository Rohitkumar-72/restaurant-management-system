import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';

function CartButton({ className = 'icon-button cart-button' }) {
  const { itemCount } = useCart();
  return (
    <Link className={className} to="/cart" aria-label={`Open cart with ${itemCount} items`}>
      <ShoppingBag size={19} strokeWidth={1.7} />
      {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
    </Link>
  );
}

export default CartButton;