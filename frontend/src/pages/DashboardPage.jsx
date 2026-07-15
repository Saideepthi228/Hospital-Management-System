import { useState, useEffect } from 'react';
import { patientAPI, doctorAPI, appointmentAPI, billAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function DashboardPage() {
  const [stats, setStats] = useState({ patients: 0, doctors: 0, appointments: 0, pendingBills: 0 });
  const [recentPatients, setRecentPatients] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [patients, doctors, appointments, bills] = await Promise.all([
        patientAPI.getAll(),
        doctorAPI.getAll(),
        appointmentAPI.getAll(),
        billAPI.getAll(),
      ]);

      const unpaidBills = bills.filter(b => b.paymentStatus === 'UNPAID');

      setStats({
        patients: patients.length,
        doctors: doctors.length,
        appointments: appointments.length,
        pendingBills: unpaidBills.length,
      });

      setRecentPatients(patients.slice(-5).reverse());
      setRecentAppointments(appointments.slice(-5).reverse());
    } catch {
      // API might not be running yet, show zeros
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome to MedCore Hospital Management System</p>
      </div>

      <div className="stat-cards-grid">
        <div className="stat-card purple">
          <div className="stat-card-icon">👤</div>
          <div className="stat-card-content">
            <h3>Total Patients</h3>
            <div className="stat-value">{stats.patients}</div>
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-card-icon">🩺</div>
          <div className="stat-card-content">
            <h3>Total Doctors</h3>
            <div className="stat-value">{stats.doctors}</div>
          </div>
        </div>
        <div className="stat-card blue">
          <div className="stat-card-icon">📅</div>
          <div className="stat-card-content">
            <h3>Appointments</h3>
            <div className="stat-value">{stats.appointments}</div>
          </div>
        </div>
        <div className="stat-card amber">
          <div className="stat-card-icon">💳</div>
          <div className="stat-card-content">
            <h3>Pending Bills</h3>
            <div className="stat-value">{stats.pendingBills}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Recent Patients */}
        <div className="table-container">
          <div className="table-toolbar">
            <h2>Recent Patients</h2>
          </div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              {recentPatients.length === 0 ? (
                <tr><td colSpan="3" className="table-empty">No patients yet</td></tr>
              ) : (
                recentPatients.map(p => (
                  <tr key={p.patientId}>
                    <td>{p.patientName}</td>
                    <td>{p.age}</td>
                    <td>{p.phoneNumber}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Recent Appointments */}
        <div className="table-container">
          <div className="table-toolbar">
            <h2>Recent Appointments</h2>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentAppointments.length === 0 ? (
                <tr><td colSpan="3" className="table-empty">No appointments yet</td></tr>
              ) : (
                recentAppointments.map(a => (
                  <tr key={a.appointmentId}>
                    <td>{a.appointmentDate}</td>
                    <td>{a.appointmentTime}</td>
                    <td>
                      <span className={`badge ${getStatusBadge(a.status)}`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function getStatusBadge(status) {
  switch (status) {
    case 'SCHEDULED': return 'badge-info';
    case 'COMPLETED': return 'badge-success';
    case 'CANCELLED': return 'badge-danger';
    case 'NO_SHOW': return 'badge-warning';
    default: return 'badge-muted';
  }
}
