import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, ShoppingBag, X } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';

const links = [
  { label: 'Home', to: '/' },
  { label: 'Menu', to: '/menu' },
  { label: 'About', to: '/#about' },
  { label: 'Contact', to: '/#contact' },
];

function Navbar() {
  const [open, setOpen] = useState(false);
  const { itemCount } = useCart();

  const closeMenu = () => setOpen(false);

  return (
    <motion.header
      className="navbar"
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="navbar-inner">
        <Link className="brand" to="/" onClick={closeMenu} aria-label="Sapphire Vista home">
          <span className="brand-mark" aria-hidden="true">SV</span>
          <span className="brand-name">Sapphire <b>Vista</b></span>
        </Link>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {links.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="navbar-actions">
          <Link className="icon-button cart-button" to="/cart" aria-label={`Open cart with ${itemCount} items`}>
            <ShoppingBag size={19} strokeWidth={1.7} />
            {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
          </Link>
          <button
            className="icon-button menu-button"
            type="button"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? 'Close navigation' : 'Open navigation'}
            onClick={() => setOpen((current) => !current)}
          >
            {open ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>

      {open && (
        <motion.nav
          id="mobile-navigation"
          className="mobile-nav"
          aria-label="Mobile navigation"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {links.map((link) => (
            <NavLink key={link.label} to={link.to} onClick={closeMenu} className="mobile-nav-link">
              {link.label}
            </NavLink>
          ))}
        </motion.nav>
      )}
    </motion.header>
  );
}

export default Navbar;