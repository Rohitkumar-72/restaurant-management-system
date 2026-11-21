import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'sapphire-vista-cart';
const MAX_QUANTITY = 99;

const getValidCart = (value) => {
  if (!Array.isArray(value)) return [];
  return value.filter((item) =>
    item &&
    typeof item.foodId === 'string' &&
    typeof item.name === 'string' &&
    typeof item.unitPrice === 'number' &&
    Number.isFinite(item.unitPrice) &&
    item.unitPrice >= 0 &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0 &&
    item.quantity <= MAX_QUANTITY
  ).map((item) => ({
    foodId: item.foodId,
    name: item.name,
    description: typeof item.description === 'string' ? item.description : '',
    category: typeof item.category === 'string' ? item.category : '',
    image: typeof item.image === 'string' ? item.image : '',
    foodType: item.foodType === 'non-veg' ? 'non-veg' : 'veg',
    unitPrice: item.unitPrice,
    originalPrice: typeof item.originalPrice === 'number' && item.originalPrice > item.unitPrice
      ? item.originalPrice
      : null,
    quantity: item.quantity,
  }));
};

const loadCart = () => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? getValidCart(JSON.parse(stored)) : [];
  } catch {
    return [];
  }
};

const emitMascotReaction = (type, detail = {}) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('sapphire-mascot-reaction', {
    detail: { type, ...detail },
  }));
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (dish) => {
    if (!dish?.id) return;
    const existing = items.find((item) => item.foodId === dish.id);
    const wasEmpty = items.length === 0;
    const nextCount = existing ? items.reduce((count, item) => count + item.quantity, 0) + 1 : items.reduce((count, item) => count + item.quantity, 0) + 1;
    if (wasEmpty) {
      emitMascotReaction('CART_FIRST_ITEM_ADDED', { foodId: dish.id });
    } else if (nextCount >= 5) {
      emitMascotReaction('CART_VALUE_REACTION', { itemCount: nextCount });
    } else {
      emitMascotReaction('CART_ITEM_ADDED', { foodId: dish.id });
    }
    setItems((current) => {
      const currentExisting = current.find((item) => item.foodId === dish.id);
      if (currentExisting) {
        return current.map((item) => item.foodId === dish.id
          ? { ...item, quantity: Math.min(item.quantity + 1, MAX_QUANTITY) }
          : item);
      }

      return [
        ...current,
        {
          foodId: dish.id,
          name: dish.name,
          description: dish.description || '',
          category: dish.category || '',
          image: dish.image || '',
          foodType: dish.foodType || 'veg',
          unitPrice: Number(dish.price),
          originalPrice: typeof dish.originalPrice === 'number' ? dish.originalPrice : null,
          quantity: 1,
        },
      ];
    });
  };

  const removeItem = (foodId) => {
    const removing = items.find((item) => item.foodId === foodId);
    if (removing) {
      const remainingCount = items.reduce((count, item) =>
        count + (item.foodId === foodId ? 0 : item.quantity), 0);
      emitMascotReaction(
        remainingCount === 0 ? 'CART_EMPTY' : 'CART_ITEM_REMOVED',
        { foodId },
      );
    }
    setItems((current) => current.filter((item) => item.foodId !== foodId));
  };

  const updateQuantity = (foodId, quantity) => {
    const nextQuantity = Number(quantity);
    if (!Number.isInteger(nextQuantity)) return;
    if (nextQuantity <= 0) {
      removeItem(foodId);
      return;
    }
    const current = items.find((item) => item.foodId === foodId);
    if (current) {
      if (nextQuantity > current.quantity) {
        emitMascotReaction('CART_QUANTITY_INCREASED', { foodId });
      } else if (nextQuantity < current.quantity) {
        emitMascotReaction('CART_QUANTITY_DECREASED', { foodId });
      }
    }
    setItems((current) => current.map((item) =>
      item.foodId === foodId
        ? { ...item, quantity: Math.min(nextQuantity, MAX_QUANTITY) }
        : item
    ));
  };

  const increaseQuantity = (foodId) => {
    if (items.some((item) => item.foodId === foodId && item.quantity < MAX_QUANTITY)) {
      emitMascotReaction('CART_QUANTITY_INCREASED', { foodId });
    }
    setItems((current) => current.map((item) =>
      item.foodId === foodId
        ? { ...item, quantity: Math.min(item.quantity + 1, MAX_QUANTITY) }
        : item
    ));
  };

  const decreaseQuantity = (foodId) => {
    const decreasing = items.find((item) => item.foodId === foodId);
    if (decreasing) {
      const remainingCount = items.reduce((count, item) =>
        count + (item.foodId === foodId ? 0 : item.quantity), 0);
      emitMascotReaction(
        decreasing.quantity <= 1
          ? (remainingCount === 0 ? 'CART_EMPTY' : 'CART_ITEM_REMOVED')
          : 'CART_QUANTITY_DECREASED',
        { foodId },
      );
    }
    setItems((current) => current.flatMap((item) => {
      if (item.foodId !== foodId) return [item];
      if (item.quantity <= 1) return [];
      return [{ ...item, quantity: item.quantity - 1 }];
    }));
  };

  const clearCart = () => {
    if (items.length > 0) emitMascotReaction('CART_EMPTY');
    setItems([]);
  };

  const totals = useMemo(() => {
    const currentSubtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const originalSubtotal = items.reduce((sum, item) =>
      sum + (item.originalPrice || item.unitPrice) * item.quantity, 0);
    const discount = Math.max(0, originalSubtotal - currentSubtotal);

    return {
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: currentSubtotal,
      discount,
      total: currentSubtotal,
    };
  }, [items]);

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    ...totals,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}