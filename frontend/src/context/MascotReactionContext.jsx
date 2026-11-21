import { createContext, lazy, Suspense, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getOrderStatusReaction, MASCOT_PRIORITY } from '../utils/mascotReactions.js';

const Mascot = lazy(() => import('../components/mascot/Mascot.jsx'));

const MascotReactionContext = createContext(null);

const reactionMap = {
  CART_ITEM_ADDED: ['HAPPY', 1100, MASCOT_PRIORITY.MEDIUM],
  CART_FIRST_ITEM_ADDED: ['EXCITED', 1500, MASCOT_PRIORITY.HIGH],
  CART_VALUE_REACTION: ['EXCITED', 1200, MASCOT_PRIORITY.HIGH],
  CART_QUANTITY_INCREASED: ['HAPPY', 900, MASCOT_PRIORITY.MEDIUM],
  CART_QUANTITY_DECREASED: ['THINKING', 900, MASCOT_PRIORITY.MEDIUM],
  CART_ITEM_REMOVED: ['SAD', 900, MASCOT_PRIORITY.MEDIUM],
  CART_EMPTY: ['SURPRISED', 1000, MASCOT_PRIORITY.MEDIUM],
  CART_OPENED: ['CURIOUS', 1200, MASCOT_PRIORITY.MEDIUM],
  CART_CLOSED: ['IDLE', null, MASCOT_PRIORITY.LOW],
  CHECKOUT_STARTED: ['THINKING', 2500, MASCOT_PRIORITY.HIGH],
  CHECKOUT_CANCELLED: ['CURIOUS', 900, MASCOT_PRIORITY.MEDIUM],
  ORDER_SUCCESS: ['CELEBRATING', 3000, MASCOT_PRIORITY.CRITICAL],
  FOOD_LEAVE: ['IDLE', null, MASCOT_PRIORITY.LOW],
};

