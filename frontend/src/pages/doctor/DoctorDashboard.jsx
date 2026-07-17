import { useState, useEffect } from 'react';
import { appointmentAPI, patientAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [appts, pats] = await Promise.all([appointmentAPI.getByDoctor(user.refId), patientAPI.getAll()]);
      setAppointments(appts);
      setPatients(pats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getPatientName = (id) => patients.find(p => p.patientId === id)?.patientName || `Patient #${id}`;

  const todayStr = new Date().toISOString().split('T')[0];
  const todaysAppointments = appointments.filter(a => a.appointmentDate === todayStr);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="stat-cards" style={{ marginBottom: '2rem' }}>
        <div className="card stat-card">
          <div className="stat-title">Today's Appointments</div>
          <div className="stat-value">{todaysAppointments.length}</div>
        </div>
        <div className="card stat-card" style={{ borderLeftColor: 'var(--info)' }}>
          <div className="stat-title">Total Patients</div>
          <div className="stat-value">{patients.length}</div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.25rem', color: 'var(--primary-blue)', marginBottom: '1rem' }}>Today's Schedule</h2>
        
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Patient</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {todaysAppointments.length === 0 ? (
                <tr>
                  <td colSpan="4">
                    <div className="table-empty">No appointments scheduled for today.</div>
                  </td>
                </tr>
              ) : (
                todaysAppointments.map(a => (
                  <tr key={a.appointmentId}>
                    <td style={{ fontWeight: '600' }}>{a.appointmentTime}</td>
                    <td>{getPatientName(a.patientId)}</td>
                    <td>{a.reason || 'Routine Checkup'}</td>
                    <td><span className="badge badge-info">{a.status}</span></td>
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
