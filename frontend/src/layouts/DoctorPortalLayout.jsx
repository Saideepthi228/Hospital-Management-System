import { Outlet, NavLink, useNavigate } from 'react-router-dom';

export default function DoctorPortalLayout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const initial = (user.username || 'D')[0].toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="portal-layout">
      <aside className="portal-sidebar">
        <div className="brand">
          <span className="brand-icon">🏥</span> MedCore
        </div>
        <nav className="portal-nav">
          <p className="portal-nav-section">Provider</p>
          <NavLink to="/portal/doctor/dashboard" className={({ isActive }) => `portal-nav-link${isActive ? ' active' : ''}`}>
            <span className="nav-icon">📊</span> Dashboard
          </NavLink>
          <NavLink to="/portal/doctor/appointments" className={({ isActive }) => `portal-nav-link${isActive ? ' active' : ''}`}>
            <span className="nav-icon">📅</span> My Schedule
          </NavLink>
          <NavLink to="/portal/doctor/prescribe" className={({ isActive }) => `portal-nav-link${isActive ? ' active' : ''}`}>
            <span className="nav-icon">📝</span> Write Prescription
          </NavLink>
          <NavLink to="/portal/doctor/upload-record" className={({ isActive }) => `portal-nav-link${isActive ? ' active' : ''}`}>
            <span className="nav-icon">📤</span> Upload Record
          </NavLink>
          <NavLink to="/portal/doctor/telemedicine" className={({ isActive }) => `portal-nav-link${isActive ? ' active' : ''}`}>
            <span className="nav-icon">📹</span> Telemedicine
          </NavLink>
        </nav>
        <div className="portal-sidebar-footer">
          <button onClick={handleLogout} className="btn btn-secondary">← Log Out</button>
        </div>
      </aside>

      <main className="portal-main">
        <header className="portal-header">
          <h2>Provider Services</h2>
          <div className="portal-user-info">
            <span>Dr. {user.username || 'Provider'}</span>
            <div className="portal-avatar">{initial}</div>
          </div>
        </header>
        <div className="portal-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
