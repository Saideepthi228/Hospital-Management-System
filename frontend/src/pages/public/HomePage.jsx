import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div>
      <section className="hero">
        <div className="container">
          <h1>Transforming Healthcare, Together</h1>
          <p>Ranked #1 hospital in the region. We provide world-class medical care with compassion, innovation, and expertise.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/login/patient" className="btn btn-primary" style={{ backgroundColor: 'white', color: 'var(--primary-blue)' }}>Request an Appointment</Link>
            <Link to="/login/patient" className="btn btn-outline" style={{ color: 'white', borderColor: 'white' }}>Patient Portal</Link>
          </div>
        </div>
      </section>

      <section className="container" style={{ padding: '4rem 2rem' }}>
        <h2 className="section-title" style={{ textAlign: 'center' }}>Our Top Specialties</h2>
        <p className="section-subtitle" style={{ textAlign: 'center' }}>Comprehensive care tailored to your specific needs.</p>
        
        <div className="services-grid">
          <div className="card service-card">
            <div className="service-icon">🫀</div>
            <h3>Cardiology</h3>
            <p style={{ marginTop: '0.5rem', color: 'var(--text-medium)' }}>Advanced heart care, state-of-the-art surgery, and rehabilitation.</p>
          </div>
          <div className="card service-card">
            <div className="service-icon">🧠</div>
            <h3>Neurology</h3>
            <p style={{ marginTop: '0.5rem', color: 'var(--text-medium)' }}>Expert diagnosis and treatment for brain and nervous system disorders.</p>
          </div>
          <div className="card service-card">
            <div className="service-icon">🦴</div>
            <h3>Orthopedics</h3>
            <p style={{ marginTop: '0.5rem', color: 'var(--text-medium)' }}>Specialized care for bones, joints, ligaments, and muscles.</p>
          </div>
        </div>
      </section>

      <section style={{ backgroundColor: 'var(--bg-white)', padding: '4rem 0' }}>
        <div className="container" style={{ display: 'flex', gap: '4rem', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <h2 className="section-title">Why Choose MedCore?</h2>
            <ul style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li style={{ display: 'flex', gap: '1rem' }}>
                <span style={{ color: 'var(--primary-blue)', fontSize: '1.25rem' }}>✓</span>
                <div>
                  <strong>World-Class Experts</strong>
                  <p style={{ color: 'var(--text-medium)', fontSize: '0.9rem' }}>Our doctors are leaders in their fields, dedicated to continuous research and education.</p>
                </div>
              </li>
              <li style={{ display: 'flex', gap: '1rem' }}>
                <span style={{ color: 'var(--primary-blue)', fontSize: '1.25rem' }}>✓</span>
                <div>
                  <strong>Patient-Centered Approach</strong>
                  <p style={{ color: 'var(--text-medium)', fontSize: '0.9rem' }}>We treat every patient with empathy, respect, and personalized attention.</p>
                </div>
              </li>
              <li style={{ display: 'flex', gap: '1rem' }}>
                <span style={{ color: 'var(--primary-blue)', fontSize: '1.25rem' }}>✓</span>
                <div>
                  <strong>Seamless Digital Experience</strong>
                  <p style={{ color: 'var(--text-medium)', fontSize: '0.9rem' }}>Access your records, pay bills, and communicate with your care team anytime via our secured portals.</p>
                </div>
              </li>
            </ul>
          </div>
          <div style={{ flex: 1, backgroundColor: 'var(--bg-gray)', height: '400px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '4rem', opacity: 0.2 }}>🏥</span>
          </div>
        </div>
      </section>
    </div>
  );
}
