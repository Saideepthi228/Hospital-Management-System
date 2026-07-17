import { useState, useEffect } from 'react';
import { prescriptionAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function PatientPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const rx = await prescriptionAPI.getByPatient(user.refId);
      setPrescriptions(rx);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="card">
      <h2 style={{ fontSize: '1.25rem', color: 'var(--primary-blue)', marginBottom: '1.5rem' }}>My Prescriptions</h2>
      
      {prescriptions.length === 0 ? (
        <div className="table-empty">
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💊</div>
          <p>You have no active prescriptions.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {prescriptions.map(rx => (
            <div key={rx.prescriptionId} style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--text-dark)' }}>{rx.medication}</h3>
                  <p style={{ color: 'var(--primary-blue)', fontWeight: '600' }}>{rx.dosage}</p>
                </div>
                <span className="badge badge-success">Active</span>
              </div>
              <div style={{ backgroundColor: 'var(--bg-light)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                <strong>Instructions:</strong> {rx.instructions || 'Take as directed by your physician.'}
              </div>
              <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-light)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Prescribed by: {rx.doctorName || 'Your Doctor'}</span>
                <span>Date: {rx.prescriptionDate}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
