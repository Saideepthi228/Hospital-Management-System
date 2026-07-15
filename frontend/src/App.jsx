import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import HomePage from './pages/public/HomePage';
import LoginPage from './pages/public/LoginPage';

import PatientPortalLayout from './layouts/PatientPortalLayout';
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientPrescriptions from './pages/patient/PatientPrescriptions';
import PatientBilling from './pages/patient/PatientBilling';
import DoctorDirectory from './pages/patient/DoctorDirectory';

import DoctorPortalLayout from './layouts/DoctorPortalLayout';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import WritePrescription from './pages/doctor/WritePrescription';

const ProtectedPatientRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user || user.role !== 'PATIENT') return <Navigate to="/login/patient" replace />;
  return children;
};

const ProtectedDoctorRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user || user.role !== 'DOCTOR') return <Navigate to="/login/doctor" replace />;
  return children;
};

function App() {
  return (
    <Routes>
      {/* Public Website */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login/:type" element={<LoginPage />} />
      </Route>

      {/* Patient Portal */}
      <Route path="/portal/patient" element={<ProtectedPatientRoute><PatientPortalLayout /></ProtectedPatientRoute>}>
        <Route path="dashboard" element={<PatientDashboard />} />
        <Route path="prescriptions" element={<PatientPrescriptions />} />
        <Route path="billing" element={<PatientBilling />} />
        <Route path="doctors" element={<DoctorDirectory />} />
        <Route path="" element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Doctor Portal */}
      <Route path="/portal/doctor" element={<ProtectedDoctorRoute><DoctorPortalLayout /></ProtectedDoctorRoute>}>
        <Route path="dashboard" element={<DoctorDashboard />} />
        <Route path="appointments" element={<DoctorAppointments />} />
        <Route path="prescribe" element={<WritePrescription />} />
        <Route path="" element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
