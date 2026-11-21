import { Facebook, Instagram, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="footer-grid">
        <div className="footer-brand">
          <Link className="brand" to="/" aria-label="Sapphire Vista home">
            <span className="brand-mark" aria-hidden="true">SV</span>
            <span className="brand-name">Sapphire <b>Vista</b></span>
          </Link>
          <p>An elegant dining experience shaped by thoughtful cuisine and warm hospitality.</p>
        </div>

        <div>
          <h3>Explore</h3>
          <div className="footer-links">
            <Link to="/">Home</Link>
            <Link to="/#signature-dishes">Menu</Link>
            <Link to="/#about">About</Link>
          </div>
        </div>

        <div>
          <h3>Visit</h3>
          <address className="footer-contact">
            <span><MapPin size={16} /> 21 Vista Avenue, Sapphire District</span>
            <span><Phone size={16} /> +1 (555) 014-2088</span>
          </address>
        </div>

        <div>
          <h3>Follow</h3>
          <div className="social-links" aria-label="Social media">
            <a href="#instagram" aria-label="Instagram"><Instagram size={18} /></a>
            <a href="#facebook" aria-label="Facebook"><Facebook size={18} /></a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Sapphire Vista</span>
        <span>Fine dining, thoughtfully served.</span>
      </div>
    </footer>
  );
}

export default Footer;