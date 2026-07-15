import { useState, useEffect } from 'react';
import { appointmentAPI, patientAPI, doctorAPI } from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import { showToast } from '../components/Toast';

const emptyForm = { patientId: '', doctorId: '', appointmentDate: '', appointmentTime: '', reason: '', status: 'SCHEDULED' };

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
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
      const [appts, pats, docs] = await Promise.all([
        appointmentAPI.getAll(),
        patientAPI.getAll(),
        doctorAPI.getAll(),
      ]);
      setAppointments(appts);
      setPatients(pats);
      setDoctors(docs);
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

  const openAdd = () => { setForm(emptyForm); setEditingId(null); setModalOpen(true); };

  const openEdit = (appt) => {
    setForm({
      patientId: appt.patientId,
      doctorId: appt.doctorId,
      appointmentDate: appt.appointmentDate,
      appointmentTime: appt.appointmentTime,
      reason: appt.reason || '',
      status: appt.status,
    });
    setEditingId(appt.appointmentId);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        patientId: parseInt(form.patientId),
        doctorId: parseInt(form.doctorId),
      };
      if (editingId) {
        await appointmentAPI.update(editingId, payload);
        showToast('Appointment updated', 'success');
      } else {
        await appointmentAPI.create(payload);
        showToast('Appointment created', 'success');
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
      await appointmentAPI.delete(deleteId);
      showToast('Appointment deleted', 'success');
      setConfirmOpen(false);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to delete', 'error');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SCHEDULED': return 'badge-info';
      case 'COMPLETED': return 'badge-success';
      case 'CANCELLED': return 'badge-danger';
      case 'NO_SHOW': return 'badge-warning';
      default: return 'badge-muted';
    }
  };

  const filtered = appointments.filter(a =>
    getPatientName(a.patientId).toLowerCase().includes(search.toLowerCase()) ||
    getDoctorName(a.doctorId).toLowerCase().includes(search.toLowerCase()) ||
    a.status.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-actions">
          <div>
            <h1>Appointments</h1>
            <p>Schedule and manage appointments</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>+ New Appointment</button>
        </div>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <h2>{filtered.length} Appointment{filtered.length !== 1 ? 's' : ''}</h2>
          <div className="table-search">
            <span className="table-search-icon">🔍</span>
            <input type="text" placeholder="Search appointments..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Date</th>
              <th>Time</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="7">
                  <div className="table-empty">
                    <div className="table-empty-icon">📅</div>
                    <p>No appointments found</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map(a => (
                <tr key={a.appointmentId}>
                  <td>{getPatientName(a.patientId)}</td>
                  <td>{getDoctorName(a.doctorId)}</td>
                  <td>{a.appointmentDate}</td>
                  <td>{a.appointmentTime}</td>
                  <td>{a.reason || '—'}</td>
                  <td><span className={`badge ${getStatusBadge(a.status)}`}>{a.status}</span></td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(a)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => { setDeleteId(a.appointmentId); setConfirmOpen(true); }}>Delete</button>
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
        title={editingId ? 'Edit Appointment' : 'New Appointment'}
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
                  <option key={d.doctorId} value={d.doctorId}>{d.doctorName} — {d.specialization}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date</label>
              <input type="date" name="appointmentDate" className="form-input" value={form.appointmentDate} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Time</label>
              <input type="time" name="appointmentTime" className="form-input" value={form.appointmentTime} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Reason</label>
            <input type="text" name="reason" className="form-input" placeholder="Reason for visit (optional)" value={form.reason} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select name="status" className="form-select" value={form.status} onChange={handleChange} required>
              <option value="SCHEDULED">Scheduled</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="NO_SHOW">No Show</option>
            </select>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Appointment?"
        message="This will permanently remove this appointment record."
      />
    </div>
  );
}
