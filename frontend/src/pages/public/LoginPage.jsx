import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { showToast } from '../../components/Toast';

// Detects role from email domain
function detectRole(email) {
  if (email.endsWith('@doctor.com')) return 'DOCTOR';
  if (email.endsWith('@hospital.com')) return 'ADMIN';
  return 'PATIENT';
}

function portalLabel(role) {
  if (role === 'DOCTOR') return 'Provider Portal';
  if (role === 'ADMIN') return 'Admin Portal';
  return 'Patient Portal';
}

function portalHint(role) {
  if (role === 'DOCTOR') return 'Detected: Doctor account (@doctor.com)';
  if (role === 'ADMIN') return 'Detected: Admin account (@hospital.com)';
  return 'Enter your email to sign in or register.';
}

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
  });

  const [detectedRole, setDetectedRole] = useState('PATIENT');

  // Dynamically detect role whenever email changes
  useEffect(() => {
    setDetectedRole(detectRole(form.email));
  }, [form.email]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let userData;
      if (isLogin) {
        userData = await authAPI.login({ email: form.email, password: form.password });
      } else {
        userData = await authAPI.register({ ...form, role: detectedRole });
      }
      localStorage.setItem('user', JSON.stringify(userData));
      showToast(isLogin ? 'Login successful!' : 'Account created!', 'success');

      // Route user to correct portal based on their actual role from the server
      if (userData.role === 'ADMIN') {
        navigate('/portal/admin/dashboard');
      } else if (userData.role === 'DOCTOR') {
        navigate('/portal/doctor/dashboard');
      } else {
        navigate('/portal/patient/dashboard');
      }
    } catch (err) {
      showToast(err.message || 'Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const roleColor = detectedRole === 'ADMIN' ? 'var(--danger)' : detectedRole === 'DOCTOR' ? 'var(--success)' : 'var(--primary-blue)';

  return (
    <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 0' }}>
      <div className="card" style={{ width: '100%', maxWidth: '440px' }}>

        {/* Dynamic Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>
            {detectedRole === 'ADMIN' ? '🏥' : detectedRole === 'DOCTOR' ? '🩺' : '👤'}
          </div>
          <h1 style={{ fontSize: '1.5rem', color: roleColor, marginBottom: '0.5rem', transition: 'color 0.3s' }}>
            {portalLabel(detectedRole)}
          </h1>
          <p style={{ color: 'var(--text-medium)', fontSize: '0.875rem', transition: 'all 0.3s' }}>
            {portalHint(detectedRole)}
          </p>
        </div>

        {/* Toggle Sign In / Register */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <button
            className={`btn ${isLogin ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }}
            onClick={() => setIsLogin(true)}
          >Sign In</button>
          <button
            className={`btn ${!isLogin ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }}
            onClick={() => setIsLogin(false)}
          >Register</button>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" name="username" className="form-input" value={form.username} onChange={handleChange} required />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
            {/* Live role detection indicator */}
            {form.email.length > 3 && (
              <p style={{ marginTop: '0.4rem', fontSize: '0.8rem', color: roleColor, fontWeight: '500' }}>
                ✦ {portalLabel(detectedRole)} detected
              </p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" name="password" className="form-input" value={form.password} onChange={handleChange} required />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem', backgroundColor: roleColor, borderColor: roleColor }}
            disabled={loading}
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        {/* Domain hint for staff */}
        <p style={{ textAlign: 'center', color: 'var(--text-light)', fontSize: '0.78rem', marginTop: '1.5rem' }}>
          Staff? Use your <code>@doctor.com</code> or <code>@hospital.com</code> email.
        </p>
      </div>
    </div>
  );
}
