import { useState, useEffect } from 'react';
import { doctorAPI } from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import { showToast } from '../components/Toast';

const emptyForm = { doctorName: '', specialization: '', phoneNumber: '', email: '', experience: '' };

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadDoctors(); }, []);

  const loadDoctors = async () => {
    try {
      const data = await doctorAPI.getAll();
      setDoctors(data);
    } catch {
      showToast('Failed to load doctors', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (doctor) => {
    setForm({
      doctorName: doctor.doctorName,
      specialization: doctor.specialization,
      phoneNumber: doctor.phoneNumber,
      email: doctor.email,
      experience: doctor.experience,
    });
    setEditingId(doctor.doctorId);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, experience: parseInt(form.experience) };
      if (editingId) {
        await doctorAPI.update(editingId, payload);
        showToast('Doctor updated successfully', 'success');
      } else {
        await doctorAPI.create(payload);
        showToast('Doctor added successfully', 'success');
      }
      setModalOpen(false);
      loadDoctors();
    } catch (err) {
      showToast(err.message || 'Failed to save doctor', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await doctorAPI.delete(deleteId);
      showToast('Doctor deleted', 'success');
      setConfirmOpen(false);
      loadDoctors();
    } catch (err) {
      showToast(err.message || 'Failed to delete', 'error');
    }
  };

  const filtered = doctors.filter(d =>
    d.doctorName.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-actions">
          <div>
            <h1>Doctors</h1>
            <p>Manage doctor profiles</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Doctor</button>
        </div>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <h2>{filtered.length} Doctor{filtered.length !== 1 ? 's' : ''}</h2>
          <div className="table-search">
            <span className="table-search-icon">🔍</span>
            <input type="text" placeholder="Search doctors..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Specialization</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Experience</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6">
                  <div className="table-empty">
                    <div className="table-empty-icon">🩺</div>
                    <p>No doctors found</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map(d => (
                <tr key={d.doctorId}>
                  <td>{d.doctorName}</td>
                  <td><span className="badge badge-info">{d.specialization}</span></td>
                  <td>{d.email}</td>
                  <td>{d.phoneNumber}</td>
                  <td>{d.experience} yrs</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(d)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => { setDeleteId(d.doctorId); setConfirmOpen(true); }}>Delete</button>
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
        title={editingId ? 'Edit Doctor' : 'Add Doctor'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Update' : 'Add Doctor'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" name="doctorName" className="form-input" placeholder="Enter doctor name" value={form.doctorName} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Specialization</label>
              <input type="text" name="specialization" className="form-input" placeholder="e.g. Cardiology" value={form.specialization} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Experience (Years)</label>
              <input type="number" name="experience" className="form-input" placeholder="Years" value={form.experience} onChange={handleChange} min="0" required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" name="email" className="form-input" placeholder="doctor@email.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input type="text" name="phoneNumber" className="form-input" placeholder="Enter phone number" value={form.phoneNumber} onChange={handleChange} required />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Doctor?"
        message="This will permanently remove the doctor profile."
      />
    </div>
  );
}
