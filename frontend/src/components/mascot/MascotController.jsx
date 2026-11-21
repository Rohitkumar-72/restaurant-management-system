import { useCallback, useEffect, useRef, useState } from 'react';
import { normalizeMascotEmotion } from '../../utils/mascotReactions.js';
import { MASCOT_PRIORITY } from '../../utils/mascotReactions.js';

export function useMascotEmotion(initialEmotion = 'IDLE') {
  const [emotion, setEmotionState] = useState(normalizeMascotEmotion(initialEmotion));
  const emotionRef = useRef({ name: normalizeMascotEmotion(initialEmotion), changedAt: performance.now() });
  const timerRef = useRef(null);
  const activePriorityRef = useRef(MASCOT_PRIORITY.LOW);
  const stateChangedAtRef = useRef(performance.now());

  const setEmotion = useCallback((emotionName, duration, priority = MASCOT_PRIORITY.MEDIUM) => {
    const nextEmotion = normalizeMascotEmotion(emotionName);
    const requestedPriority = Number.isFinite(priority) ? priority : MASCOT_PRIORITY.MEDIUM;
    if (
      requestedPriority < activePriorityRef.current &&
      emotionRef.current.name !== 'IDLE'
    ) {
      return false;
    }
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    emotionRef.current = { name: nextEmotion, changedAt: performance.now() };
    stateChangedAtRef.current = performance.now();
    activePriorityRef.current = requestedPriority;
    setEmotionState(nextEmotion);

    if (typeof duration === 'number' && Number.isFinite(duration) && duration > 0) {
      timerRef.current = window.setTimeout(() => {
        emotionRef.current = { name: 'IDLE', changedAt: performance.now() };
        activePriorityRef.current = MASCOT_PRIORITY.LOW;
        stateChangedAtRef.current = performance.now();
        setEmotionState('IDLE');
        timerRef.current = null;
      }, duration);
    }
    return true;
  }, []);

  useEffect(() => {
    setEmotion(initialEmotion);
  }, [initialEmotion, setEmotion]);

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  return { emotion, emotionRef, setEmotion };
}