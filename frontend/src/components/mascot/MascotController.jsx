import { useCallback, useEffect, useRef, useState } from 'react';
import { normalizeMascotEmotion } from '../../utils/mascotReactions.js';

export function useMascotEmotion(initialEmotion = 'IDLE') {
  const [emotion, setEmotionState] = useState(normalizeMascotEmotion(initialEmotion));
  const emotionRef = useRef({ name: normalizeMascotEmotion(initialEmotion), changedAt: performance.now() });
  const timerRef = useRef(null);

  const setEmotion = useCallback((emotionName, duration) => {
    const nextEmotion = normalizeMascotEmotion(emotionName);
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    emotionRef.current = { name: nextEmotion, changedAt: performance.now() };
    setEmotionState(nextEmotion);

    if (typeof duration === 'number' && Number.isFinite(duration) && duration > 0) {
      timerRef.current = window.setTimeout(() => {
        emotionRef.current = { name: 'IDLE', changedAt: performance.now() };
        setEmotionState('IDLE');
        timerRef.current = null;
      }, duration);
    }
  }, []);

  useEffect(() => {
    setEmotion(initialEmotion);
  }, [initialEmotion, setEmotion]);

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  return { emotion, emotionRef, setEmotion };
}