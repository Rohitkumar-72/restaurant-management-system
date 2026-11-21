import { useCallback, useEffect, useRef, useState } from 'react';
import { getFoodMascotReaction } from '../utils/mascotReactions.js';

export function useMascotFoodReaction(mascotRef) {
  const [activeFood, setActiveFood] = useState(null);
  const activeFoodRef = useRef(null);
  const visitedIdsRef = useRef(new Set());
  const leaveTimerRef = useRef(null);
  const targetRef = useRef({ x: 0, y: 0, active: false, lean: 0 });

  const clearLeaveTimer = useCallback(() => {
    if (leaveTimerRef.current) {
      window.clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
  }, []);

  const reactToFood = useCallback((food, cardElement, source = 'hover') => {
    if (!food) return;
    clearLeaveTimer();

    const foodId = food.id || food._id || food.slug || food.name;
    if (activeFoodRef.current?.id === foodId && source === 'hover') return;

    const firstInteraction = !visitedIdsRef.current.has(foodId);
    visitedIdsRef.current.add(foodId);
    const reaction = getFoodMascotReaction(food, { firstInteraction });

    if (mascotRef.current?.setEmotion) {
      mascotRef.current.setEmotion(reaction.emotion, reaction.duration);
    }

    let targetX = 0;
    let targetY = 0;
    if (cardElement) {
      const cardRect = cardElement.getBoundingClientRect();
      const mascotElement = document.querySelector('.menu-mascot canvas');
      if (mascotElement) {
        const mascotRect = mascotElement.getBoundingClientRect();
        targetX = ((cardRect.left + cardRect.width / 2) - (mascotRect.left + mascotRect.width / 2))
          / Math.max(window.innerWidth * 0.5, 1);
        targetY = ((cardRect.top + cardRect.height / 2) - (mascotRect.top + mascotRect.height / 2))
          / Math.max(window.innerHeight * 0.5, 1);
      }
    }

    targetRef.current = {
      x: Math.max(-1, Math.min(1, targetX)),
      y: Math.max(-0.65, Math.min(0.65, targetY)),
      active: true,
      lean: source === 'touch' ? 0.45 : 0.32,
    };
    const active = { id: foodId, name: food.name, reaction: reaction.emotion };
    activeFoodRef.current = active;
    setActiveFood(active);
  }, [clearLeaveTimer, mascotRef]);

  const leaveFood = useCallback((food) => {
    clearLeaveTimer();
    const foodId = food?.id || food?._id || food?.slug || food?.name;
    if (activeFoodRef.current?.id !== foodId) return;
    leaveTimerRef.current = window.setTimeout(() => {
      targetRef.current = { x: 0, y: 0, active: false, lean: 0 };
      activeFoodRef.current = null;
      setActiveFood(null);
      mascotRef.current?.setEmotion?.('IDLE');
      leaveTimerRef.current = null;
    }, 260);
  }, [clearLeaveTimer, mascotRef]);

  useEffect(() => () => clearLeaveTimer(), [clearLeaveTimer]);

  return {
    activeFood,
    targetRef,
    reactToFood,
    leaveFood,
  };
}
