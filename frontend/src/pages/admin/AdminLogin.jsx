import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { admin, loading, error, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (admin) {
      navigate(location.state?.from || '/admin', { replace: true });
    }
  }, [admin, location.state, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setValidationError('');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setValidationError('Enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setValidationError('Password must contain at least 8 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch {
      // Context provides the generic, user-facing error.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="admin-login-page">
      <motion.section
        className="admin-login-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="admin-login-brand">
          <span>SV</span>
          <div>
            <strong>Sapphire Vista</strong>
            <small>Restaurant Management</small>
          </div>
        </div>

        <div className="admin-login-heading">
          <span><LockKeyhole size={16} /></span>
          <p>Staff access</p>
          <h1>Secure administration</h1>
        </div>

        <form className="admin-login-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="admin-email">Email address</label>
          <input
            id="admin-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
            placeholder="admin@sapphirevista.com"
          />

          <label htmlFor="admin-password">Password</label>
          <div className="admin-password-field">
            <input
              id="admin-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {(validationError || error) && (
            <p className="admin-login-error" role="alert">
              {validationError || error}
            </p>
          )}

          <motion.button
            type="submit"
            disabled={submitting || loading}
            whileTap={{ scale: 0.98 }}
          >
            {submitting ? 'Signing in...' : 'Sign in'}
          </motion.button>
        </form>
      </motion.section>
    </main>
  );
}

export default AdminLogin;