import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Plus } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';

const fallbackImage = 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85';

function FoodCard({ dish, index, onSelect, onAdd, onFoodHover, onFoodLeave, onFoodTap }) {
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const handleAdd = (event) => {
    event.stopPropagation();
    setAdded(true);
    addItem(dish);
    onAdd?.(dish);
    window.setTimeout(() => setAdded(false), 1200);
  };

  const handleImageError = (event) => {
    if (event.currentTarget.src !== fallbackImage) {
      event.currentTarget.src = fallbackImage;
    }
  };

  return (
    <motion.article
      className="dish-card menu-dish-card"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay: index * 0.08 }}
      onClick={(event) => {
        onFoodTap?.(dish, event.currentTarget);
        onSelect?.(dish);
      }}
      onMouseEnter={(event) => onFoodHover?.(dish, event.currentTarget)}
      onMouseLeave={() => onFoodLeave?.(dish)}
      onPointerEnter={(event) => {
        if (event.pointerType === 'touch') onFoodTap?.(dish, event.currentTarget);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse') onFoodLeave?.(dish);
      }}
      onFocus={(event) => onFoodHover?.(dish, event.currentTarget)}
      onBlur={() => onFoodLeave?.(dish)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          onFoodTap?.(dish, event.currentTarget);
          onSelect?.(dish);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${dish.name}`}
      data-food-id={dish.id}
      data-food-category={dish.category}
    >
      <div className="dish-image-wrap">
        <img
          src={dish.image}
          alt={dish.name}
          className="dish-image"
          loading="lazy"
          onError={handleImageError}
        />
        <span className="dish-category">{dish.category}</span>
        {dish.originalPrice && (
          <span className="discount-badge">
            Save ₹{dish.originalPrice - dish.price}
          </span>
        )}
        <span className={`food-type ${dish.foodType}`} title={dish.foodType === 'veg' ? 'Vegetarian' : 'Non-vegetarian'}>
          <i />
        </span>
      </div>
      <div className="dish-content">
        <div className="dish-heading">
          <h3>{dish.name}</h3>
          <div className="dish-price-wrap">
            {dish.originalPrice && <span className="dish-original-price">₹{dish.originalPrice}</span>}
            <span className="dish-price">₹{dish.price}</span>
          </div>
        </div>
        <p>{dish.description}</p>
        <motion.button
          className="add-button"
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={handleAdd}
          aria-label={`Add ${dish.name} to cart`}
        >
          {added ? <Check size={17} /> : <Plus size={17} />}
          {added ? 'Added' : 'Add to order'}
        </motion.button>
      </div>
    </motion.article>
  );
}

export default FoodCard;