import { useState, useEffect } from 'react';
import { patientAPI, labReportAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { showToast } from '../../components/Toast';

export default function UploadLabReport() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [form, setForm] = useState({
    patientId: '',
    reportType: '',
    reportUrl: '',
    reportDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await patientAPI.getAll();
        setPatients(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await labReportAPI.create({
        patientId: parseInt(form.patientId),
        doctorId: user.refId,
        reportType: form.reportType,
        reportUrl: form.reportUrl,
        reportDate: form.reportDate
      });
      showToast('Lab report uploaded successfully!', 'success');
      setForm({ ...form, patientId: '', reportType: '', reportUrl: '' });
    } catch (err) {
      showToast('Failed to upload report', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ maxWidth: '600px' }}>
      <h2 style={{ fontSize: '1.25rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>Upload Medical Record</h2>
      
      <form className="card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Patient</label>
          <select className="form-select" value={form.patientId} onChange={e => setForm({ ...form, patientId: e.target.value })} required>
            <option value="">-- Select Patient --</option>
            {patients.map(p => (
              <option key={p.patientId} value={p.patientId}>{p.patientName}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Report Type</label>
          <input type="text" className="form-input" placeholder="e.g. Blood Test, X-Ray, MRI Scan" value={form.reportType} onChange={e => setForm({ ...form, reportType: e.target.value })} required />
        </div>

        <div className="form-group">
          <label className="form-label">Report URL (Cloud Link)</label>
          <input type="url" className="form-input" placeholder="https://..." value={form.reportUrl} onChange={e => setForm({ ...form, reportUrl: e.target.value })} required />
          <small style={{ color: 'var(--text-light)', marginTop: '0.25rem', display: 'block' }}>Paste the link to the uploaded document (Google Drive, AWS, etc.)</small>
        </div>

        <div className="form-group">
          <label className="form-label">Date</label>
          <input type="date" className="form-input" value={form.reportDate} onChange={e => setForm({ ...form, reportDate: e.target.value })} required />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={submitting}>
          {submitting ? 'Uploading...' : 'Upload Record'}
        </button>
      </form>
    </div>
  );
}
