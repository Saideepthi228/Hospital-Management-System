import { Outlet, NavLink, useNavigate } from 'react-router-dom';

export default function PatientPortalLayout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

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
          <NavLink to="/portal/patient/dashboard" className="portal-nav-link">My Dashboard</NavLink>
          <NavLink to="/portal/patient/prescriptions" className="portal-nav-link">My Prescriptions</NavLink>
          <NavLink to="/portal/patient/billing" className="portal-nav-link">Billing & Payments</NavLink>
          <NavLink to="/portal/patient/doctors" className="portal-nav-link">Find a Doctor</NavLink>
        </nav>
        <div className="portal-sidebar-footer">
          <div style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '0.5rem' }}>Patient Portal</div>
          <button onClick={handleLogout} className="btn btn-outline" style={{ width: '100%', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>Log Out</button>
        </div>
      </aside>

      <main className="portal-main">
        <header className="portal-header">
          <h2>Patient Services</h2>
          <div className="portal-user-info">
            Welcome, {user.username || 'Patient'}
          </div>
        </header>
        <div className="portal-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
