import { useState, useEffect } from 'react';
import { billAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { showToast } from '../../components/Toast';

export default function RevenueDashboard() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const b = await billAPI.getAll();
      setBills(b);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (bill) => {
    if (window.confirm(`Mark bill for ${bill.patientName} (₹${bill.amount}) as PAID via CASH?`)) {
      try {
        await billAPI.pay(bill.billId, 'CASH');
        showToast('Bill marked as paid', 'success');
        loadData();
      } catch (err) {
        showToast('Failed to update bill', 'error');
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  const totalRevenue = bills.filter(b => b.paymentStatus === 'PAID').reduce((acc, curr) => acc + curr.amount, 0);
  const pendingRevenue = bills.filter(b => b.paymentStatus === 'UNPAID').reduce((acc, curr) => acc + curr.amount, 0);
  
  const filteredBills = bills.filter(b => filter === 'ALL' ? true : b.paymentStatus === filter);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--text-dark)', fontWeight: 700 }}>Hospital Revenue</h2>
      </div>

      <div className="stat-cards" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>💰</div>
          <span className="stat-title">Total Collected</span>
          <span className="stat-value" style={{ color: 'var(--success)' }}>₹{totalRevenue.toLocaleString()}</span>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>⏳</div>
          <span className="stat-title">Pending Payments</span>
          <span className="stat-value" style={{ color: 'var(--warning)' }}>₹{pendingRevenue.toLocaleString()}</span>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>🧾</div>
          <span className="stat-title">Total Invoices</span>
          <span className="stat-value">{bills.length}</span>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem' }}>All Transactions</h3>
          <select className="form-select" style={{ width: 'auto' }} value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="ALL">All Status</option>
            <option value="PAID">Paid Only</option>
            <option value="UNPAID">Unpaid Only</option>
          </select>
        </div>
        
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Bill ID</th>
                <th>Patient</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    <div className="table-empty">No transactions found.</div>
                  </td>
                </tr>
              ) : (
                filteredBills.map(b => (
                  <tr key={b.billId}>
                    <td>#{b.billId}</td>
                    <td style={{ fontWeight: 600 }}>{b.patientName || `Patient #${b.patientId}`}</td>
                    <td>{b.billingDate}</td>
                    <td style={{ fontWeight: 'bold' }}>₹{b.amount.toLocaleString()}</td>
                    <td>{b.paymentMethod || '-'}</td>
                    <td>
                      <span className={`badge ${b.paymentStatus === 'PAID' ? 'badge-success' : 'badge-warning'}`}>
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td>
                      {b.paymentStatus === 'UNPAID' && (
                        <button className="btn btn-secondary btn-sm" onClick={() => handleMarkPaid(b)}>Mark Cash Paid</button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
