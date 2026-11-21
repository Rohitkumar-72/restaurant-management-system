import { lazy, Suspense } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Award, Clock3, Leaf } from 'lucide-react';
import FoodCard from '../../components/customer/FoodCard.jsx';
const Mascot = lazy(() => import('../../components/mascot/Mascot.jsx'));

const signatureDishes = [
  {
    name: 'Truffle Tenderloin',
    description: 'Charred filet, truffle jus, and roasted shallot.',
    price: '38',
    category: 'Chef’s choice',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=900&q=85',
  },
  {
    name: 'Saffron Sea Bass',
    description: 'Pan-seared bass, saffron cream, and garden herbs.',
    price: '32',
    category: 'Coastal',
    image: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=85',
  },
  {
    name: 'Garden Burrata',
    description: 'Creamy burrata, heirloom tomato, basil oil.',
    price: '21',
    category: 'Fresh',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85',
  },
  {
    name: 'Midnight Chocolate',
    description: 'Dark chocolate, salted caramel, and cocoa crumb.',
    price: '16',
    category: 'Dessert',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=85',
  },
];

const reveal = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0 },
};

function Home() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="home-page">
      <section className="hero" aria-labelledby="hero-title">
        <motion.div
          className="hero-image"
          initial={{ opacity: 0, scale: reduceMotion ? 1 : 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1800&q=88"
            alt="Elegant restaurant dining table"
          />
        </motion.div>
        <div className="hero-overlay" />
        <div className="hero-content">
          <motion.p
            className="eyebrow"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
          >
            Refined dining · Since 2016
          </motion.p>
          <motion.h1
            id="hero-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          >
            Taste the art of
            <span> exceptional evenings.</span>
          </motion.h1>
          <motion.p
            className="hero-copy"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.65 }}
          >
            Seasonal ingredients, graceful service, and flavors composed for memorable moments.
          </motion.p>
          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.68, duration: 0.65 }}
          >
            <a className="primary-button" href="#signature-dishes">
              Explore menu <ArrowRight size={18} />
            </a>
            <a className="secondary-button" href="#about">Our story</a>
          </motion.div>
        </div>
        <div className="hero-detail" aria-hidden="true">
          <span>01</span>
          <i />
          <span>Signature experience</span>
        </div>
        <motion.div
          className="home-mascot"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.7 }}
          aria-hidden="true"
        >
          <Suspense fallback={<div className="mascot-canvas mascot-fallback"><span>SV</span></div>}>
            <Mascot size="medium" interactive animated />
          </Suspense>
        </motion.div>
      </section>

      <section className="signature-section section-shell" id="signature-dishes">
        <motion.div
          className="section-heading"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={reveal}
          transition={{ duration: 0.55 }}
        >
          <div>
            <p className="eyebrow">Curated by our chef</p>
            <h2>Signature dishes</h2>
          </div>
          <a className="text-link" href="#signature-dishes">View full menu <ArrowRight size={16} /></a>
        </motion.div>

        <div className="dish-grid">
          {signatureDishes.map((dish, index) => (
            <FoodCard key={dish.name} dish={dish} index={index} />
          ))}
        </div>
      </section>

      <section className="experience-section section-shell" id="about">
        <motion.div
          className="experience-image"
          initial={{ opacity: 0, x: reduceMotion ? 0 : -35 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.75 }}
        >
          <img
            src="https://images.unsplash.com/photo-1516211697506-8360dbcfe9a4?auto=format&fit=crop&w=1200&q=85"
            alt="Intimate premium restaurant interior"
            loading="lazy"
          />
        </motion.div>
        <motion.div
          className="experience-copy"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
          variants={reveal}
          transition={{ duration: 0.65 }}
        >
          <p className="eyebrow">The Sapphire experience</p>
          <h2>A room for moments that linger.</h2>
          <p>
            Every plate begins with exceptional produce and ends with an unmistakable point of view.
            Our dining room brings together polished service, warm atmosphere, and a sense of discovery.
          </p>
          <div className="experience-values">
            <div><Award size={20} /><span><b>Crafted</b> with intention</span></div>
            <div><Leaf size={20} /><span><b>Seasonal</b> ingredients</span></div>
            <div><Clock3 size={20} /><span><b>Attentive</b> hospitality</span></div>
          </div>
        </motion.div>
      </section>

      <section className="offers-section section-shell">
        <motion.div
          className="offer-card"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.65 }}
        >
          <div className="offer-image">
            <img
              src="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1400&q=85"
              alt="Restaurant table prepared for an evening"
              loading="lazy"
            />
          </div>
          <div className="offer-content">
            <p className="eyebrow">Evening selection</p>
            <h2>The Vista Table</h2>
            <p>A three-course tasting experience, curated for two and served after sunset.</p>
            <a className="primary-button" href="#signature-dishes">
              Discover the selection <ArrowRight size={18} />
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

export default Home;