export function MascotReactionProvider({ children }) {
  const location = useLocation();
  const mascotRef = useRef(null);
  const targetRef = useRef({ x: 0, y: 0, active: false, lean: 0 });
  const previousPathRef = useRef(location.pathname);
  const [activeReaction, setActiveReaction] = useState('IDLE');
  const orderReactionHistoryRef = useRef(new Map());
  const memoryRef = useRef({
    viewedFoods: new Set(),
    reactionHistory: [],
    firstCartItemAdded: false,
  });
  const cooldownRef = useRef(new Map());

  const rememberReaction = useCallback((key, emotion, priority) => {
    memoryRef.current.reactionHistory = [
      ...memoryRef.current.reactionHistory.slice(-11),
      { key, emotion, priority, at: Date.now() },
    ];
  }, []);

  const isReactionAllowed = useCallback((key, priority, at = Date.now()) => {
    if (priority >= MASCOT_PRIORITY.CRITICAL) return true;
    const last = cooldownRef.current.get(key);
    if (!last) return true;
    const cooldown =
      priority >= MASCOT_PRIORITY.HIGH ? 320 :
      priority >= MASCOT_PRIORITY.MEDIUM ? 650 :
      1100;
    return at - last >= cooldown;
  }, []);

  const markReaction = useCallback((key, at = Date.now()) => {
    cooldownRef.current.set(key, at);
  }, []);

  const react = useCallback((type, detail = {}) => {
    const reaction = reactionMap[type];
    if (!reaction) return;
    const [emotion, duration, priority] = reaction;
    const key = detail.key || type;
    if (!isReactionAllowed(key, priority)) return;
    const applied = mascotRef.current?.setEmotion?.(emotion, duration, priority);
    if (applied === false) return;
    markReaction(key);
    rememberReaction(key, emotion, priority);
    setActiveReaction(emotion);
  }, [isReactionAllowed, markReaction, rememberReaction]);

  const requestReaction = useCallback((emotion, duration = null, options = {}) => {
    const priority = options.priority || MASCOT_PRIORITY.MEDIUM;
    const key = options.key || emotion;
    if (!isReactionAllowed(key, priority)) return;
    const applied = mascotRef.current?.setEmotion?.(emotion, duration, priority);
    if (applied === false) return;
    markReaction(key);
    rememberReaction(key, emotion, priority);
    setActiveReaction(emotion);
  }, [isReactionAllowed, markReaction, rememberReaction]);

  const reactToOrderStatus = useCallback((orderId, status) => {
    if (!orderId || !status) return;
    const normalizedStatus = String(status).trim().toUpperCase();
    const previousStatus = orderReactionHistoryRef.current.get(String(orderId));
    if (previousStatus === normalizedStatus) return;
    orderReactionHistoryRef.current.set(String(orderId), normalizedStatus);
    const mapping = getOrderStatusReaction(normalizedStatus);
    if (!mapping) return;
    const [emotion, duration] = mapping;
    const critical = ['READY', 'SERVED', 'COMPLETED', 'SUCCESS', 'CANCELLED', 'REJECTED'].includes(normalizedStatus);
    const priority = critical
      ? MASCOT_PRIORITY.CRITICAL
      : normalizedStatus === 'PLACED' || normalizedStatus === 'PENDING'
        ? MASCOT_PRIORITY.HIGH
        : MASCOT_PRIORITY.MEDIUM;
    requestReaction(emotion, duration, {
      key: `order:${orderId}:${normalizedStatus}`,
      priority,
    });
  }, [requestReaction]);

  const clearOrderReactionHistory = useCallback((orderId) => {
    if (orderId) orderReactionHistoryRef.current.delete(String(orderId));
  }, []);

  useEffect(() => {
    const handleReaction = (event) => {
      if (event.detail?.emotion) {
        requestReaction(event.detail.emotion, event.detail.duration, {
          key: event.detail.key,
          priority: event.detail.priority,
        });
      } else {
        react(event.detail?.type, event.detail);
      }
    };
    window.addEventListener('sapphire-mascot-reaction', handleReaction);
    return () => window.removeEventListener('sapphire-mascot-reaction', handleReaction);
  }, [react]);

  useEffect(() => {
    const previous = previousPathRef.current;
    const current = location.pathname;

    if (previous !== '/cart' && current === '/cart') react('CART_OPENED');
    if (previous === '/cart' && current !== '/cart') react('CART_CLOSED');
    if (previous !== '/checkout' && current === '/checkout') react('CHECKOUT_STARTED');
    if (previous === '/checkout' && current !== '/checkout' && current !== '/order-confirmation') {
      react('CHECKOUT_CANCELLED');
    }
    previousPathRef.current = current;
  }, [location.pathname, react]);

  const rememberFood = useCallback((food) => {
    if (!food) return false;
    const foodId = food.id || food._id || food.slug || food.name;
    if (!foodId) return false;
    const first = !memoryRef.current.viewedFoods.has(String(foodId));
    memoryRef.current.viewedFoods.add(String(foodId));
    return first;
  }, []);

  const hasViewedFood = useCallback((food) => {
    const foodId = food?.id || food?._id || food?.slug || food?.name;
    return foodId ? memoryRef.current.viewedFoods.has(String(foodId)) : false;
  }, []);

  const rememberCartFirstItem = useCallback(() => {
    if (memoryRef.current.firstCartItemAdded) return false;
    memoryRef.current.firstCartItemAdded = true;
    return true;
  }, []);

  const value = useMemo(() => ({
    mascotRef,
    targetRef,
    activeReaction,
    reactToOrderStatus,
    clearOrderReactionHistory,
    requestReaction,
    rememberFood,
    hasViewedFood,
    rememberCartFirstItem,
    memoryRef,
  }), [activeReaction, reactToOrderStatus, clearOrderReactionHistory, requestReaction, rememberFood, hasViewedFood, rememberCartFirstItem]);

  const customerRoute = !location.pathname.startsWith('/admin');

  return (
    <MascotReactionContext.Provider value={value}>
      {children}
      {customerRoute && (
        <div className="site-mascot" aria-hidden="true">
          <Suspense fallback={<div className="mascot-canvas mascot-fallback"><span>SV</span></div>}>
            <Mascot
              ref={mascotRef}
              size="small"
              interactive
              animated
              targetRef={targetRef}
            />
          </Suspense>
        </div>
      )}
    </MascotReactionContext.Provider>
  );
}

export function useMascotReaction() {
  const context = useContext(MascotReactionContext);
  if (!context) throw new Error('useMascotReaction must be used within MascotReactionProvider');
  return context;
}
