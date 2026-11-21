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

export const getFoodMascotReaction = (food, context = {}) => {
  if (!food) return { emotion: 'CURIOUS', duration: 900 };

  const category = String(food.category || '').toLowerCase();
  const name = String(food.name || '').toLowerCase();
  const featured = Boolean(food.featured || food.isFeatured || food.isSpecial);
  const popular = Boolean(food.isPopular || food.popular || context.popular);
  const premium = Number(food.price) >= 30 || name.includes('truffle') || name.includes('lobster');
  const firstItemInteraction = context.firstInteraction === true;

  if (firstItemInteraction) return { emotion: 'CURIOUS', duration: 1200 };
  if (popular || featured) return { emotion: 'LOVE', duration: 1800 };
  if (premium || category === 'pizza') return { emotion: 'EXCITED', duration: 1600 };
  if (category === 'desserts') return { emotion: 'LOVE', duration: 1500 };
  if (category === 'beverages') return { emotion: 'HAPPY', duration: 1100 };
  return { emotion: 'HAPPY', duration: 1100 };
};