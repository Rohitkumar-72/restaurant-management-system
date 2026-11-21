const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const { connectDatabase } = require('../config/database');
const Category = require('../models/Category');
const Food = require('../models/Food');

const categories = [
  { name: 'Starters', slug: 'starters', description: 'Elegant beginnings', displayOrder: 1, isActive: true },
  { name: 'Main Course', slug: 'main-course', description: 'Chef-led signatures', displayOrder: 2, isActive: true },
  { name: 'Pizza', slug: 'pizza', description: 'Wood-fired favorites', displayOrder: 3, isActive: true },
  { name: 'Burgers', slug: 'burgers', description: 'Premium handhelds', displayOrder: 4, isActive: true },
  { name: 'Desserts', slug: 'desserts', description: 'A refined finish', displayOrder: 5, isActive: true },
  { name: 'Beverages', slug: 'beverages', description: 'Fresh drinks and sparkling selections', displayOrder: 6, isActive: true },
];

const foods = [
  ['truffle-tenderloin', 'Truffle Tenderloin', 'Charred filet, truffle jus, pomme puree, and roasted shallot.', 'Main Course', 'non-veg', 38, null, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=900&q=85', true],
  ['saffron-sea-bass', 'Saffron Sea Bass', 'Pan-seared sea bass, saffron cream, wilted greens, and garden herbs.', 'Main Course', 'non-veg', 32, null, 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=85', true],
  ['garden-burrata', 'Garden Burrata', 'Creamy burrata, heirloom tomato, basil oil, and crisp sourdough.', 'Starters', 'veg', 21, 26, 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85', true],
  ['wild-mushroom-pizza', 'Wild Mushroom Pizza', 'Roasted mushrooms, fior di latte, thyme, and aged parmesan.', 'Pizza', 'veg', 24, null, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=85', false],
  ['truffle-cheese-pizza', 'Truffle Cheese Pizza', 'Mozzarella, truffle cream, parmesan, and caramelized onion.', 'Pizza', 'veg', 27, 31, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=85', true],
  ['vista-smash-burger', 'Vista Smash Burger', 'Double beef, cheddar, onion jam, pickles, and house sauce.', 'Burgers', 'non-veg', 22, null, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85', true],
  ['midnight-chocolate', 'Midnight Chocolate', 'Dark chocolate torte, salted caramel, and cocoa crumble.', 'Desserts', 'veg', 16, 19, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=85', true],
];

const run = async () => {
  if (process.env.NODE_ENV === 'production') {
    console.error('Menu seeding is disabled in production.');
    process.exit(1);
  }

  const result = await connectDatabase();
  if (result.status !== 'connected') {
    console.error(`Cannot seed menu: ${result.message}`);
    process.exit(1);
  }

  let categoriesInserted = 0;
  let categoriesSkipped = 0;
  for (const category of categories) {
    const existing = await Category.findOne({ $or: [{ name: category.name }, { slug: category.slug }] });
    if (existing) categoriesSkipped++;
    else {
      await Category.create(category);
      categoriesInserted++;
    }
  }

  let foodsInserted = 0;
  let foodsSkipped = 0;
  for (const [slug, name, description, category, foodType, price, originalPrice, image, isFeatured] of foods) {
    const existing = await Food.findOne({ $or: [{ name }, { slug }] });
    if (existing) foodsSkipped++;
    else {
      await Food.create({
        slug, name, description, category, foodType, price, originalPrice, image,
        isAvailable: true, isFeatured,
      });
      foodsInserted++;
    }
  }

  console.log(`Seed complete: ${categoriesInserted} categories inserted, ${categoriesSkipped} skipped; ${foodsInserted} foods inserted, ${foodsSkipped} skipped.`);
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error(`Seed failed: ${error.message}`);
  await mongoose.disconnect();
  process.exit(1);
});
