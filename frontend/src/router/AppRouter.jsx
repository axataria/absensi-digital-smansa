import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { Toaster } from 'react-hot-toast';
import MainLayout from '../components/layout/MainLayout';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import InputAbsensi from '../pages/absensi/InputAbsensi';
import RekapAbsensi from '../pages/absensi/RekapAbsensi';
import SiswaList from '../pages/siswa/SiswaList';
import SiswaUploadCsv from '../pages/siswa/SiswaUploadCsv';
import KelasList from '../pages/kelas/KelasList';
import UserList from '../pages/users/UserList';

function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin()) return <Navigate to="/" replace />;

  return children;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '1rem',
              boxShadow: '0 8px 32px rgba(109,93,246,0.15)',
              fontSize: '14px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            },
            success: {
              iconTheme: { primary: '#22C55E', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: '#fff' },
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<LoginRedirect />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="absensi/input" element={<InputAbsensi />} />
            <Route path="absensi/rekap" element={<RekapAbsensi />} />
            <Route path="siswa" element={<SiswaList />} />
            <Route path="siswa/upload-csv" element={<ProtectedRoute adminOnly><SiswaUploadCsv /></ProtectedRoute>} />
            <Route path="kelas" element={<ProtectedRoute adminOnly><KelasList /></ProtectedRoute>} />
            <Route path="users" element={<ProtectedRoute adminOnly><UserList /></ProtectedRoute>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

function LoginRedirect() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <Login />;
}
