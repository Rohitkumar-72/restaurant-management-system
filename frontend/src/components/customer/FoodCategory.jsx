import { motion } from 'framer-motion';

function FoodCategory({ categories, activeCategory, onChange }) {
  return (
    <div className="menu-categories" role="tablist" aria-label="Food categories">
      {categories.map((category) => {
        const active = category === activeCategory;
        return (
          <motion.button
            key={category}
            type="button"
            role="tab"
            aria-selected={active}
            className={active ? 'category-button active' : 'category-button'}
            onClick={() => onChange(category)}
            whileTap={{ scale: 0.97 }}
          >
            {category}
            {active && (
              <motion.span
                className="category-active-line"
                layoutId="active-category"
                transition={{ duration: 0.22 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

export default FoodCategory;