import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMobile } from '../context/MobileContext';

const Login = () => {
  const navigate = useNavigate();
  const { loginUser } = useMobile();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await loginUser(email, password);
    setLoading(false);
    if (result.success) {
      navigate(result.is_admin ? '/admin' : '/dashboard');
    } else {
      setError(result.message || 'Invalid credentials. Please try again.');
    }
  };

  return (
    <div style={styles.wrapper}>
      {/* Background decorative circles */}
      <div style={styles.circle1} />
      <div style={styles.circle2} />

      <div style={styles.card}>
        {/* Logo / Icon */}
        <div style={styles.logoWrap}>
          <div style={styles.logoIcon}>
            <img src="/copilot_ 20260525_085633.png" alt="Eco Friend Logo" style={styles.logoImg} />
          </div>
          <span style={styles.logoText}>EcoFriend</span>
        </div>

        <h1 style={styles.title}>Welcome Back</h1>
        <p style={styles.subtitle}>Sign in to your account to continue</p>

        {error && (
          <div style={styles.errorBox}>
            <span style={styles.errorIcon}>⚠</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="login-email">Email Address</label>
            <div style={styles.inputWrap}>
              <span style={styles.inputIcon}>✉</span>
              <input
                id="login-email"
                type="email"
                required
                placeholder="you@example.com"
                style={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="login-password">Password</label>
            <div style={styles.inputWrap}>
              <span style={styles.inputIcon}>🔒</span>
              <input
                id="login-password"
                type={showPass ? 'text' : 'password'}
                required
                placeholder="Enter your password"
                style={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={styles.eyeBtn}
              >
                {showPass ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.submitBtn, opacity: loading ? 0.75 : 1 }}
          >
            {loading ? (
              <span style={styles.spinnerWrap}>
                <span style={styles.spinner} />
                Signing in…
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p style={styles.switchText}>
          New here?{' '}
          <Link to="/register" style={styles.switchLink}>Create a free account</Link>
        </p>

        <div style={styles.divider}>
          <hr style={styles.hr} />
          <span style={styles.dividerText}>ADMIN ACCESS</span>
          <hr style={styles.hr} />
        </div>
        <p style={styles.adminHint}>
          Admin: <strong>ecofriendadmin@gmail.com</strong> / <strong>ecofriend123</strong>
        </p>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    minHeight: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(145deg, #f0fdf4 0%, #ecfdf5 50%, #d1fae5 100%)',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute',
    top: '-60px',
    right: '-40px',
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  circle2: {
    position: 'absolute',
    bottom: '-80px',
    left: '-50px',
    width: '250px',
    height: '250px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    width: '100%',
    maxWidth: '380px',
    background: 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(20px)',
    borderRadius: '28px',
    padding: '36px 28px',
    boxShadow: '0 20px 60px rgba(16,185,129,0.12), 0 4px 20px rgba(0,0,0,0.06)',
    border: '1px solid rgba(16,185,129,0.12)',
    position: 'relative',
    zIndex: 1,
  },
  logoWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '24px',
  },
  logoIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '14px',
    background: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(16,185,129,0.15)',
    border: '1px solid rgba(16,185,129,0.1)',
    overflow: 'hidden',
  },
  logoImg: {
    width: '32px',
    height: '32px',
    objectFit: 'contain',
  },
  logoText: {
    fontFamily: "'Sora', sans-serif",
    fontSize: '22px',
    fontWeight: '800',
    color: '#064e3b',
    letterSpacing: '-0.5px',
  },
  title: {
    fontFamily: "'Sora', sans-serif",
    fontSize: '24px',
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    margin: '0 0 6px',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '13px',
    color: '#64748b',
    textAlign: 'center',
    margin: '0 0 24px',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '12px',
    padding: '10px 14px',
    marginBottom: '16px',
    color: '#dc2626',
    fontSize: '13px',
    fontFamily: "'Inter', sans-serif",
  },
  errorIcon: { fontSize: '15px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '12px',
    fontWeight: '600',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  inputWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    fontSize: '14px',
    pointerEvents: 'none',
    zIndex: 1,
  },
  input: {
    width: '100%',
    padding: '12px 40px 12px 38px',
    borderRadius: '12px',
    border: '1.5px solid #e2e8f0',
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    color: '#0f172a',
    background: '#f8fafc',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  eyeBtn: {
    position: 'absolute',
    right: '10px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '4px',
  },
  submitBtn: {
    marginTop: '8px',
    width: '100%',
    padding: '14px',
    borderRadius: '14px',
    border: 'none',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    fontFamily: "'Sora', sans-serif",
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(16,185,129,0.35)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    letterSpacing: '-0.2px',
  },
  spinnerWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: 'white',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
    display: 'inline-block',
  },
  switchText: {
    textAlign: 'center',
    marginTop: '20px',
    fontFamily: "'Inter', sans-serif",
    fontSize: '13px',
    color: '#64748b',
  },
  switchLink: {
    color: '#10b981',
    fontWeight: '700',
    textDecoration: 'none',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '20px',
  },
  hr: {
    flex: 1,
    border: 'none',
    borderTop: '1px solid #e2e8f0',
  },
  dividerText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '10px',
    color: '#94a3b8',
    fontWeight: '600',
    letterSpacing: '1px',
    whiteSpace: 'nowrap',
  },
  adminHint: {
    textAlign: 'center',
    fontFamily: "'Inter', sans-serif",
    fontSize: '11px',
    color: '#94a3b8',
    marginTop: '8px',
  },
};

export default Login;
