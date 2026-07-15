import { useState, useEffect } from 'react';
import { appointmentAPI, billAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // In a real app, we'd fetch only by patientId. 
      // For this demo, we fetch all and show them.
      const [appts, bls] = await Promise.all([
        appointmentAPI.getAll(),
        billAPI.getAll()
      ]);
      setAppointments(appts.slice(0, 5)); // Just show a few
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
          <h2 style={{ fontSize: '1.25rem', color: 'var(--primary-blue)', marginBottom: '1rem' }}>Upcoming Appointments</h2>
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
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-medium)' }}>
                    Reason: {a.reason || 'General Visit'}
                  </div>
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
                  <button className="btn btn-primary btn-sm" style={{ width: '100%', marginTop: '0.5rem' }}>Pay Now</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
