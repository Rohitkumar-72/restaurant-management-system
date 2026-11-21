import { forwardRef, useImperativeHandle } from 'react';
import MascotScene from './MascotScene.jsx';
import { useMascotEmotion } from './MascotController.jsx';

const Mascot = forwardRef(function Mascot({
  size = 'medium',
  interactive = true,
  animated = true,
  className = '',
  emotion: initialEmotion = 'IDLE',
  targetRef,
}, ref) {
  const { emotion, emotionRef, setEmotion } = useMascotEmotion(initialEmotion);

  useImperativeHandle(ref, () => ({
    setEmotion,
    getEmotion: () => emotion,
  }), [emotion, setEmotion]);

  return (
    <MascotScene
      size={size}
      interactive={interactive}
      animated={animated}
      className={className}
      emotionRef={emotionRef}
      targetRef={targetRef}
    />
  );
});

export default Mascot;