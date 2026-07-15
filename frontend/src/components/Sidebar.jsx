import { NavLink, useNavigate } from 'react-router-dom';

export default function Sidebar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🏥</div>
        <div className="sidebar-logo-text">
          <h2>MedCore</h2>
          <span>Hospital Management</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-title">Overview</div>
        <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <span className="sidebar-link-icon">📊</span>
          Dashboard
        </NavLink>

        <div className="sidebar-section-title">Management</div>
        <NavLink to="/patients" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <span className="sidebar-link-icon">👤</span>
          Patients
        </NavLink>
        <NavLink to="/doctors" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <span className="sidebar-link-icon">🩺</span>
          Doctors
        </NavLink>
        <NavLink to="/appointments" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <span className="sidebar-link-icon">📅</span>
          Appointments
        </NavLink>

        <div className="sidebar-section-title">Finance & Records</div>
        <NavLink to="/bills" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <span className="sidebar-link-icon">💳</span>
          Billing
        </NavLink>
        <NavLink to="/prescriptions" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <span className="sidebar-link-icon">💊</span>
          Prescriptions
        </NavLink>
      </nav>

      <div className="sidebar-user">
        <div className="sidebar-user-avatar">{getInitials(user.username)}</div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{user.username || 'User'}</div>
          <div className="sidebar-user-role">{user.role || 'Guest'}</div>
        </div>
        <button className="sidebar-logout-btn" onClick={handleLogout} title="Logout">
          🚪
        </button>
      </div>
    </aside>
  );
}
