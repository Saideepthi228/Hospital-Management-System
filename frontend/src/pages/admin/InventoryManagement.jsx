import { useState, useEffect } from 'react';
import { medicineAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function InventoryManagement() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newMed, setNewMed] = useState({ name: '', stockQuantity: 0, price: 0, manufacturer: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const data = await medicineAPI.getAll();
      setMedicines(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await medicineAPI.create(newMed);
      setIsAdding(false);
      setNewMed({ name: '', stockQuantity: 0, price: 0, manufacturer: '' });
      await loadData();
    } catch (err) {
      console.error("Failed to add medicine", err);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this medicine?")) return;
    try {
      await medicineAPI.delete(id);
      setMedicines(medicines.filter(m => m.id !== id));
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--text-dark)' }}>Pharmacy & Inventory</h2>
        <button className="btn btn-primary" onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? 'Cancel' : '+ Add Medicine'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddSubmit} style={{ backgroundColor: 'var(--bg-light)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem', display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Medicine Name</label>
            <input type="text" className="form-input" value={newMed.name} onChange={e => setNewMed({...newMed, name: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Manufacturer</label>
            <input type="text" className="form-input" value={newMed.manufacturer} onChange={e => setNewMed({...newMed, manufacturer: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Stock Quantity</label>
            <input type="number" className="form-input" value={newMed.stockQuantity} onChange={e => setNewMed({...newMed, stockQuantity: parseInt(e.target.value)})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Price (₹)</label>
            <input type="number" step="0.01" className="form-input" value={newMed.price} onChange={e => setNewMed({...newMed, price: parseFloat(e.target.value)})} required />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Save Medicine</button>
          </div>
        </form>
      )}

      {medicines.length === 0 ? (
        <p style={{ color: 'var(--text-medium)', textAlign: 'center', padding: '2rem' }}>No medicines in inventory.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-medium)' }}>
                <th style={{ padding: '1rem' }}>Name</th>
                <th style={{ padding: '1rem' }}>Manufacturer</th>
                <th style={{ padding: '1rem' }}>Stock</th>
                <th style={{ padding: '1rem' }}>Price</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((m) => (
                <tr key={m.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem', fontWeight: '500', color: 'var(--text-dark)' }}>{m.name}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-medium)' }}>{m.manufacturer || 'N/A'}</td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`badge ${m.stockQuantity > 50 ? 'badge-success' : 'badge-warning'}`}>
                      {m.stockQuantity}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-dark)' }}>₹{m.price.toFixed(2)}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button className="btn btn-sm btn-secondary" onClick={() => handleDelete(m.id)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
