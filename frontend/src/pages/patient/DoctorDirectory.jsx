import { useState, useEffect } from 'react';
import { doctorAPI, appointmentAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { showToast } from '../../components/Toast';

export default function DoctorDirectory() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Booking state
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [bookForm, setBookForm] = useState({ appointmentDate: '', appointmentTime: '', reason: '' });
  const [bookingLoading, setBookingLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

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

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!user.refId) {
      showToast('Error: Patient ID not found. Please re-login.', 'error');
      return;
    }
    setBookingLoading(true);
    try {
      await appointmentAPI.create({
        patientId: user.refId,
        doctorId: bookingDoctor.doctorId,
        appointmentDate: bookForm.appointmentDate,
        appointmentTime: bookForm.appointmentTime,
        reason: bookForm.reason,
        status: 'SCHEDULED'
      });
      showToast('Appointment booked successfully!', 'success');
      setBookingDoctor(null);
    } catch (err) {
      showToast(err.message || 'Failed to book appointment', 'error');
    } finally {
      setBookingLoading(false);
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
        <h2 style={{ fontSize: '1.25rem', color: 'var(--primary-blue)' }}>Find a Doctor & Book</h2>
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
            <div key={doc.doctorId} className="card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--light-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'var(--primary-blue)', flexShrink: 0 }}>
                  👨‍⚕️
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--text-dark)', marginBottom: '0.25rem' }}>Dr. {doc.doctorName}</h3>
                  <span className="badge badge-info" style={{ marginBottom: '0.5rem' }}>{doc.specialization}</span>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-medium)' }}>Experience: {doc.experience} years</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>{doc.email}</p>
                </div>
              </div>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setBookingDoctor(doc);
                  setBookForm({ appointmentDate: '', appointmentTime: '', reason: '' });
                }}
              >
                Book
              </button>
            </div>
          ))
        )}
      </div>

      {bookingDoctor && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', margin: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
              Book with Dr. {bookingDoctor.doctorName}
            </h2>
            <form onSubmit={handleBookSubmit}>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={bookForm.appointmentDate}
                  onChange={e => setBookForm({...bookForm, appointmentDate: e.target.value})}
                  required 
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Time</label>
                <input 
                  type="time" 
                  className="form-input" 
                  value={bookForm.appointmentTime}
                  onChange={e => setBookForm({...bookForm, appointmentTime: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Reason</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="E.g., Routine Checkup"
                  value={bookForm.reason}
                  onChange={e => setBookForm({...bookForm, reason: e.target.value})}
                  required 
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setBookingDoctor(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={bookingLoading}>
                  {bookingLoading ? 'Booking...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
