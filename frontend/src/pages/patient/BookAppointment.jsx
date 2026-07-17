import { useState, useEffect } from 'react';
import { doctorAPI, appointmentAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { showToast } from '../../components/Toast';

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
];

export default function BookAppointment() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [form, setForm] = useState({
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
    duration: 30,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const docs = await doctorAPI.getAll();
        setDoctors(docs);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  // Fetch booked slots when doctor or date changes
  useEffect(() => {
    if (form.doctorId && form.appointmentDate) {
      const fetchSlots = async () => {
        try {
          const appts = await appointmentAPI.getByDoctor(form.doctorId);
          const taken = appts
            .filter(a => a.appointmentDate === form.appointmentDate && a.status !== 'CANCELLED')
            .map(a => a.appointmentTime.substring(0, 5));
          setBookedSlots(taken);
        } catch { setBookedSlots([]); }
      };
      fetchSlots();
    }
  }, [form.doctorId, form.appointmentDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await appointmentAPI.create({
        patientId: user.refId,
        doctorId: parseInt(form.doctorId),
        appointmentDate: form.appointmentDate,
        appointmentTime: form.appointmentTime + ':00',
        reason: form.reason,
        duration: form.duration,
        status: 'SCHEDULED',
      });
      showToast('Appointment booked successfully!', 'success');
      setForm({ doctorId: '', appointmentDate: '', appointmentTime: '', reason: '', duration: 30 });
      setBookedSlots([]);
    } catch (err) {
      showToast(err.message || 'Failed to book appointment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const today = new Date().toISOString().split('T')[0];
  const selectedDoctor = doctors.find(d => d.doctorId === parseInt(form.doctorId));

  return (
    <div style={{ maxWidth: '700px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.25rem' }}>Book an Appointment</h2>
        <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Select your doctor, pick a date, and choose an available time slot.</p>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem' }}>
        {/* Doctor Selection */}
        <div className="form-group">
          <label className="form-label">Select Doctor</label>
          <select className="form-select" value={form.doctorId} onChange={e => setForm({ ...form, doctorId: e.target.value, appointmentTime: '' })} required>
            <option value="">-- Choose a doctor --</option>
            {doctors.map(d => (
              <option key={d.doctorId} value={d.doctorId}>
                Dr. {d.doctorName} — {d.specialization || 'General'}
              </option>
            ))}
          </select>
        </div>

        {selectedDoctor && (
          <div style={{ background: 'var(--bg-light)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div className="portal-avatar" style={{ background: 'var(--success)', width: 40, height: 40, fontSize: '0.9rem' }}>
              {selectedDoctor.doctorName[0]}
            </div>
            <div>
              <strong>Dr. {selectedDoctor.doctorName}</strong>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>{selectedDoctor.specialization} · {selectedDoctor.experience || 0} yrs experience</p>
            </div>
          </div>
        )}

        {/* Date */}
        <div className="form-group">
          <label className="form-label">Appointment Date</label>
          <input type="date" className="form-input" value={form.appointmentDate} min={today} onChange={e => setForm({ ...form, appointmentDate: e.target.value, appointmentTime: '' })} required />
        </div>

        {/* Time Slots */}
        {form.appointmentDate && form.doctorId && (
          <div className="form-group">
            <label className="form-label">Available Time Slots</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '0.5rem' }}>
              {TIME_SLOTS.map(slot => {
                const isBooked = bookedSlots.includes(slot);
                const isSelected = form.appointmentTime === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={isBooked}
                    onClick={() => setForm({ ...form, appointmentTime: slot })}
                    style={{
                      padding: '0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      background: isBooked ? '#f1f5f9' : isSelected ? 'var(--primary-light, #eff6ff)' : 'white',
                      color: isBooked ? '#94a3b8' : isSelected ? 'var(--primary)' : 'var(--text-dark)',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: '0.85rem',
                      cursor: isBooked ? 'not-allowed' : 'pointer',
                      textDecoration: isBooked ? 'line-through' : 'none',
                      transition: 'var(--transition)',
                    }}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Duration */}
        <div className="form-group">
          <label className="form-label">Duration</label>
          <select className="form-select" value={form.duration} onChange={e => setForm({ ...form, duration: parseInt(e.target.value) })}>
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>60 minutes</option>
          </select>
        </div>

        {/* Reason */}
        <div className="form-group">
          <label className="form-label">Reason for Visit</label>
          <input type="text" className="form-input" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="e.g., Routine checkup, Follow-up, etc." />
        </div>

        <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '0.5rem' }} disabled={submitting || !form.appointmentTime}>
          {submitting ? 'Booking...' : '📅 Book Appointment'}
        </button>
      </form>
    </div>
  );
}
