import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import HomePage from './pages/public/HomePage';
import LoginPage from './pages/public/LoginPage';

import PatientPortalLayout from './layouts/PatientPortalLayout';
import PatientDashboard from './pages/patient/PatientDashboard';
import BookAppointment from './pages/patient/BookAppointment';
import PatientPrescriptions from './pages/patient/PatientPrescriptions';
import MedicalRecords from './pages/patient/MedicalRecords';

import DoctorPortalLayout from './layouts/DoctorPortalLayout';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import WritePrescription from './pages/doctor/WritePrescription';
import UploadLabReport from './pages/doctor/UploadLabReport';

import AdminPortalLayout from './layouts/AdminPortalLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import InventoryManagement from './pages/admin/InventoryManagement';
import RevenueDashboard from './pages/admin/RevenueDashboard';

import PatientBilling from './pages/patient/PatientBilling';
import PatientTelemedicine from './pages/patient/PatientTelemedicine';
import DoctorTelemedicine from './pages/doctor/DoctorTelemedicine';
import VideoRoom from './pages/telemedicine/VideoRoom';

const ProtectedPatientRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user || user.role !== 'PATIENT') return <Navigate to="/login" replace />;
  return children;
};

const ProtectedDoctorRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user || user.role !== 'DOCTOR') return <Navigate to="/login" replace />;
  return children;
};

const ProtectedAdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user || user.role !== 'ADMIN') return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <Routes>
      {/* Public Website */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        {/* Keep old routes as fallback so existing bookmarks don't break */}
        <Route path="/login/:type" element={<LoginPage />} />
      </Route>

      {/* Patient Portal */}
      <Route path="/portal/patient" element={<ProtectedPatientRoute><PatientPortalLayout /></ProtectedPatientRoute>}>
        <Route path="dashboard" element={<PatientDashboard />} />
        <Route path="book-appointment" element={<BookAppointment />} />
        <Route path="prescriptions" element={<PatientPrescriptions />} />
        <Route path="records" element={<MedicalRecords />} />
        <Route path="billing" element={<PatientBilling />} />
        <Route path="telemedicine" element={<PatientTelemedicine />} />
        <Route path="doctors" element={<div className="card" style={{margin:'2rem'}}><h2>Doctor Search coming soon</h2></div>} />
        <Route path="" element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Doctor Portal */}
      <Route path="/portal/doctor" element={<ProtectedDoctorRoute><DoctorPortalLayout /></ProtectedDoctorRoute>}>
        <Route path="dashboard" element={<DoctorDashboard />} />
        <Route path="appointments" element={<DoctorAppointments />} />
        <Route path="prescribe" element={<WritePrescription />} />
        <Route path="upload-record" element={<UploadLabReport />} />
        <Route path="telemedicine" element={<DoctorTelemedicine />} />
        <Route path="" element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Admin Portal */}
      <Route path="/portal/admin" element={<ProtectedAdminRoute><AdminPortalLayout /></ProtectedAdminRoute>}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="inventory" element={<InventoryManagement />} />
        <Route path="revenue" element={<RevenueDashboard />} />
        <Route path="" element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Standalone Video Room */}
      <Route path="/telemedicine/room/:roomCode" element={<VideoRoom />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
