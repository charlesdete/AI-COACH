import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";

import Login from "./features/auth/pages/Login";
import SignUp from "./features/auth/pages/Signup";

import Dashboard from "./roles/teachers/pages/Dashboard";
import LoopRooms from "./roles/teachers/pages/LoopRooms";
import ChatRoom from "./roles/teachers/pages/ChatRoom";
import TeacherMessages from "./roles/teachers/pages/TeacherMessages";

import AdminDashboard from "./roles/admin/pages/AdminDashboard";
import Analytics from "./roles/admin/pages/Analytics";
import Users from "./roles/admin/pages/Users";
import Messages from "./roles/admin/pages/Messages";

import CoachDashboard from "./roles/coach/pages/Dashboard";
import ActiveChats from "./roles/coach/pages/ActiveChats";

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    const redirects: Record<string, string> = { admin: '/admin', coach: '/coach', teacher: '/dashboard' };
    return <Navigate to={redirects[user.role] ?? '/login'} replace />;
  }
  return <>{children}</>;
}

function RootRedirect() {
  const { isAuthenticated, getDefaultRoute } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={getDefaultRoute()} replace />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Root redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* Teacher routes */}
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['teacher']}><Dashboard /></ProtectedRoute>} />
        <Route path="/loop/:topic" element={<ProtectedRoute allowedRoles={['teacher']}><LoopRooms /></ProtectedRoute>} />
        <Route path="/loop/:topic/chat/:roomId" element={<ProtectedRoute allowedRoles={['teacher']}><ChatRoom /></ProtectedRoute>} />
        <Route path="/teacher/messages" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherMessages /></ProtectedRoute>} />

        {/* Admin routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><Analytics /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><Users /></ProtectedRoute>} />
        <Route path="/admin/messages" element={<ProtectedRoute allowedRoles={['admin']}><Messages /></ProtectedRoute>} />

        {/* Coach routes */}
        <Route path="/coach" element={<ProtectedRoute allowedRoles={['coach']}><CoachDashboard /></ProtectedRoute>} />
        <Route path="/coach/chats" element={<ProtectedRoute allowedRoles={['coach']}><ActiveChats /></ProtectedRoute>} />
        <Route path="/coach/chats/:teacherId" element={<ProtectedRoute allowedRoles={['coach']}><ActiveChats /></ProtectedRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </Router>
  );
}
