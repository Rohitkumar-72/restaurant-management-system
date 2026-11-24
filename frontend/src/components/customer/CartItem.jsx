import { Minus, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const fallbackImage = 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85';

function CartItem({ item, onIncrease, onDecrease, onUpdate, onRemove }) {
  const handleImageError = (event) => {
    if (event.currentTarget.src !== fallbackImage) event.currentTarget.src = fallbackImage;
  };

  return (
    <motion.article
      className="cart-item"
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <img src={item.image} alt={item.name} onError={handleImageError} />
      <div className="cart-item-info">
        <p className="eyebrow">{item.category}</p>
        <h3>{item.name}</h3>
        <div className="cart-unit-price">
          {item.originalPrice && <span>₹{item.originalPrice}</span>}
          <strong>₹{item.unitPrice}</strong>
        </div>
      </div>
      <div className="cart-item-actions">
        <div className="quantity-control" aria-label={`Quantity for ${item.name}`}>
          <button type="button" onClick={() => onDecrease(item.foodId)} aria-label={`Decrease ${item.name} quantity`}>
            <Minus size={15} />
          </button>
          <input
            type="number"
            min="1"
            max="99"
            value={item.quantity}
            onChange={(event) => onUpdate(item.foodId, event.target.value)}
            aria-label={`${item.name} quantity`}
          />
          <button type="button" onClick={() => onIncrease(item.foodId)} aria-label={`Increase ${item.name} quantity`}>
            <Plus size={15} />
          </button>
        </div>
        <strong className="cart-item-total">₹{(item.unitPrice * item.quantity).toFixed(2)}</strong>
        <button className="cart-remove" type="button" onClick={() => onRemove(item.foodId)} aria-label={`Remove ${item.name}`}>
          <Trash2 size={16} />
        </button>
      </div>
    </motion.article>
  );
}

export default CartItem;