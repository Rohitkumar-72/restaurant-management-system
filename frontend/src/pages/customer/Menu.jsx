import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, Plus, SearchX, X } from 'lucide-react';
import SearchBar from '../../components/customer/SearchBar.jsx';
import FoodCategory from '../../components/customer/FoodCategory.jsx';
import FoodGrid from '../../components/customer/FoodGrid.jsx';
import Modal from '../../components/common/Modal.jsx';
import { menuCategories, menuItems } from '../../data/menuData.js';
import { useCart } from '../../context/CartContext.jsx';
import { foodService } from '../../services/foodService.js';
import { useTable } from '../../context/TableContext.jsx';
import { useMascotFoodReaction } from '../../hooks/useMascotFoodReaction.js';

const Mascot = lazy(() => import('../../components/mascot/Mascot.jsx'));

const fallbackImage = 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85';

function Menu() {
  const [activeCategory, setActiveCategory] = useState('All Items');
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [addedItem, setAddedItem] = useState(null);
  const [liveItems, setLiveItems] = useState(null);
  const [categories, setCategories] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuError, setMenuError] = useState('');
  const [usingFallback, setUsingFallback] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const reduceMotion = useReducedMotion();
  const { addItem } = useCart();
  const { table: assignedTable, loading: tableLoading, error: tableError, clearTable } = useTable();
  const menuMascotRef = useRef(null);
  const {
    targetRef,
    reactToFood,
    leaveFood,
  } = useMascotFoodReaction(menuMascotRef);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setMenuError('');

    Promise.all([
      foodService.getFoods({ available: true, limit: 100, sort: 'name' }),
      foodService.getCategories(),
    ])
      .then(([foods, categoryItems]) => {
        if (!active) return;
        const normalizedFoods = foods.map((item) => ({
          ...item,
          id: item.id || item._id || item.slug,
          price: Number(item.price),
          originalPrice:
            typeof item.originalPrice === 'number' && item.originalPrice > Number(item.price)
              ? item.originalPrice
              : null,
          foodType: item.foodType === 'non-veg' ? 'non-veg' : 'veg',
        }));
        setLiveItems(normalizedFoods);
        setCategories([
          'All Items',
          ...categoryItems.map((item) => item.name).filter(Boolean),
        ]);
        setUsingFallback(false);
      })
      .catch((error) => {
        if (!active) return;
        setLiveItems(menuItems);
        setCategories(menuCategories);
        setUsingFallback(true);
        setMenuError(error.message || 'Live menu is unavailable');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [loadAttempt]);

  const sourceItems = liveItems || menuItems;
  const sourceCategories = categories || menuCategories;

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return sourceItems.filter((item) => {
      const inCategory = activeCategory === 'All Items' || item.category === activeCategory;
      const inSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);
      return inCategory && inSearch;
    });
  }, [activeCategory, search, sourceItems]);

  useEffect(() => {
    if (!selectedItem) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setSelectedItem(null);
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [selectedItem]);

  const handleAdd = (item) => {
    addItem(item);
    setAddedItem(item.id);
    window.setTimeout(() => setAddedItem(null), 1200);
  };

  const handleModalImageError = (event) => {
    if (event.currentTarget.src !== fallbackImage) event.currentTarget.src = fallbackImage;
  };

  const handleFoodSelect = (food) => {
    reactToFood(food, null, 'focus');
    setSelectedItem(food);
  };

  return (
    <div className="menu-page">
      <section className="menu-header">
        <motion.div
          className="menu-header-inner"
          initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
        >
          <div className="menu-heading-copy">
            <p className="eyebrow">Sapphire Vista Collection</p>
            <h1>Our Menu</h1>
            <p>Seasonal plates, thoughtful combinations, and elegant favorites.</p>
          </div>
          <SearchBar value={search} onChange={setSearch} />
        </motion.div>
      </section>

      <section className="menu-content section-shell">
        {(assignedTable || tableLoading || tableError) && (
          <div className="table-session-banner" role="status">
            {assignedTable ? (
              <>
                <div>
                  <span>Welcome to Sapphire Vista</span>
                  <strong>You're dining at Table {assignedTable.tableNumber}</strong>
                </div>
                <button type="button" onClick={clearTable}>Clear table</button>
              </>
            ) : (
              <span>{tableLoading ? 'Validating table...' : tableError}</span>
            )}
          </div>
        )}
        {usingFallback && (
          <div className="menu-fallback-notice" role="status">
            <span>Demo menu</span>
            <p>{menuError}. Showing sample dishes instead.</p>
            <button type="button" onClick={() => setLoadAttempt((attempt) => attempt + 1)}>
              Retry
            </button>
          </div>
        )}

        <FoodCategory
          categories={sourceCategories}
          activeCategory={activeCategory}
          onChange={setActiveCategory}
        />

        <div className="menu-results-heading">
          <p>
            <span>{filteredItems.length}</span>{' '}
            {filteredItems.length === 1 ? 'selection' : 'selections'}
          </p>
          {(search || activeCategory !== 'All Items') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setActiveCategory('All Items');
              }}
            >
              Reset filters
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              className="menu-loading"
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span className="menu-loading-mark" />
              <p>Loading the menu...</p>
            </motion.div>
          ) : filteredItems.length > 0 ? (
            <motion.div
              key={`${activeCategory}-${search}`}
              initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <FoodGrid
                items={filteredItems}
                onSelect={handleFoodSelect}
                onAdd={handleAdd}
                onFoodHover={(food, element) => reactToFood(food, element, 'hover')}
                onFoodLeave={(food) => leaveFood(food)}
                onFoodTap={(food, element) => reactToFood(food, element, 'touch')}
              />
            </motion.div>
          ) : (
            <motion.div
              className="menu-empty"
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <SearchX size={30} />
              <h2>No dishes found</h2>
              <p>Try another name or category.</p>
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setActiveCategory('All Items');
                }}
              >
                Clear search
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <div className="menu-mascot" aria-hidden="true">
        <Suspense fallback={<div className="mascot-canvas mascot-fallback"><span>SV</span></div>}>
          <Mascot
            ref={menuMascotRef}
            size="small"
            interactive
            animated
            targetRef={targetRef}
          />
        </Suspense>
      </div>

      <Modal open={Boolean(selectedItem)} onClose={() => setSelectedItem(null)} labelledBy="food-details-title">
        {selectedItem && (
          <motion.div
            className="food-details"
            initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.98, y: reduceMotion ? 0 : 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.22 }}
          >
            <button
              className="modal-close"
              type="button"
              onClick={() => setSelectedItem(null)}
              aria-label="Close food details"
            >
              <X size={20} />
            </button>
            <div className="food-details-image">
              <img
                src={selectedItem.image}
                alt={selectedItem.name}
                onError={handleModalImageError}
              />
            </div>
            <div className="food-details-content">
              <p className="eyebrow">{selectedItem.category}</p>
              <div className="food-details-title-row">
                <h2 id="food-details-title">{selectedItem.name}</h2>
                <span className={`detail-food-type ${selectedItem.foodType}`}>
                  <i /> {selectedItem.foodType === 'veg' ? 'Vegetarian' : 'Non-vegetarian'}
                </span>
              </div>
              <p className="food-details-description">{selectedItem.description}</p>
              <div className="food-details-price">
                {selectedItem.originalPrice && <span>${selectedItem.originalPrice}</span>}
                <strong>${selectedItem.price}</strong>
              </div>
              <motion.button
                className="primary-button food-details-add"
                type="button"
                onClick={() => handleAdd(selectedItem)}
                whileTap={{ scale: 0.97 }}
              >
                {addedItem === selectedItem.id ? <Check size={18} /> : <Plus size={18} />}
                {addedItem === selectedItem.id ? 'Added to selection' : 'Add to order'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </Modal>
    </div>
  );
}

export default Menu;