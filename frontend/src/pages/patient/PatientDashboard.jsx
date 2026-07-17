import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentAPI, billAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [appts, bls] = await Promise.all([
        appointmentAPI.getByPatient(user.refId),
        billAPI.getByPatient(user.refId)
      ]);
      setAppointments(appts.slice(0, 5));
      setBills(bls.filter(b => b.paymentStatus === 'UNPAID').slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h3 style={{ marginBottom: '2rem', color: 'var(--text-medium)' }}>Here is your health summary</h3>
      
      <div className="form-row">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>Upcoming Appointments</h2>
            <a href="/portal/patient/book-appointment" className="btn btn-sm btn-primary">+ Book</a>
          </div>

          {appointments.length === 0 ? (
            <p style={{ color: 'var(--text-light)' }}>No upcoming appointments.</p>
          ) : (
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {appointments.map(a => (
                <li key={a.appointmentId} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <strong>{a.appointmentDate} at {a.appointmentTime}</strong>
                    <span className="badge badge-info">{a.status}</span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-medium)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Reason: {a.reason || 'General Visit'}</span>
                    <span style={{ color: 'var(--text-light)' }}>⏱ {a.duration || 30} mins</span>
                  </div>
                  {a.notes && (
                    <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'var(--bg-light)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                      <strong>Doctor's Notes:</strong> {a.notes}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.25rem', color: 'var(--danger)', marginBottom: '1rem' }}>Action Required: Unpaid Bills</h2>
          {bills.length === 0 ? (
            <p style={{ color: 'var(--success)', fontWeight: '500' }}>You have no outstanding bills! 🎉</p>
          ) : (
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {bills.map(b => (
                <li key={b.billId} style={{ padding: '1rem', border: '1px solid var(--danger-bg)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--danger-bg)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <strong>Billed: {b.billingDate}</strong>
                    <span style={{ fontWeight: 'bold', color: 'var(--danger)' }}>₹{b.amount.toLocaleString()}</span>
                  </div>
                  <button className="btn btn-primary btn-sm" style={{ width: '100%', marginTop: '0.5rem' }} onClick={() => navigate('/portal/patient/billing')}>Pay Now</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
