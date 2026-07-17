import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { telemedicineAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { showToast } from '../../components/Toast';

export default function PatientTelemedicine() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const sess = await telemedicineAPI.getByPatient(user.refId);
      setSessions(sess);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (session) => {
    try {
      await telemedicineAPI.join(session.sessionId);
      navigate(`/telemedicine/room/${session.roomCode}`);
    } catch (err) {
      showToast('Could not join session', 'error');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>My Telemedicine Consultations</h2>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Doctor</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {sessions.length === 0 ? (
              <tr>
                <td colSpan="5">
                  <div className="table-empty">No upcoming consultations found.</div>
                </td>
              </tr>
            ) : (
              sessions.map(s => (
                <tr key={s.sessionId}>
                  <td>{s.scheduledDate}</td>
                  <td>{s.scheduledTime}</td>
                  <td style={{ fontWeight: 600 }}>Dr. {s.doctorName}</td>
                  <td>
                    <span className={`badge ${s.status === 'WAITING' ? 'badge-warning' : s.status === 'ACTIVE' ? 'badge-info' : 'badge-muted'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td>
                    {s.status !== 'ENDED' ? (
                      <button className="btn btn-primary btn-sm" onClick={() => handleJoin(s)}>
                        🎥 Join Call
                      </button>
                    ) : (
                      <span style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>Ended</span>
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
