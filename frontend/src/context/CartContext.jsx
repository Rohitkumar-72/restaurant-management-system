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

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (dish) => {
    if (!dish?.id) return;
    setItems((current) => {
      const existing = current.find((item) => item.foodId === dish.id);
      if (existing) {
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
    setItems((current) => current.filter((item) => item.foodId !== foodId));
  };

  const updateQuantity = (foodId, quantity) => {
    const nextQuantity = Number(quantity);
    if (!Number.isInteger(nextQuantity)) return;
    if (nextQuantity <= 0) {
      removeItem(foodId);
      return;
    }
    setItems((current) => current.map((item) =>
      item.foodId === foodId
        ? { ...item, quantity: Math.min(nextQuantity, MAX_QUANTITY) }
        : item
    ));
  };

  const increaseQuantity = (foodId) => {
    setItems((current) => current.map((item) =>
      item.foodId === foodId
        ? { ...item, quantity: Math.min(item.quantity + 1, MAX_QUANTITY) }
        : item
    ));
  };

  const decreaseQuantity = (foodId) => {
    setItems((current) => current.flatMap((item) => {
      if (item.foodId !== foodId) return [item];
      if (item.quantity <= 1) return [];
      return [{ ...item, quantity: item.quantity - 1 }];
    }));
  };

  const clearCart = () => setItems([]);

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