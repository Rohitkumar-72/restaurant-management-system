import { createContext, lazy, Suspense, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

const Mascot = lazy(() => import('../components/mascot/Mascot.jsx'));

const MascotReactionContext = createContext(null);

const reactionMap = {
  CART_ITEM_ADDED: ['HAPPY', 1100],
  CART_FIRST_ITEM_ADDED: ['EXCITED', 1500],
  CART_VALUE_REACTION: ['EXCITED', 1200],
  CART_QUANTITY_INCREASED: ['HAPPY', 900],
  CART_QUANTITY_DECREASED: ['THINKING', 900],
  CART_ITEM_REMOVED: ['SAD', 900],
  CART_EMPTY: ['SURPRISED', 1000],
  CART_OPENED: ['CURIOUS', 1200],
  CART_CLOSED: ['IDLE', null],
  CHECKOUT_STARTED: ['THINKING', 2500],
  CHECKOUT_CANCELLED: ['CURIOUS', 900],
  ORDER_SUCCESS: ['CELEBRATING', 3000],
};

export function MascotReactionProvider({ children }) {
  const location = useLocation();
  const mascotRef = useRef(null);
  const targetRef = useRef({ x: 0, y: 0, active: false, lean: 0 });
  const previousPathRef = useRef(location.pathname);
  const [activeReaction, setActiveReaction] = useState('IDLE');

  const react = useCallback((type) => {
    const reaction = reactionMap[type];
    if (!reaction) return;
    const [emotion, duration] = reaction;
    mascotRef.current?.setEmotion?.(emotion, duration);
    setActiveReaction(emotion);
  }, []);

  useEffect(() => {
    const handleReaction = (event) => react(event.detail?.type);
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

  const value = useMemo(() => ({
    mascotRef,
    targetRef,
    activeReaction,
  }), [activeReaction]);

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
