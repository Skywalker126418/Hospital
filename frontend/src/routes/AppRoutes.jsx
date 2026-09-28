import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '../components/layout/DashboardLayout';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';

// Receptionist Pages
import ReceptionistDashboard from '../pages/receptionist/ReceptionistDashboard';
import PatientRegistration from '../pages/receptionist/PatientRegistration';
import Patients from '../pages/receptionist/Patients';
import AppointmentBooking from '../pages/receptionist/AppointmentBooking';
import Appointments from '../pages/receptionist/Appointments';

// Doctor Pages
import DoctorDashboard from '../pages/doctor/DoctorDashboard';
import PatientRecords from '../pages/doctor/PatientRecords';
import Consultation from '../pages/doctor/Consultation';
import Prescriptions from '../pages/doctor/Prescriptions';
import LabResults from '../pages/doctor/LabResults';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import Users from '../pages/admin/Users';
import Billing from '../pages/admin/Billing';
import Reports from '../pages/admin/Reports';
import Settings from '../pages/admin/Settings';

// Academic HCI & Prototype Artifacts
import LowFidelityPrototype from '../pages/prototype/LowFidelityPrototype';
import UsabilityEvaluation from '../pages/evaluation/UsabilityEvaluation';

// Root redirector based on authenticated role
const RootRedirector = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'doctor') return <Navigate to="/doctor/dashboard" replace />;
  return <Navigate to="/receptionist/dashboard" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Root entry point */}
      <Route path="/" element={<RootRedirector />} />

      {/* Public Authentication Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Receptionist Workstation Routes */}
      <Route
        path="/receptionist"
        element={
          <ProtectedRoute allowedRoles={['receptionist', 'admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/receptionist/dashboard" replace />} />
        <Route path="dashboard" element={<ReceptionistDashboard />} />
        <Route path="patients" element={<Patients />} />
        <Route path="patients/register" element={<PatientRegistration />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="appointments/book" element={<AppointmentBooking />} />
      </Route>

      {/* Doctor Clinical Workstation Routes */}
      <Route
        path="/doctor"
        element={
          <ProtectedRoute allowedRoles={['doctor', 'admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/doctor/dashboard" replace />} />
        <Route path="dashboard" element={<DoctorDashboard />} />
        <Route path="patients" element={<PatientRecords />} />
        <Route path="patients/:id" element={<PatientRecords />} />
        <Route path="consultation" element={<Consultation />} />
        <Route path="prescriptions" element={<Prescriptions />} />
        <Route path="lab-results" element={<LabResults />} />
      </Route>

      {/* Administrator Station Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="billing" element={<Billing />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Academic HCI Prototype & Usability Evaluation Routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/prototype" element={<LowFidelityPrototype />} />
        <Route path="/evaluation" element={<UsabilityEvaluation />} />
      </Route>

      {/* Wildcard 404 fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
