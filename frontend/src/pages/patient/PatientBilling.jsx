import { useState, useEffect } from 'react';
import { billAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { showToast } from '../../components/Toast';

export default function PatientBilling() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, bill: null });
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const b = await billAPI.getByPatient(user.refId);
      setBills(b);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayClick = (bill) => {
    setPaymentModal({ isOpen: true, bill });
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    setProcessing(true);

    // Simulate payment gateway delay
    setTimeout(async () => {
      try {
        const paidBill = await billAPI.pay(paymentModal.bill.billId, 'CARD');
        showToast('Payment successful! Thank you.', 'success');
        setReceipt(paidBill);
        setPaymentModal({ isOpen: false, bill: null });
        loadData();
      } catch (err) {
        showToast('Payment failed. Try again.', 'error');
      } finally {
        setProcessing(false);
      }
    }, 2000);
  };

  if (loading) return <LoadingSpinner />;

  const totalOutstanding = bills.filter(b => b.paymentStatus === 'UNPAID').reduce((acc, curr) => acc + curr.amount, 0);
  const totalPaid = bills.filter(b => b.paymentStatus === 'PAID').reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--text-dark)', fontWeight: 700 }}>Billing & Payments</h2>
      </div>

      <div className="stat-cards" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>⚠️</div>
          <span className="stat-title">Amount Due</span>
          <span className="stat-value" style={{ color: 'var(--danger)' }}>₹{totalOutstanding.toLocaleString()}</span>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>✓</div>
          <span className="stat-title">Total Paid</span>
          <span className="stat-value" style={{ color: 'var(--success)' }}>₹{totalPaid.toLocaleString()}</span>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}>📄</div>
          <span className="stat-title">Total Invoices</span>
          <span className="stat-value">{bills.length}</span>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Invoice History</h3>
        
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bills.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <div className="table-empty">No billing history found.</div>
                  </td>
                </tr>
              ) : (
                bills.map(b => (
                  <tr key={b.billId}>
                    <td>{b.billingDate}</td>
                    <td>{b.description || 'Medical Consultation & Services'}</td>
                    <td style={{ fontWeight: 'bold' }}>₹{b.amount.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${b.paymentStatus === 'PAID' ? 'badge-success' : 'badge-warning'}`}>
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td>
                      {b.paymentStatus === 'UNPAID' ? (
                        <button className="btn btn-primary btn-sm" onClick={() => handlePayClick(b)}>Pay Now</button>
                      ) : (
                        <button className="btn btn-secondary btn-sm" onClick={() => setReceipt(b)}>View Receipt</button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {paymentModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h2>Complete Payment</h2>
              <button className="modal-close" onClick={() => !processing && setPaymentModal({ isOpen: false, bill: null })}>&times;</button>
            </div>
            <div className="modal-body">
              <div style={{ background: 'var(--bg-light)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-medium)' }}>Amount to Pay</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>₹{paymentModal.bill.amount.toLocaleString()}</span>
              </div>
              
              <form onSubmit={handlePaymentSubmit}>
                <div className="form-group">
                  <label className="form-label">Cardholder Name</label>
                  <input type="text" className="form-input" required placeholder="Name on card" disabled={processing} />
                </div>
                <div className="form-group">
                  <label className="form-label">Card Number</label>
                  <input type="text" className="form-input" required placeholder="0000 0000 0000 0000" maxLength="19" disabled={processing} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Expiry Date</label>
                    <input type="text" className="form-input" required placeholder="MM/YY" maxLength="5" disabled={processing} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CVV</label>
                    <input type="password" className="form-input" required placeholder="123" maxLength="4" disabled={processing} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.85rem', position: 'relative' }} disabled={processing}>
                  {processing ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                      <span className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px', borderColor: 'white', borderTopColor: 'transparent' }}></span>
                      Processing...
                    </span>
                  ) : 'Pay Securely'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {receipt && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Payment Receipt</h2>
              <button className="modal-close" onClick={() => setReceipt(null)}>&times;</button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1.5rem' }}>✓</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Payment Successful</h3>
              <p style={{ color: 'var(--text-medium)', marginBottom: '2rem' }}>Your transaction has been processed.</p>
              
              <div style={{ textAlign: 'left', background: 'var(--bg-light)', padding: '1.5rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--text-medium)' }}>Amount Paid</span>
                  <strong style={{ fontSize: '1.1rem' }}>₹{receipt.amount.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--text-medium)' }}>Transaction ID</span>
                  <span style={{ fontFamily: 'monospace' }}>{receipt.transactionId || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--text-medium)' }}>Payment Method</span>
                  <span>{receipt.paymentMethod || 'CARD'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-medium)' }}>Date</span>
                  <span>{receipt.paidDate || receipt.billingDate}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => setReceipt(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => { showToast('Receipt downloaded', 'success'); setReceipt(null); }}>Download PDF</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
