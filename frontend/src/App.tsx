import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

import AuthLayout from './components/layout/AuthLayout';
import DashboardLayout from './components/layout/DashboardLayout';

import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import ResumeAnalyzer from './pages/student/ResumeAnalyzer';
import CompanyDatabase from './pages/student/CompanyDatabase';
import CompanyMatching from './pages/student/CompanyMatching';
import PlacementPrediction from './pages/student/PlacementPrediction';
import SkillGapAnalysis from './pages/student/SkillGapAnalysis';
import RoadmapGenerator from './pages/student/RoadmapGenerator';
import MockInterview from './pages/student/MockInterview';
import FaceAnalysis from './pages/student/FaceAnalysis';
import CareerChatbot from './pages/student/CareerChatbot';
import StudentNotifications from './pages/student/StudentNotifications';

import OfficerDashboard from './pages/officer/OfficerDashboard';
import OfficerStudents from './pages/officer/OfficerStudents';
import OfficerStudentDetail from './pages/officer/OfficerStudentDetail';
import OfficerAnalytics from './pages/officer/OfficerAnalytics';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCompanies from './pages/admin/AdminCompanies';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminSettings from './pages/admin/AdminSettings';

import NotFound from './pages/NotFound';

const ProtectedRoute = ({ children, roles }: { children: React.ReactNode; roles?: string[] }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div></div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />;
  return <>{children}</>;
};

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={
          user?.role === 'admin' ? <AdminDashboard /> :
          user?.role === 'placement_officer' ? <OfficerDashboard /> :
          <StudentDashboard />
        } />
      </Route>

      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/profile" element={<StudentProfile />} />
        <Route path="/resume" element={<ResumeAnalyzer />} />
        <Route path="/companies" element={<CompanyDatabase />} />
        <Route path="/companies/:id" element={<CompanyMatching />} />
        <Route path="/matching" element={<CompanyMatching />} />
        <Route path="/prediction" element={<PlacementPrediction />} />
        <Route path="/skill-gap" element={<SkillGapAnalysis />} />
        <Route path="/roadmap" element={<RoadmapGenerator />} />
        <Route path="/interview" element={<MockInterview />} />
        <Route path="/face-analysis" element={<FaceAnalysis />} />
        <Route path="/chatbot" element={<CareerChatbot />} />
        <Route path="/notifications" element={<StudentNotifications />} />
      </Route>

      <Route element={<ProtectedRoute roles={['placement_officer', 'admin']}><DashboardLayout /></ProtectedRoute>}>
        <Route path="/officer/students" element={<OfficerStudents />} />
        <Route path="/officer/students/:id" element={<OfficerStudentDetail />} />
        <Route path="/officer/analytics" element={<OfficerAnalytics />} />
      </Route>

      <Route element={<ProtectedRoute roles={['admin']}><DashboardLayout /></ProtectedRoute>}>
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/companies" element={<AdminCompanies />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
