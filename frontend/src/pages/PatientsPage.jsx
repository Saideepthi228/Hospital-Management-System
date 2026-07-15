import { useState, useEffect } from 'react';
import { patientAPI } from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import { showToast } from '../components/Toast';

const emptyForm = { patientName: '', age: '', gender: '', phoneNumber: '', address: '' };

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadPatients(); }, []);

  const loadPatients = async () => {
    try {
      const data = await patientAPI.getAll();
      setPatients(data);
    } catch (err) {
      showToast('Failed to load patients', 'error');
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

  const openEdit = (patient) => {
    setForm({
      patientName: patient.patientName,
      age: patient.age,
      gender: patient.gender,
      phoneNumber: patient.phoneNumber,
      address: patient.address || '',
    });
    setEditingId(patient.patientId);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, age: parseInt(form.age) };
      if (editingId) {
        await patientAPI.update(editingId, payload);
        showToast('Patient updated successfully', 'success');
      } else {
        await patientAPI.create(payload);
        showToast('Patient added successfully', 'success');
      }
      setModalOpen(false);
      loadPatients();
    } catch (err) {
      showToast(err.message || 'Failed to save patient', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await patientAPI.delete(deleteId);
      showToast('Patient deleted', 'success');
      setConfirmOpen(false);
      loadPatients();
    } catch (err) {
      showToast(err.message || 'Failed to delete', 'error');
    }
  };

  const filtered = patients.filter(p =>
    p.patientName.toLowerCase().includes(search.toLowerCase()) ||
    p.phoneNumber.includes(search)
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-actions">
          <div>
            <h1>Patients</h1>
            <p>Manage patient records</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Patient</button>
        </div>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <h2>{filtered.length} Patient{filtered.length !== 1 ? 's' : ''}</h2>
          <div className="table-search">
            <span className="table-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search patients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6">
                  <div className="table-empty">
                    <div className="table-empty-icon">👤</div>
                    <p>No patients found</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map(p => (
                <tr key={p.patientId}>
                  <td>{p.patientName}</td>
                  <td>{p.age}</td>
                  <td><span className="badge badge-purple">{p.gender}</span></td>
                  <td>{p.phoneNumber}</td>
                  <td>{p.address || '—'}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => { setDeleteId(p.patientId); setConfirmOpen(true); }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Patient' : 'Add Patient'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Update' : 'Add Patient'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" name="patientName" className="form-input" placeholder="Enter patient name" value={form.patientName} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Age</label>
              <input type="number" name="age" className="form-input" placeholder="Age" value={form.age} onChange={handleChange} min="0" required />
            </div>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select name="gender" className="form-select" value={form.gender} onChange={handleChange} required>
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input type="text" name="phoneNumber" className="form-input" placeholder="Enter phone number" value={form.phoneNumber} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <input type="text" name="address" className="form-input" placeholder="Enter address (optional)" value={form.address} onChange={handleChange} />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Patient?"
        message="This will permanently remove the patient record and cannot be undone."
      />
    </div>
  );
}
