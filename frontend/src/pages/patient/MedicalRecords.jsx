import { useState, useEffect } from 'react';
import { labReportAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function MedicalRecords() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await labReportAPI.getByPatient(user.refId);
        setReports(data.sort((a, b) => new Date(b.reportDate) - new Date(a.reportDate)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user.refId]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="card">
      <h2 style={{ fontSize: '1.25rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>My Medical Records</h2>
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Report Type</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 ? (
              <tr>
                <td colSpan="3">
                  <div className="table-empty">No medical records found.</div>
                </td>
              </tr>
            ) : (
              reports.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600 }}>{r.reportDate}</td>
                  <td>{r.reportType}</td>
                  <td>
                    <a href={r.reportUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline">
                      📄 View Report
                    </a>
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
