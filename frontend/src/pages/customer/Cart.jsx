import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import CartItem from '../../components/customer/CartItem.jsx';
import CartSummary from '../../components/customer/CartSummary.jsx';
import { useCart } from '../../context/CartContext.jsx';

function Cart() {
  const {
    items,
    itemCount,
    subtotal,
    discount,
    total,
    increaseQuantity,
    decreaseQuantity,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  return (
    <div className="cart-page page-with-header">
      <section className="page-heading section-shell">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
          <p className="eyebrow">Your selection</p>
          <h1>Shopping Cart</h1>
        </motion.div>
        {items.length > 0 && (
          <Link className="continue-link" to="/menu">
            <ArrowLeft size={16} /> Continue shopping
          </Link>
        )}
      </section>

      {items.length === 0 ? (
        <motion.section
          className="cart-empty section-shell"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="cart-empty-icon"><ShoppingBag size={32} /></div>
          <h2>Your cart is empty</h2>
          <p>Explore the menu and choose something memorable.</p>
          <Link className="primary-button" to="/menu">Explore menu</Link>
        </motion.section>
      ) : (
        <section className="cart-layout section-shell">
          <div className="cart-items">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <CartItem
                  key={item.foodId}
                  item={item}
                  onIncrease={increaseQuantity}
                  onDecrease={decreaseQuantity}
                  onUpdate={updateQuantity}
                  onRemove={removeItem}
                />
              ))}
            </AnimatePresence>
          </div>
          <CartSummary
            subtotal={subtotal}
            discount={discount}
            total={total}
            itemCount={itemCount}
            onClear={clearCart}
          />
        </section>
      )}
    </div>
  );
}

export default Cart;