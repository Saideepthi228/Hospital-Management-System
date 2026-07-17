import { useState, useEffect } from 'react';
import { patientAPI, doctorAPI, appointmentAPI, medicineAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ patients: 0, doctors: 0, appointments: 0, medicines: 0 });
  const [recentDoctors, setRecentDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [patients, doctors, appointments, medicines] = await Promise.all([
          patientAPI.getAll(),
          doctorAPI.getAll(),
          appointmentAPI.getAll(),
          medicineAPI.getAll()
        ]);
        setStats({
          patients: patients.length,
          doctors: doctors.length,
          appointments: appointments.length,
          medicines: medicines.length
        });
        setRecentDoctors(doctors.slice(-5).reverse());
      } catch (error) {
        console.error("Error fetching stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner />;

  const statCards = [
    { title: 'Total Patients', value: stats.patients, icon: '👥', color: '#2563eb', bgColor: '#eff6ff' },
    { title: 'Active Doctors', value: stats.doctors, icon: '🩺', color: '#059669', bgColor: '#ecfdf5' },
    { title: 'Appointments', value: stats.appointments, icon: '📅', color: '#d97706', bgColor: '#fffbeb' },
    { title: 'Medicine Stock', value: stats.medicines, icon: '💊', color: '#7c3aed', bgColor: '#f5f3ff' },
  ];

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #2563eb 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem 2.5rem',
        marginBottom: '2rem',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', right: '2rem', top: '50%', transform: 'translateY(-50%)', fontSize: '5rem', opacity: 0.12 }}>🏥</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Welcome back, Administrator</h2>
        <p style={{ opacity: 0.7, fontSize: '0.95rem', maxWidth: '500px' }}>
          Here's an overview of your hospital's performance. Monitor key metrics and manage operations from this dashboard.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="stat-cards" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {statCards.map((stat) => (
          <div key={stat.title} className="stat-card">
            <div className="stat-icon" style={{ background: stat.bgColor, color: stat.color }}>
              {stat.icon}
            </div>
            <span className="stat-title">{stat.title}</span>
            <span className="stat-value">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Bottom Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Recent Doctors */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Recent Doctors</h3>
            <span className="badge badge-info">{stats.doctors} total</span>
          </div>
          {recentDoctors.length === 0 ? (
            <div className="table-empty">
              <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🩺</p>
              <p>No doctors registered yet.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Specialization</th>
                  <th>Experience</th>
                </tr>
              </thead>
              <tbody>
                {recentDoctors.map(doc => (
                  <tr key={doc.doctorId}>
                    <td style={{ fontWeight: 600 }}>{doc.doctorName}</td>
                    <td>{doc.specialization || 'Not specified'}</td>
                    <td>
                      <span className="badge badge-muted">{doc.experience || 0} yrs</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <a href="/portal/admin/inventory" className="btn btn-primary btn-lg" style={{ justifyContent: 'flex-start' }}>
              💊 Manage Inventory
            </a>
            <div className="btn btn-secondary btn-lg" style={{ justifyContent: 'flex-start', opacity: 0.6, cursor: 'not-allowed' }}>
              📋 Department Management
              <span className="badge badge-muted" style={{ marginLeft: 'auto' }}>Soon</span>
            </div>
            <div className="btn btn-secondary btn-lg" style={{ justifyContent: 'flex-start', opacity: 0.6, cursor: 'not-allowed' }}>
              💰 Revenue Reports
              <span className="badge badge-muted" style={{ marginLeft: 'auto' }}>Soon</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
