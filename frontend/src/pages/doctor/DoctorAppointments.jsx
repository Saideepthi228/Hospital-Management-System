import { useState, useEffect } from 'react';
import { appointmentAPI, patientAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { showToast } from '../../components/Toast';

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [appts, pats] = await Promise.all([appointmentAPI.getAll(), patientAPI.getAll()]);
      // Sort by date/time ascending
      appts.sort((a, b) => new Date(a.appointmentDate + 'T' + a.appointmentTime) - new Date(b.appointmentDate + 'T' + b.appointmentTime));
      setAppointments(appts);
      setPatients(pats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getPatientName = (id) => patients.find(p => p.patientId === id)?.patientName || `Patient #${id}`;

  const updateStatus = async (appt, newStatus) => {
    try {
      await appointmentAPI.update(appt.appointmentId, { ...appt, status: newStatus });
      showToast('Status updated', 'success');
      loadData();
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="card">
      <h2 style={{ fontSize: '1.25rem', color: 'var(--primary-blue)', marginBottom: '1.5rem' }}>All Appointments</h2>
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Patient</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr>
                <td colSpan="5">
                  <div className="table-empty">No appointments found.</div>
                </td>
              </tr>
            ) : (
              appointments.map(a => (
                <tr key={a.appointmentId}>
                  <td>
                    <div style={{ fontWeight: '600' }}>{a.appointmentDate}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-medium)' }}>{a.appointmentTime}</div>
                  </td>
                  <td>{getPatientName(a.patientId)}</td>
                  <td>{a.reason || '—'}</td>
                  <td>
                    <span className={`badge ${a.status === 'COMPLETED' ? 'badge-success' : a.status === 'CANCELLED' ? 'badge-danger' : a.status === 'NO_SHOW' ? 'badge-warning' : 'badge-info'}`}>
                      {a.status}
                    </span>
                  </td>
                  <td>
                    {a.status === 'SCHEDULED' && (
                      <div className="table-actions">
                        <button className="btn btn-sm btn-outline" onClick={() => updateStatus(a, 'COMPLETED')}>Complete</button>
                        <button className="btn btn-sm btn-secondary" onClick={() => updateStatus(a, 'CANCELLED')}>Cancel</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
