import FoodCard from './FoodCard.jsx';

function FoodGrid({ items, onSelect, onAdd }) {
  return (
    <div className="menu-grid">
      {items.map((dish, index) => (
        <FoodCard
          key={dish.id}
          dish={dish}
          index={index}
          onSelect={onSelect}
          onAdd={onAdd}
        />
      ))}
    </div>
  );
}

export default FoodGrid;