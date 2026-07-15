import { Outlet, NavLink, useNavigate } from 'react-router-dom';

export default function DoctorPortalLayout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="portal-layout">
      <aside className="portal-sidebar" style={{ backgroundColor: '#1e293b' }}>
        <div className="brand">
          <span className="brand-icon">🏥</span> MedCore
        </div>
        <nav className="portal-nav">
          <NavLink to="/portal/doctor/dashboard" className="portal-nav-link">Provider Dashboard</NavLink>
          <NavLink to="/portal/doctor/appointments" className="portal-nav-link">My Schedule</NavLink>
          <NavLink to="/portal/doctor/prescribe" className="portal-nav-link">Write Prescription</NavLink>
        </nav>
        <div className="portal-sidebar-footer">
          <div style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '0.5rem' }}>Provider Portal</div>
          <button onClick={handleLogout} className="btn btn-outline" style={{ width: '100%', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>Log Out</button>
        </div>
      </aside>

      <main className="portal-main">
        <header className="portal-header">
          <h2>Provider Services</h2>
          <div className="portal-user-info">
            Dr. {user.username || 'Provider'}
          </div>
        </header>
        <div className="portal-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
