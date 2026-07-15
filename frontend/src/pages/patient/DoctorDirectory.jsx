import { useState, useEffect } from 'react';
import { doctorAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function DoctorDirectory() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const docs = await doctorAPI.getAll();
      setDoctors(docs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = doctors.filter(d => 
    d.doctorName.toLowerCase().includes(search.toLowerCase()) || 
    d.specialization.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--primary-blue)' }}>Find a Doctor</h2>
        <div className="table-search">
          <input 
            type="text" 
            placeholder="Search by name or specialty..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
      </div>

      <div className="services-grid">
        {filtered.length === 0 ? (
          <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-light)' }}>No doctors found matching your search.</p>
        ) : (
          filtered.map(doc => (
            <div key={doc.doctorId} className="card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--light-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'var(--primary-blue)' }}>
                👨‍⚕️
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-dark)', marginBottom: '0.25rem' }}>Dr. {doc.doctorName}</h3>
                <span className="badge badge-info" style={{ marginBottom: '0.5rem' }}>{doc.specialization}</span>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-medium)' }}>Experience: {doc.experience} years</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>{doc.email}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
