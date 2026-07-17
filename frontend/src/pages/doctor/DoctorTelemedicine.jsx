import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { telemedicineAPI, appointmentAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { showToast } from '../../components/Toast';

export default function DoctorTelemedicine() {
  const [sessions, setSessions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newSessionForm, setNewSessionForm] = useState({ appointmentId: '', scheduledDate: '', scheduledTime: '' });
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [sess, appts] = await Promise.all([
        telemedicineAPI.getByDoctor(user.refId),
        appointmentAPI.getByDoctor(user.refId)
      ]);
      setSessions(sess);
      // Only show upcoming appointments that don't already have a session
      const existingApptIds = sess.map(s => s.appointmentId);
      setAppointments(appts.filter(a => a.status === 'SCHEDULED' && !existingApptIds.includes(a.appointmentId)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const appt = appointments.find(a => a.appointmentId === parseInt(newSessionForm.appointmentId));
      await telemedicineAPI.create({
        appointmentId: appt.appointmentId,
        patientId: appt.patientId,
        doctorId: user.refId,
        scheduledDate: newSessionForm.scheduledDate,
        scheduledTime: newSessionForm.scheduledTime,
        status: 'WAITING'
      });
      showToast('Telemedicine session created', 'success');
      setShowCreate(false);
      loadData();
    } catch (err) {
      showToast('Failed to create session', 'error');
    }
  };

  const handleStart = async (session) => {
    try {
      await telemedicineAPI.join(session.sessionId);
      navigate(`/telemedicine/room/${session.roomCode}`);
    } catch (err) {
      showToast('Could not start session', 'error');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--text-dark)', fontWeight: 700 }}>Telemedicine Consultations</h2>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Session</button>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Patient</th>
                <th>Room Code</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <div className="table-empty">No telemedicine sessions scheduled.</div>
                  </td>
                </tr>
              ) : (
                sessions.map(s => (
                  <tr key={s.sessionId}>
                    <td>{s.scheduledDate} {s.scheduledTime}</td>
                    <td style={{ fontWeight: 600 }}>{s.patientName}</td>
                    <td style={{ fontFamily: 'monospace' }}>{s.roomCode}</td>
                    <td>
                      <span className={`badge ${s.status === 'WAITING' ? 'badge-warning' : s.status === 'ACTIVE' ? 'badge-info' : 'badge-muted'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td>
                      {s.status !== 'ENDED' ? (
                        <button className="btn btn-primary btn-sm" onClick={() => handleStart(s)}>
                          🎥 Start Call
                        </button>
                      ) : (
                        <span style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>Ended at {s.endedAt}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>Create Telemedicine Session</h2>
              <button className="modal-close" onClick={() => setShowCreate(false)}>&times;</button>
            </div>
            <div className="modal-body">
              {appointments.length === 0 ? (
                <p>No upcoming physical appointments available to convert to telemedicine.</p>
              ) : (
                <form onSubmit={handleCreateSubmit}>
                  <div className="form-group">
                    <label className="form-label">Select Patient Appointment</label>
                    <select 
                      className="form-select" 
                      required
                      value={newSessionForm.appointmentId}
                      onChange={e => {
                        const appt = appointments.find(a => a.appointmentId === parseInt(e.target.value));
                        setNewSessionForm({ 
                          appointmentId: e.target.value, 
                          scheduledDate: appt?.appointmentDate || '', 
                          scheduledTime: appt?.appointmentTime || '' 
                        });
                      }}
                    >
                      <option value="">-- Select Appointment --</option>
                      {appointments.map(a => (
                        <option key={a.appointmentId} value={a.appointmentId}>
                          {a.appointmentDate} - Patient #{a.patientId} ({a.reason})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Date</label>
                      <input type="date" className="form-input" required value={newSessionForm.scheduledDate} onChange={e => setNewSessionForm({...newSessionForm, scheduledDate: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Time</label>
                      <input type="time" className="form-input" required value={newSessionForm.scheduledTime} onChange={e => setNewSessionForm({...newSessionForm, scheduledTime: e.target.value})} />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Create Session Link</button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
