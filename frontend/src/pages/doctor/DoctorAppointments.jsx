import { useState, useEffect } from 'react';
import { appointmentAPI, patientAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { showToast } from '../../components/Toast';

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [appts, pats] = await Promise.all([appointmentAPI.getByDoctor(user.refId), patientAPI.getAll()]);
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
      const updatedNotes = newStatus === 'COMPLETED' ? prompt('Add any consultation notes (optional):') : appt.notes;
      if (updatedNotes === null) return; // User cancelled prompt

      await appointmentAPI.update(appt.appointmentId, { ...appt, status: newStatus, notes: updatedNotes });
      showToast('Status updated', 'success');
      loadData();
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="card">
      <h2 style={{ fontSize: '1.25rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>My Schedule</h2>
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Patient</th>
              <th>Reason & Duration</th>
              <th>Notes</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr>
                <td colSpan="6">
                  <div className="table-empty">No appointments scheduled.</div>
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
                  <td>
                    <div style={{ fontWeight: '500' }}>{a.reason || '—'}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{a.duration || 30} mins</div>
                  </td>
                  <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {a.notes || '—'}
                  </td>
                  <td>
                    <span className={`badge ${a.status === 'COMPLETED' ? 'badge-success' : a.status === 'CANCELLED' ? 'badge-danger' : a.status === 'NO_SHOW' ? 'badge-warning' : 'badge-info'}`}>
                      {a.status}
                    </span>
                  </td>
                  <td>
                    {a.status === 'SCHEDULED' && (
                      <div className="table-actions">
                        <button className="btn btn-sm btn-outline" style={{ color: 'var(--success)', borderColor: 'var(--success)' }} onClick={() => updateStatus(a, 'COMPLETED')}>Complete</button>
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
