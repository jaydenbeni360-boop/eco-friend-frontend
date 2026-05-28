import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MobileProvider, useMobile } from './context/MobileContext';
import MobileDashboard from './pages/MobileDashboard';
import Scanner from './pages/Scanner';
import PickupLogs from './pages/PickupLogs';
import { SideDrawer } from './components/SideDrawer';
import NotificationOverlay from './components/NotificationOverlay';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import Schedule from './pages/Schedule';
import AdminDashboard from './pages/AdminDashboard';

// Guard: must be logged in
const ProtectedRoute = ({ children }) => {
  const { user } = useMobile();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Guard: must be admin
const AdminRoute = ({ children }) => {
  const { user } = useMobile();
  if (!user) return <Navigate to="/login" replace />;
  if (!user.is_admin) return <Navigate to="/dashboard" replace />;
  return children;
};

const AppLayout = () => {
  const { user, initializing } = useMobile();

  if (initializing) {
    return (
      <div className="fixed inset-0 bg-[#0b0f19] flex flex-col items-center justify-center z-50">
        <div className="relative flex flex-col items-center gap-4 text-center">
          <div className="w-24 h-24 bg-emerald-500/10 rounded-3xl flex items-center justify-center p-3 border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.2)] animate-pulse">
            <img src="/copilot_ 20260525_085633.png" alt="Eco Friend Logo" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-xl font-black text-white tracking-tight mt-2" style={{ fontFamily: "'Sora', sans-serif" }}>
            ECO <span className="text-emerald-500">FRIEND</span>
          </h1>
          <div className="w-16 h-1 bg-emerald-500/20 rounded-full overflow-hidden mt-2 relative">
            <div className="absolute top-0 left-0 h-full bg-emerald-500 rounded-full animate-pulse w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container flex flex-col relative">
      <NotificationOverlay />

      <main className="flex-grow overflow-y-auto pb-28 pt-4">
        <Routes>
          {/* Public routes */}
          <Route path="/login"    element={!user ? <Login />    : <Navigate to={user.is_admin ? '/admin' : '/dashboard'} replace />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" replace />} />

          {/* Admin-only */}
          <Route path="/admin" element={
            <AdminRoute><AdminDashboard /></AdminRoute>
          } />

          {/* User routes */}
          <Route path="/dashboard" element={<ProtectedRoute><MobileDashboard /></ProtectedRoute>} />
          <Route path="/scanner"   element={<ProtectedRoute><Scanner /></ProtectedRoute>} />
          <Route path="/logs"      element={<ProtectedRoute><PickupLogs /></ProtectedRoute>} />
          <Route path="/about"     element={<ProtectedRoute><About /></ProtectedRoute>} />
          <Route path="/schedule"  element={<ProtectedRoute><Schedule /></ProtectedRoute>} />

          {/* Catch-all */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>

      {/* SideDrawer only for non-admin authenticated users */}
      {user && !user.is_admin && <SideDrawer />}
    </div>
  );
};

const App = () => (
  <MobileProvider>
    <Router>
      <AppLayout />
    </Router>
  </MobileProvider>
);

export default App;
