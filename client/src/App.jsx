import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyCertificate from './pages/public/VerifyCertificate';

import StudentDashboard from './pages/student/Dashboard';
import CourseCatalog from './pages/student/CourseCatalog';
import CourseDetail from './pages/student/CourseDetail';
import LessonPlayer from './pages/student/LessonPlayer';
import Quiz from './pages/student/Quiz';
import ProctoredExam from './pages/student/ProctoredExam';
import StudentProgress from './pages/student/Progress';
import Certificates from './pages/student/Certificates';
import NotificationsPage from './pages/student/Notifications';
import Profile from './pages/student/Profile';

import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminCourses from './pages/admin/Courses';
import CourseCreate from './pages/admin/CourseCreate';
import CourseManage from './pages/admin/CourseManage';
import AdminEnrollments from './pages/admin/Enrollments';
import AdminProctoring from './pages/admin/Proctoring';
import ProctoringDetail from './pages/admin/ProctoringDetail';
import AdminCertificates from './pages/admin/Certificates';
import AdminAnalytics from './pages/admin/Analytics';
import AdminSettings from './pages/admin/Settings';

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <NotificationProvider>
            <Routes>
              <Route path="/" element={<RootRedirect />} />

              {/* Auth */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-certificate/:certificateId" element={<VerifyCertificate />} />

              {/* Student */}
              <Route path="/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
              <Route path="/courses" element={<ProtectedRoute role="student"><CourseCatalog /></ProtectedRoute>} />
              <Route path="/courses/:id" element={<ProtectedRoute role="student"><CourseDetail /></ProtectedRoute>} />
              <Route path="/learn/:courseId/:lessonId" element={<ProtectedRoute role="student"><LessonPlayer /></ProtectedRoute>} />
              <Route path="/quiz/:id" element={<ProtectedRoute role="student"><Quiz /></ProtectedRoute>} />
              <Route path="/proctored-exam/:id" element={<ProtectedRoute role="student"><ProctoredExam /></ProtectedRoute>} />
              <Route path="/progress" element={<ProtectedRoute role="student"><StudentProgress /></ProtectedRoute>} />
              <Route path="/certificates" element={<ProtectedRoute role="student"><Certificates /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute role="student"><NotificationsPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute role="student"><Profile /></ProtectedRoute>} />

              {/* Admin */}
              <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>} />
              <Route path="/admin/courses" element={<ProtectedRoute role="admin"><AdminCourses /></ProtectedRoute>} />
              <Route path="/admin/courses/create" element={<ProtectedRoute role="admin"><CourseCreate /></ProtectedRoute>} />
              <Route path="/admin/courses/:id" element={<ProtectedRoute role="admin"><CourseManage /></ProtectedRoute>} />
              <Route path="/admin/enrollments" element={<ProtectedRoute role="admin"><AdminEnrollments /></ProtectedRoute>} />
              <Route path="/admin/proctoring" element={<ProtectedRoute role="admin"><AdminProctoring /></ProtectedRoute>} />
              <Route path="/admin/proctoring/:sessionId" element={<ProtectedRoute role="admin"><ProctoringDetail /></ProtectedRoute>} />
              <Route path="/admin/certificates" element={<ProtectedRoute role="admin"><AdminCertificates /></ProtectedRoute>} />
              <Route path="/admin/analytics" element={<ProtectedRoute role="admin"><AdminAnalytics /></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute role="admin"><AdminSettings /></ProtectedRoute>} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
