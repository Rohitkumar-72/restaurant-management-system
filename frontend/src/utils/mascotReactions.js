export const MASCOT_EMOTIONS = Object.freeze([
  'IDLE',
  'HAPPY',
  'EXCITED',
  'CURIOUS',
  'LOVE',
  'SURPRISED',
  'SAD',
  'SLEEPY',
  'CELEBRATING',
  'THINKING',
]);

export const normalizeMascotEmotion = (emotion) => {
  const normalized = typeof emotion === 'string' ? emotion.trim().toUpperCase() : '';
  return MASCOT_EMOTIONS.includes(normalized) ? normalized : 'IDLE';
};