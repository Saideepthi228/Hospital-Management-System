import { Outlet, NavLink, useNavigate } from 'react-router-dom';

export default function PatientPortalLayout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const initial = (user.username || 'P')[0].toUpperCase();

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
          <p className="portal-nav-section">Patient</p>
          <NavLink to="/portal/patient/dashboard" className={({ isActive }) => `portal-nav-link${isActive ? ' active' : ''}`}>
            <span className="nav-icon">📊</span> My Dashboard
          </NavLink>
          <NavLink to="/portal/patient/book-appointment" className={({ isActive }) => `portal-nav-link${isActive ? ' active' : ''}`}>
            <span className="nav-icon">📅</span> Book Appointment
          </NavLink>
          <NavLink to="/portal/patient/prescriptions" className={({ isActive }) => `portal-nav-link${isActive ? ' active' : ''}`}>
            <span className="nav-icon">💊</span> My Prescriptions
          </NavLink>
          <NavLink to="/portal/patient/records" className={({ isActive }) => `portal-nav-link${isActive ? ' active' : ''}`}>
            <span className="nav-icon">📁</span> Medical Records
          </NavLink>
          <NavLink to="/portal/patient/billing" className={({ isActive }) => `portal-nav-link${isActive ? ' active' : ''}`}>
            <span className="nav-icon">💳</span> Billing & Payments
          </NavLink>
          <NavLink to="/portal/patient/doctors" className={({ isActive }) => `portal-nav-link${isActive ? ' active' : ''}`}>
            <span className="nav-icon">🔍</span> Find a Doctor
          </NavLink>
        </nav>
        <div className="portal-sidebar-footer">
          <button onClick={handleLogout} className="btn btn-secondary">← Log Out</button>
        </div>
      </aside>

      <main className="portal-main">
        <header className="portal-header">
          <h2>Patient Services</h2>
          <div className="portal-user-info">
            <span>{user.username || 'Patient'}</span>
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
