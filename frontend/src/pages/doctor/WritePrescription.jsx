import { useState, useEffect } from 'react';
import { prescriptionAPI, appointmentAPI, patientAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { showToast } from '../../components/Toast';
import { useNavigate } from 'react-router-dom';

const emptyForm = { appointmentId: '', patientId: '', medication: '', dosage: '', instructions: '', prescriptionDate: new Date().toISOString().split('T')[0] };

export default function WritePrescription() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const navigate = useNavigate();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [appts, pats] = await Promise.all([appointmentAPI.getAll(), patientAPI.getAll()]);
      setAppointments(appts.filter(a => a.status === 'COMPLETED' || a.status === 'SCHEDULED'));
      setPatients(pats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAppointmentChange = (e) => {
    const apptId = e.target.value;
    const selectedAppt = appointments.find(a => a.appointmentId === parseInt(apptId));
    setForm(prev => ({ 
      ...prev, 
      appointmentId: apptId, 
      patientId: selectedAppt ? selectedAppt.patientId.toString() : '' 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.refId) {
        showToast('Error: Doctor ID not found. Please re-login.', 'error');
        setSaving(false);
        return;
      }
      const payload = {
        ...form,
        appointmentId: parseInt(form.appointmentId),
        patientId: parseInt(form.patientId),
        doctorId: parseInt(user.refId),
      };
      await prescriptionAPI.create(payload);
      showToast('Prescription saved successfully', 'success');
      setForm(emptyForm);
      navigate('/portal/doctor/dashboard');
    } catch (err) {
      showToast('Failed to save prescription', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="card" style={{ maxWidth: '800px' }}>
      <h2 style={{ fontSize: '1.25rem', color: 'var(--primary-blue)', marginBottom: '1.5rem' }}>Write Prescription</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Related Appointment</label>
            <select name="appointmentId" className="form-select" value={form.appointmentId} onChange={handleAppointmentChange} required>
              <option value="">Select Appointment</option>
              {appointments.map(a => {
                const pName = patients.find(p => p.patientId === a.patientId)?.patientName;
                return (
                  <option key={a.appointmentId} value={a.appointmentId}>
                    {a.appointmentDate} - {pName}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Patient</label>
            <select name="patientId" className="form-select" value={form.patientId} disabled required>
              <option value="">Auto-selected via appointment</option>
              {patients.map(p => (
                <option key={p.patientId} value={p.patientId}>{p.patientName}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Medication Name</label>
            <input type="text" name="medication" className="form-input" placeholder="e.g. Amoxicillin" value={form.medication} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Dosage</label>
            <input type="text" name="dosage" className="form-input" placeholder="e.g. 500mg twice daily" value={form.dosage} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Instructions for Patient</label>
          <textarea 
            name="instructions" 
            className="form-input" 
            placeholder="Take after meals, do not skip doses..." 
            value={form.instructions} 
            onChange={handleChange}
            rows="3"
            style={{ resize: 'vertical' }}
          ></textarea>
        </div>

        <div className="form-group" style={{ maxWidth: '200px' }}>
          <label className="form-label">Date</label>
          <input type="date" name="prescriptionDate" className="form-input" value={form.prescriptionDate} onChange={handleChange} required />
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={() => setForm(emptyForm)}>Reset Form</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Submit Prescription'}
          </button>
        </div>
      </form>
    </div>
  );
}
