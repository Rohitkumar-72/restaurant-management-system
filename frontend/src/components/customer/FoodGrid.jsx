import FoodCard from './FoodCard.jsx';

function FoodGrid({ items, onSelect, onAdd, onFoodHover, onFoodLeave, onFoodTap }) {
  return (
    <div className="menu-grid">
      {items.map((dish, index) => (
        <FoodCard
          key={dish.id}
          dish={dish}
          index={index}
          onSelect={onSelect}
          onAdd={onAdd}
          onFoodHover={onFoodHover}
          onFoodLeave={onFoodLeave}
          onFoodTap={onFoodTap}
        />
      ))}
    </div>
  );
}

export default FoodGrid;