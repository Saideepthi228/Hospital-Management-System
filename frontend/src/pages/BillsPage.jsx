import { useState, useEffect } from 'react';
import { billAPI, patientAPI } from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import { showToast } from '../components/Toast';

const emptyForm = { patientId: '', appointmentId: '', amount: '', paymentStatus: 'UNPAID', billingDate: '' };

export default function BillsPage() {
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
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
      const [b, p] = await Promise.all([billAPI.getAll(), patientAPI.getAll()]);
      setBills(b);
      setPatients(p);
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

  const openAdd = () => {
    setForm({ ...emptyForm, billingDate: new Date().toISOString().split('T')[0] });
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (bill) => {
    setForm({
      patientId: bill.patientId,
      appointmentId: bill.appointmentId || '',
      amount: bill.amount,
      paymentStatus: bill.paymentStatus,
      billingDate: bill.billingDate,
    });
    setEditingId(bill.billId);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        patientId: parseInt(form.patientId),
        appointmentId: form.appointmentId ? parseInt(form.appointmentId) : null,
        amount: parseFloat(form.amount),
      };
      if (editingId) {
        await billAPI.update(editingId, payload);
        showToast('Bill updated', 'success');
      } else {
        await billAPI.create(payload);
        showToast('Bill created', 'success');
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
      await billAPI.delete(deleteId);
      showToast('Bill deleted', 'success');
      setConfirmOpen(false);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to delete', 'error');
    }
  };

  const filtered = bills.filter(b =>
    (b.patientName || getPatientName(b.patientId)).toLowerCase().includes(search.toLowerCase()) ||
    b.paymentStatus.toLowerCase().includes(search.toLowerCase())
  );

  const totalAmount = filtered.reduce((sum, b) => sum + b.amount, 0);
  const paidCount = filtered.filter(b => b.paymentStatus === 'PAID').length;

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-actions">
          <div>
            <h1>Billing</h1>
            <p>Manage patient bills and payments</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>+ New Bill</button>
        </div>
      </div>

      <div className="stat-cards-grid">
        <div className="stat-card blue">
          <div className="stat-card-icon">📋</div>
          <div className="stat-card-content">
            <h3>Total Bills</h3>
            <div className="stat-value">{filtered.length}</div>
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-card-icon">✓</div>
          <div className="stat-card-content">
            <h3>Paid</h3>
            <div className="stat-value">{paidCount}</div>
          </div>
        </div>
        <div className="stat-card amber">
          <div className="stat-card-icon">⏳</div>
          <div className="stat-card-content">
            <h3>Unpaid</h3>
            <div className="stat-value">{filtered.length - paidCount}</div>
          </div>
        </div>
        <div className="stat-card purple">
          <div className="stat-card-icon">💰</div>
          <div className="stat-card-content">
            <h3>Total Amount</h3>
            <div className="stat-value">₹{totalAmount.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <h2>All Bills</h2>
          <div className="table-search">
            <span className="table-search-icon">🔍</span>
            <input type="text" placeholder="Search bills..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="5">
                  <div className="table-empty">
                    <div className="table-empty-icon">💳</div>
                    <p>No bills found</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map(b => (
                <tr key={b.billId}>
                  <td>{b.patientName || getPatientName(b.patientId)}</td>
                  <td style={{ fontWeight: 600 }}>₹{b.amount.toLocaleString()}</td>
                  <td>{b.billingDate}</td>
                  <td>
                    <span className={`badge ${b.paymentStatus === 'PAID' ? 'badge-success' : 'badge-warning'}`}>
                      {b.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(b)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => { setDeleteId(b.billId); setConfirmOpen(true); }}>Delete</button>
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
        title={editingId ? 'Edit Bill' : 'New Bill'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Update' : 'Create Bill'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Patient</label>
            <select name="patientId" className="form-select" value={form.patientId} onChange={handleChange} required>
              <option value="">Select patient</option>
              {patients.map(p => (
                <option key={p.patientId} value={p.patientId}>{p.patientName}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Amount (₹)</label>
              <input type="number" name="amount" className="form-input" placeholder="Enter amount" value={form.amount} onChange={handleChange} min="0" step="0.01" required />
            </div>
            <div className="form-group">
              <label className="form-label">Billing Date</label>
              <input type="date" name="billingDate" className="form-input" value={form.billingDate} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Payment Status</label>
              <select name="paymentStatus" className="form-select" value={form.paymentStatus} onChange={handleChange} required>
                <option value="UNPAID">Unpaid</option>
                <option value="PAID">Paid</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Appointment ID (Optional)</label>
              <input type="number" name="appointmentId" className="form-input" placeholder="Link to appointment" value={form.appointmentId} onChange={handleChange} />
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Bill?"
        message="This will permanently remove this billing record."
      />
    </div>
  );
}
