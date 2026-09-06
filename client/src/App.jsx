import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FamilyProvider } from './context/FamilyContext';
import AppLayout from './components/layout/AppLayout';

import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import OnboardingPage from './pages/onboarding/OnboardingPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import DrugInfoPage from './pages/drug-info/DrugInfoPage';
import DescribeSymptomsPage from './pages/describe-symptoms/DescribeSymptomsPage';
import SafetyCenterPage from './pages/safety-center/SafetyCenterPage';
import FamilyProfilePage from './pages/family-profile/FamilyProfilePage';
import EmergencyGuidePage from './pages/emergency-guide/EmergencyGuidePage';
import DoctorConnectPage from './pages/doctor-connect/DoctorConnectPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import DoctorInboxPage from './pages/doctor-portal/DoctorInboxPage';
import PrescriptionInterpreterPage from './pages/prescription-interpreter/PrescriptionInterpreterPage';
import ScanMedicinePage from './pages/scan-medicine/ScanMedicinePage';
import FutureVisionPage from './pages/future-vision/FutureVisionPage';

const ProtectedRoute = ({ children, requireDoctor = false }) => {
  const { isAuthenticated, isDoctor, loading } = useAuth();
  const tokenExists = isAuthenticated || Boolean(localStorage.getItem('token'));
  const storedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const isDoc = isDoctor || (storedUser?.role === 'doctor');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-slate-300">Loading MedVigil AI...</span>
        </div>
      </div>
    );
  }

  if (!tokenExists) return <Navigate to="/login" replace />;
  if (requireDoctor && !isDoc) return <Navigate to="/dashboard" replace />;
  if (!requireDoctor && isDoc) return <Navigate to="/doctor-portal" replace />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <FamilyProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/onboarding" element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          } />
          
          <Route path="/doctor-portal" element={
            <ProtectedRoute requireDoctor={true}>
              <DoctorInboxPage />
            </ProtectedRoute>
          } />

          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/prescription-interpreter" element={<PrescriptionInterpreterPage />} />
            <Route path="/scan-medicine" element={<ScanMedicinePage />} />
            <Route path="/drug-info" element={<DrugInfoPage />} />
            <Route path="/describe-symptoms" element={<DescribeSymptomsPage />} />
            <Route path="/safety-center" element={<SafetyCenterPage />} />
            <Route path="/family-profile" element={<FamilyProfilePage />} />
            <Route path="/emergency-guide" element={<EmergencyGuidePage />} />
            <Route path="/doctor-connect" element={<DoctorConnectPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/future-vision" element={<FutureVisionPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </FamilyProvider>
    </AuthProvider>
  );
}
