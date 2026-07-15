import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { showToast } from '../../components/Toast';

export default function LoginPage() {
  const { type } = useParams(); // 'patient' or 'doctor'
  const isDoctor = type === 'doctor';
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: isDoctor ? 'DOCTOR' : 'PATIENT',
  });

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
        // Validate correct portal login
        if (isDoctor && userData.role !== 'DOCTOR') throw new Error("Unauthorized: Not a doctor account.");
        if (!isDoctor && userData.role !== 'PATIENT') throw new Error("Unauthorized: Not a patient account.");
      } else {
        userData = await authAPI.register({ ...form, role: isDoctor ? 'DOCTOR' : 'PATIENT' });
      }
      localStorage.setItem('user', JSON.stringify(userData));
      showToast(isLogin ? 'Login successful' : 'Account created', 'success');
      
      if (isDoctor) {
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

  return (
    <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 0' }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', color: 'var(--primary-blue)', marginBottom: '0.5rem' }}>
            {isDoctor ? 'Provider Portal' : 'Patient Portal'}
          </h1>
          <p style={{ color: 'var(--text-medium)' }}>
            {isLogin ? 'Sign in to access your account' : 'Create a new account'}
          </p>
        </div>

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
            <input type="email" name="email" className="form-input" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" name="password" className="form-input" value={form.password} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>
      </div>
    </div>
  );
}
