import { Outlet, Link } from 'react-router-dom';

export default function PublicLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#fff' }}>
      <header className="public-header">
        <div className="public-header-top">
          <div className="container">
            <Link to="/login/patient">Patient Login</Link>
            <Link to="/login/doctor">Provider Login</Link>
          </div>
        </div>
        <div className="public-header-main">
          <div className="container">
            <Link to="/" className="brand">
              <span className="brand-icon">🏥</span> MedCore Health
            </Link>
            <nav className="public-nav">
              <Link to="/">Home</Link>
              <Link to="/">Care & Services</Link>
              <Link to="/">Health Library</Link>
              <Link to="/login/patient" className="btn btn-primary btn-sm">Request Appointment</Link>
            </nav>
          </div>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      <footer className="public-footer">
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
          <div>
            <h3 style={{ marginBottom: '1rem' }}>MedCore Health</h3>
            <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>Providing world-class care and pioneering medical research.</p>
          </div>
          <div>
            <h3 style={{ marginBottom: '1rem' }}>Quick Links</h3>
            <ul style={{ opacity: 0.8, fontSize: '0.9rem', lineHeight: '2' }}>
              <li><Link to="/login/patient" style={{ color: 'white' }}>Patient Portal</Link></li>
              <li><Link to="/" style={{ color: 'white' }}>Find a Doctor</Link></li>
              <li><Link to="/" style={{ color: 'white' }}>Locations</Link></li>
            </ul>
          </div>
          <div>
            <h3 style={{ marginBottom: '1rem' }}>Contact Us</h3>
            <ul style={{ opacity: 0.8, fontSize: '0.9rem', lineHeight: '2' }}>
              <li>Emergency: 911</li>
              <li>General: 1-800-MEDCORE</li>
              <li>info@medcore.org</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
