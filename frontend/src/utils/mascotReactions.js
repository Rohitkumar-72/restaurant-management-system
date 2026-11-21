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

export const MASCOT_PRIORITY = Object.freeze({
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
});

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

export const getOrderStatusReaction = (status) => {
  const normalized = typeof status === 'string' ? status.trim().toUpperCase() : '';
  const mapping = {
    PLACED: ['EXCITED', 1400],
    PENDING: ['EXCITED', 1400],
    CONFIRMED: ['HAPPY', 1300],
    ACCEPTED: ['HAPPY', 1300],
    PREPARING: ['THINKING', 1600],
    PROCESSING: ['THINKING', 1600],
    READY: ['CELEBRATING', 2200],
    SERVED: ['LOVE', 1800],
    COMPLETED: ['LOVE', 1800],
    SUCCESS: ['LOVE', 1800],
    CANCELLED: ['SAD', 1200],
    REJECTED: ['SAD', 1200],
    DELAYED: ['THINKING', 1400],
  };
  return mapping[normalized] || null;
};