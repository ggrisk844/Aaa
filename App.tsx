
import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { About, Teachers, Staff, Students, Notices, Gallery, Contact, Events } from './pages/PublicPages';
import { Results } from './pages/Result';
import { Chat } from './pages/Chat';
import { db } from './services/db';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  if (!db.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App = () => {
  useEffect(() => {
    db.init(); // Initialize LocalStorage Data
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Public Routes Wrapped in Layout */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/about" element={<Layout><About /></Layout>} />
        <Route path="/teachers" element={<Layout><Teachers /></Layout>} />
        <Route path="/staff" element={<Layout><Staff /></Layout>} />
        <Route path="/students" element={<Layout><Students /></Layout>} />
        <Route path="/events" element={<Layout><Events /></Layout>} />
        <Route path="/notice" element={<Layout><Notices /></Layout>} />
        <Route path="/gallery" element={<Layout><Gallery /></Layout>} />
        <Route path="/contact" element={<Layout><Contact /></Layout>} />
        <Route path="/results" element={<Layout><Results /></Layout>} />
        
        {/* Chat (Protected for any logged in user) */}
        <Route path="/chat" element={
            <ProtectedRoute>
                <Layout><Chat /></Layout>
            </ProtectedRoute>
        } />
        
        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Admin Routes (Role check handled in dashboard or service usually, but simplified here) */}
        <Route path="/admin/*" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* Catch-all redirect to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
