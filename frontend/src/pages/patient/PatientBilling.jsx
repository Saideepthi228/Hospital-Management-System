import { useState, useEffect } from 'react';
import { billAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { showToast } from '../../components/Toast';

export default function PatientBilling() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  
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

  const handlePay = async (billId, amount) => {
    // Simulate payment
    showToast(`Processing payment of ₹${amount}...`, 'info');
    setTimeout(async () => {
      try {
        const bill = bills.find(b => b.billId === billId);
        await billAPI.update(billId, { ...bill, paymentStatus: 'PAID' });
        showToast('Payment successful! Thank you.', 'success');
        loadData();
      } catch (err) {
        showToast('Payment failed. Try again.', 'error');
      }
    }, 1500);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="card">
      <h2 style={{ fontSize: '1.25rem', color: 'var(--primary-blue)', marginBottom: '1.5rem' }}>Billing & Payments</h2>
      
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
                  <td>Medical Consultation & Services</td>
                  <td style={{ fontWeight: 'bold' }}>₹{b.amount.toLocaleString()}</td>
                  <td>
                    <span className={`badge ${b.paymentStatus === 'PAID' ? 'badge-success' : 'badge-warning'}`}>
                      {b.paymentStatus}
                    </span>
                  </td>
                  <td>
                    {b.paymentStatus === 'UNPAID' ? (
                      <button className="btn btn-primary btn-sm" onClick={() => handlePay(b.billId, b.amount)}>Pay Now</button>
                    ) : (
                      <span style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>Paid</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
