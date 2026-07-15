import { useState, useEffect } from 'react';
import { prescriptionAPI, patientAPI, doctorAPI, appointmentAPI } from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import { showToast } from '../components/Toast';

const emptyForm = {
  appointmentId: '', patientId: '', doctorId: '',
  medication: '', dosage: '', instructions: '', prescriptionDate: '',
};

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [rx, pats, docs, appts] = await Promise.all([
        prescriptionAPI.getAll(),
        patientAPI.getAll(),
        doctorAPI.getAll(),
        appointmentAPI.getAll(),
      ]);
      setPrescriptions(rx);
      setPatients(pats);
      setDoctors(docs);
      setAppointments(appts);
    } catch {
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const getPatientName = (id) => patients.find(p => p.patientId === id)?.patientName || `Patient #${id}`;
  const getDoctorName = (id) => doctors.find(d => d.doctorId === id)?.doctorName || `Doctor #${id}`;

  const openAdd = () => {
    setForm({ ...emptyForm, prescriptionDate: new Date().toISOString().split('T')[0] });
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (rx) => {
    setForm({
      appointmentId: rx.appointmentId,
      patientId: rx.patientId,
      doctorId: rx.doctorId,
      medication: rx.medication,
      dosage: rx.dosage,
      instructions: rx.instructions || '',
      prescriptionDate: rx.prescriptionDate,
    });
    setEditingId(rx.prescriptionId);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        appointmentId: parseInt(form.appointmentId),
        patientId: parseInt(form.patientId),
        doctorId: parseInt(form.doctorId),
      };
      if (editingId) {
        await prescriptionAPI.update(editingId, payload);
        showToast('Prescription updated', 'success');
      } else {
        await prescriptionAPI.create(payload);
        showToast('Prescription created', 'success');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await prescriptionAPI.delete(deleteId);
      showToast('Prescription deleted', 'success');
      setConfirmOpen(false);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to delete', 'error');
    }
  };

  const filtered = prescriptions.filter(rx =>
    (rx.patientName || getPatientName(rx.patientId)).toLowerCase().includes(search.toLowerCase()) ||
    (rx.doctorName || getDoctorName(rx.doctorId)).toLowerCase().includes(search.toLowerCase()) ||
    rx.medication.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-actions">
          <div>
            <h1>Prescriptions</h1>
            <p>Manage patient prescriptions</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>+ New Prescription</button>
        </div>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <h2>{filtered.length} Prescription{filtered.length !== 1 ? 's' : ''}</h2>
          <div className="table-search">
            <span className="table-search-icon">🔍</span>
            <input type="text" placeholder="Search prescriptions..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Medication</th>
              <th>Dosage</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6">
                  <div className="table-empty">
                    <div className="table-empty-icon">💊</div>
                    <p>No prescriptions found</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map(rx => (
                <tr key={rx.prescriptionId}>
                  <td>{rx.patientName || getPatientName(rx.patientId)}</td>
                  <td>{rx.doctorName || getDoctorName(rx.doctorId)}</td>
                  <td><span className="badge badge-purple">{rx.medication}</span></td>
                  <td>{rx.dosage}</td>
                  <td>{rx.prescriptionDate}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(rx)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => { setDeleteId(rx.prescriptionId); setConfirmOpen(true); }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Prescription' : 'New Prescription'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Patient</label>
              <select name="patientId" className="form-select" value={form.patientId} onChange={handleChange} required>
                <option value="">Select patient</option>
                {patients.map(p => (
                  <option key={p.patientId} value={p.patientId}>{p.patientName}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Doctor</label>
              <select name="doctorId" className="form-select" value={form.doctorId} onChange={handleChange} required>
                <option value="">Select doctor</option>
                {doctors.map(d => (
                  <option key={d.doctorId} value={d.doctorId}>{d.doctorName}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Appointment</label>
            <select name="appointmentId" className="form-select" value={form.appointmentId} onChange={handleChange} required>
              <option value="">Select appointment</option>
              {appointments.map(a => (
                <option key={a.appointmentId} value={a.appointmentId}>
                  #{a.appointmentId} — {a.appointmentDate} ({a.status})
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Medication</label>
              <input type="text" name="medication" className="form-input" placeholder="Medicine name" value={form.medication} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Dosage</label>
              <input type="text" name="dosage" className="form-input" placeholder="e.g. 500mg twice daily" value={form.dosage} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Instructions</label>
            <input type="text" name="instructions" className="form-input" placeholder="Additional instructions (optional)" value={form.instructions} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Prescription Date</label>
            <input type="date" name="prescriptionDate" className="form-input" value={form.prescriptionDate} onChange={handleChange} required />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Prescription?"
        message="This will permanently remove this prescription record."
      />
    </div>
  );
}
