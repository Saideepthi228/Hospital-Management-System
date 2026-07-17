import { Outlet, NavLink, useNavigate } from 'react-router-dom';

export default function AdminPortalLayout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const initial = (user.username || 'A')[0].toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="portal-layout">
      {/* Sidebar */}
      <aside className="portal-sidebar">
        <div className="brand">
          <span className="brand-icon">🏥</span>
          MedCore
        </div>

        <nav className="portal-nav">
          <p className="portal-nav-section">Main</p>
          <NavLink to="/portal/admin/dashboard" className={({ isActive }) => `portal-nav-link${isActive ? ' active' : ''}`}>
            <span className="nav-icon">📊</span> Dashboard
          </NavLink>
          <NavLink to="/portal/admin/inventory" className={({ isActive }) => `portal-nav-link${isActive ? ' active' : ''}`}>
            <span className="nav-icon">💊</span> Pharmacy & Inventory
          </NavLink>
        </nav>

        <div className="portal-sidebar-footer">
          <button onClick={handleLogout} className="btn btn-secondary">
            ← Log Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="portal-main">
        {/* Top Bar */}
        <header className="portal-header">
          <h2>Hospital Administration</h2>
          <div className="portal-user-info">
            <span>{user.username || 'Administrator'}</span>
            <div className="portal-avatar">{initial}</div>
          </div>
        </header>

        {/* Page Content */}
        <div className="portal-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
