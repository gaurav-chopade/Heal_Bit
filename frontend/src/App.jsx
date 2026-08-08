import { Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "./components/PublicLayout";
import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";

import Home from "./pages/Home";
import PatientLogin from "./pages/auth/PatientLogin";
import PatientRegister from "./pages/auth/PatientRegister";
import HospitalLogin from "./pages/auth/HospitalLogin";
import HospitalRegister from "./pages/auth/HospitalRegister";
import DoctorLogin from "./pages/auth/DoctorLogin";
import AdminLogin from "./pages/auth/AdminLogin";

import PatientDashboard from "./pages/patient/PatientDashboard";
import BrowseHospitals from "./pages/patient/BrowseHospitals";
import HospitalDetails from "./pages/patient/HospitalDetails";
import MyAppointments from "./pages/patient/MyAppointments";
import PatientProfile from "./pages/patient/PatientProfile";
import PatientDocuments from "./pages/patient/PatientDocuments";

import HospitalDashboard from "./pages/hospital/HospitalDashboard";
import ManageDoctors from "./pages/hospital/ManageDoctors";
import HospitalAppointments from "./pages/hospital/HospitalAppointments";
import ManageLeaves from "./pages/hospital/ManageLeaves";
import HospitalProfile from "./pages/hospital/HospitalProfile";

import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";
import DoctorSchedule from "./pages/doctor/DoctorSchedule";
import DoctorLeaves from "./pages/doctor/DoctorLeaves";
import DoctorPatientDocuments from "./pages/doctor/DoctorPatientDocuments";

import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageHospitals from "./pages/admin/ManageHospitals";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageSpecializations from "./pages/admin/ManageSpecializations";
import AdminDoctors from "./pages/admin/AdminDoctors";

export default function App() {
  return (
    <Routes>
      {/* Public pages — top navbar. Redirect to dashboard if already signed in. */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<PublicOnlyRoute><Home /></PublicOnlyRoute>} />
        <Route path="/patient/login" element={<PublicOnlyRoute><PatientLogin /></PublicOnlyRoute>} />
        <Route path="/patient/register" element={<PublicOnlyRoute><PatientRegister /></PublicOnlyRoute>} />
        <Route path="/hospital/login" element={<PublicOnlyRoute><HospitalLogin /></PublicOnlyRoute>} />
        <Route path="/hospital/register" element={<PublicOnlyRoute><HospitalRegister /></PublicOnlyRoute>} />
        <Route path="/doctor/login" element={<PublicOnlyRoute><DoctorLogin /></PublicOnlyRoute>} />
        <Route path="/admin/login" element={<PublicOnlyRoute><AdminLogin /></PublicOnlyRoute>} />
      </Route>

      {/* Authenticated areas — sidebar layout. */}
      <Route element={<DashboardLayout />}>
        {/* Patient */}
        <Route path="/patient" element={<ProtectedRoute allow={["PATIENT"]}><PatientDashboard /></ProtectedRoute>} />
        <Route path="/patient/hospitals" element={<ProtectedRoute allow={["PATIENT"]}><BrowseHospitals /></ProtectedRoute>} />
        <Route path="/patient/hospitals/:id" element={<ProtectedRoute allow={["PATIENT"]}><HospitalDetails /></ProtectedRoute>} />
        <Route path="/patient/appointments" element={<ProtectedRoute allow={["PATIENT"]}><MyAppointments /></ProtectedRoute>} />
        <Route path="/patient/documents" element={<ProtectedRoute allow={["PATIENT"]}><PatientDocuments /></ProtectedRoute>} />
        <Route path="/patient/profile" element={<ProtectedRoute allow={["PATIENT"]}><PatientProfile /></ProtectedRoute>} />

        {/* Hospital */}
        <Route path="/hospital" element={<ProtectedRoute allow={["HOSPITAL"]}><HospitalDashboard /></ProtectedRoute>} />
        <Route path="/hospital/doctors" element={<ProtectedRoute allow={["HOSPITAL"]}><ManageDoctors /></ProtectedRoute>} />
        <Route path="/hospital/appointments" element={<ProtectedRoute allow={["HOSPITAL"]}><HospitalAppointments /></ProtectedRoute>} />
        <Route path="/hospital/leaves" element={<ProtectedRoute allow={["HOSPITAL"]}><ManageLeaves /></ProtectedRoute>} />
        <Route path="/hospital/profile" element={<ProtectedRoute allow={["HOSPITAL"]}><HospitalProfile /></ProtectedRoute>} />

        {/* Doctor */}
        <Route path="/doctor" element={<ProtectedRoute allow={["DOCTOR"]}><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/doctor/appointments" element={<ProtectedRoute allow={["DOCTOR"]}><DoctorAppointments /></ProtectedRoute>} />
        <Route path="/doctor/schedule" element={<ProtectedRoute allow={["DOCTOR"]}><DoctorSchedule /></ProtectedRoute>} />
        <Route path="/doctor/leaves" element={<ProtectedRoute allow={["DOCTOR"]}><DoctorLeaves /></ProtectedRoute>} />
        <Route path="/doctor/patients/:patientId/documents" element={<ProtectedRoute allow={["DOCTOR"]}><DoctorPatientDocuments /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute allow={["ADMIN"]}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/hospitals" element={<ProtectedRoute allow={["ADMIN"]}><ManageHospitals /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allow={["ADMIN"]}><ManageUsers /></ProtectedRoute>} />
        <Route path="/admin/doctors" element={<ProtectedRoute allow={["ADMIN"]}><AdminDoctors /></ProtectedRoute>} />
        <Route path="/admin/specializations" element={<ProtectedRoute allow={["ADMIN"]}><ManageSpecializations /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
